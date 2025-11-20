const { Product, ProductVariation, ProductImage, Lojista, BagItem } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');
const sequelize = require('../config/database');

// --- Esquemas de Validação (Mantidos do seu código original) ---

const getProductsSchema = Joi.object({
  categoria: Joi.string().optional(),
  lojista_id: Joi.string().uuid().optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const createProductSchema = Joi.object({
  nome: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().min(10).required(),
  preco: Joi.number().positive().required(),
  categoria: Joi.string().required(),
  variacoes: Joi.array().items(
    Joi.object({
      tamanho: Joi.string().required(),
      cor: Joi.string().required(),
      quantidade_estoque: Joi.number().integer().min(0).required()
    })
  ).optional().min(1),
  imagens: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      ordem: Joi.number().integer().min(0).optional()
    })
  ).optional().min(1)
});

const updateProductSchema = Joi.object({
  nome: Joi.string().min(3).max(255).optional(),
  descricao: Joi.string().min(10).optional(),
  preco: Joi.number().positive().optional(),
  categoria: Joi.string().optional(),
  ativo: Joi.boolean().optional(),
});


// --- Controller ---

const productController = {
  /**
   * Listar produtos com filtros (público)
   */
  async getProducts(req, res) {
    try {
      const { error, value } = getProductsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({ message: 'Dados de entrada inválidos', details: error.details });
      }
      const { categoria, lojista_id, search, page, limit } = value;
      const offset = (page - 1) * limit;
      const whereClause = { ativo: true };
      if (categoria) whereClause.categoria = categoria;
      if (lojista_id) whereClause.lojista_id = lojista_id;
      if (search) {
        whereClause[Op.or] = [
          { nome: { [Op.iLike]: `%${search}%` } },
          { descricao: { [Op.iLike]: `%${search}%` } }
        ];
      }
      const { count, rows } = await Product.findAndCountAll({
        where: whereClause,
        include: [
          { model: Lojista, as: 'lojista', attributes: ['nome_loja'] }
        ],
        limit,
        offset,
        order: [['data_cadastro', 'DESC']],
        distinct: true
      });
      res.json({
        products: rows,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  /**
   * Buscar um único produto pelo ID (público)
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [
          { model: ProductVariation, as: 'variacoes' },
          { model: ProductImage, as: 'imagens', order: [['ordem', 'ASC']] },
          { model: Lojista, as: 'lojista', attributes: ['id', 'nome_loja'] }
        ]
      });
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      res.json(product);
    } catch (error) {
      console.error(`Erro ao buscar produto ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  /**
   * Criar um novo produto (protegido para lojista)
   */
  async createProduct(req, res) {
    const t = await sequelize.transaction();
    try {
      const { error, value } = createProductSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: 'Dados de entrada inválidos', details: error.details });
      }
      const { nome, descricao, preco, categoria, variacoes, imagens } = value;
      const lojista_id = req.user.userId;
      if (req.user.tipo_usuario !== 'lojista') {
        return res.status(403).json({ message: 'Acesso negado. Apenas lojistas podem criar produtos.' });
      }
      const newProduct = await Product.create({
        lojista_id, nome, descricao, preco, categoria
      }, { transaction: t });
      if (variacoes && variacoes.length > 0) {
        const variacoesData = variacoes.map(v => ({ ...v, produto_id: newProduct.id }));
        await ProductVariation.bulkCreate(variacoesData, { transaction: t });
      }
      if (imagens && imagens.length > 0) {
        const imagensData = imagens.map((img, index) => ({
          produto_id: newProduct.id,
          url_imagem: img.url,
          ordem: img.ordem !== undefined ? img.ordem : index
        }));
        await ProductImage.bulkCreate(imagensData, { transaction: t });
      }
      await t.commit();
      const createdProductWithAssociations = await Product.findByPk(newProduct.id, {
          include: ['variacoes', 'imagens']
      });
      res.status(201).json({
        message: 'Produto criado com sucesso',
        product: createdProductWithAssociations
      });
    } catch (error) {
      await t.rollback();
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  /**
   * Busca todos os produtos que pertencem ao lojista logado.
   */
  async getStoreProducts(req, res) {
    try {
      const lojista_id = req.user.userId;
      const products = await Product.findAll({
        where: { lojista_id },
        include: ['variacoes', 'imagens'], // Inclui variações e imagens
        order: [['data_cadastro', 'DESC']]
      });
      res.json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos da loja:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  /**
   * Atualiza um produto existente que pertence ao lojista.
   */
  async updateProduct(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params; // ID do produto
      const lojista_id = req.user.userId;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      // Verifica se o lojista é o dono do produto
      if (product.lojista_id !== lojista_id) {
        return res.status(403).json({ message: 'Acesso negado. Você não é o dono deste produto.' });
      }

      const { error, value } = updateProductSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: 'Dados de entrada inválidos', details: error.details });
      }

      await product.update(value, { transaction: t });
      // Lógica mais complexa de atualização de variações e imagens pode ser adicionada aqui
      await t.commit();

      res.json({ message: 'Produto atualizado com sucesso.', product });

    } catch (error) {
      await t.rollback();
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  /**
   * Deleta um produto que pertence ao lojista.
   */
  async deleteProduct(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const lojista_id = req.user.userId;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      if (product.lojista_id !== lojista_id) {
        return res.status(403).json({ message: 'Acesso negado.' });
      }

      // Deleta as associações primeiro.
      // NOTA: Se uma variação de produto estiver em uma mala (tabela 'itens_mala'),
      // o 'ON DELETE RESTRICT' do seu SQL irá corretamente impedir a exclusão
      // e o 'catch' irá tratar o erro.
      await ProductImage.destroy({ where: { produto_id: id }, transaction: t });
      await ProductVariation.destroy({ where: { produto_id: id }, transaction: t });
      
      // Deleta o produto principal
      await product.destroy({ transaction: t });

      await t.commit();
      res.status(200).json({ message: 'Produto deletado com sucesso.' });

    } catch (error) {
      await t.rollback();
      // Verifica se é um erro de chave estrangeira (produto em uma mala)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        console.error('Erro ao deletar produto: está em uma mala ativa.', error);
        return res.status(400).json({ message: 'Não é possível deletar este produto, pois ele está associado a uma mala ativa.' });
      }
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
};

module.exports = productController;