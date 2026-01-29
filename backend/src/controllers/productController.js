const { Product, ProductVariation, ProductImage, Lojista, BagItem, sequelize } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');
const fs = require('fs').promises;
const path = require('path');

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
      quantidade_estoque: Joi.number().integer().min(0).required(),
      preco: Joi.number().optional().allow(null)
    })
  ).required().min(1)
});

const updateProductSchema = Joi.object({
  nome: Joi.string().min(3).max(255).optional(),
  descricao: Joi.string().min(10).optional(),
  preco: Joi.number().positive().optional(),
  categoria: Joi.string().optional(),
  estoque: Joi.number().integer().min(0).optional().messages({
    'number.base': 'O estoque deve ser um número',
    'number.integer': 'O estoque não pode ter casas decimais'
  }),
  ativo: Joi.boolean().optional(),
});

const productController = {
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
          { model: Lojista, as: 'lojista', attributes: ['nome_loja'] },
          { model: ProductImage, as: 'imagens' }
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

  async createProduct(req, res) {
    console.log("--- DADOS RECEBIDOS NO BACKEND ---");
    console.log("BODY:", req.body);
    console.log("CATEGORIA TIPO:", typeof req.body.categoria);
    console.log("----------------------------------");
    const t = await sequelize.transaction();
    try {
      if (typeof req.body.variacoes === 'string') {
        req.body.variacoes = JSON.parse(req.body.variacoes);
      }

      if (Array.isArray(req.body.categoria)) {
        req.body.categoria = req.body.categoria[0];
      }

      const { error, value } = createProductSchema.validate(req.body, { stripUnknown: true });

      if (error) {
        if (t) await t.rollback();
        return res.status(400).json({ message: 'Dados inválidos', details: error.details });
      }

      const files = req.files;
      if (!files || files.length === 0) {
        if (t) await t.rollback();
        return res.status(400).json({ message: 'Pelo menos uma imagem é obrigatória.' });
      }

      const { variacoes, ...productData } = value;

      const formattedImages = files.map((file, index) => ({
        url_imagem: `/uploads/${file.filename}`,
        ordem: index
      }));

      const newProduct = await Product.create({
        ...productData,
        lojista_id: req.user.userId,
        variacoes: variacoes,
        imagens: formattedImages,
      }, {
        include: [
          { model: ProductVariation, as: 'variacoes' },
          { model: ProductImage, as: 'imagens' }
        ],
        transaction: t
      });

      await t.commit();
      return res.status(201).json({
        message: 'Produto criado com sucesso!',
        product: newProduct
      });

    } catch (error) {
      if (t) await t.rollback();
      console.error('Erro real no backend:', error);
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  },

  async getStoreProducts(req, res) {
    try {
      const lojista_id = req.user.userId;
      const products = await Product.findAll({
        where: { lojista_id },
        include: ['variacoes', 'imagens'],
        order: [['data_cadastro', 'DESC']]
      });
      res.json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos da loja:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async updateProduct(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const lojista_id = req.user.userId;

      const product = await Product.findByPk(id);
      if (!product || product.lojista_id !== lojista_id) {
        await t.rollback();
        return res.status(404).json({ message: 'Produto não encontrado ou acesso negado.' });
      }

      if (req.body.variacoes) req.body.variacoes = JSON.parse(req.body.variacoes);
      if (req.body.deletedImageIds) req.body.deletedImageIds = JSON.parse(req.body.deletedImageIds);

      const { error, value } = updateProductSchema.validate(req.body);
      if (error) {
        await t.rollback();
        return res.status(400).json({ message: 'Dados inválidos', details: error.details });
      }

      const { nome, descricao, preco, categoria, variacoes, deletedImageIds } = value;
      let filesToRemove = [];

      if (deletedImageIds && deletedImageIds.length > 0) {
        const imagesFromDb = await ProductImage.findAll({
          where: { id: deletedImageIds, produto_id: id }
        });

        filesToRemove = imagesFromDb.map(img => {
          const parts = img.url_imagem.split('/');
          return parts[parts.length - 1];
        });

        await ProductImage.destroy({
          where: { id: deletedImageIds, produto_id: id },
          transaction: t
        });
      }

      await product.update({
        nome: nome || product.nome,
        descricao: descricao || product.descricao,
        preco: preco ? parseFloat(preco) : product.preco,
        categoria: categoria || product.categoria,
        estoque: estoque !== undefined ? parseInt(estoque) : product.estoque
      }, { transaction: t });

      if (req.files && req.files.length > 0) {
        const imageRecords = req.files.map((file, index) => ({
          produto_id: id,
          url_imagem: `/uploads/${file.filename}`,
          ordem: index
        }));
        await ProductImage.bulkCreate(imageRecords, { transaction: t });
      }

      if (variacoes && variacoes.length > 0) {
        await ProductVariation.destroy({ where: { produto_id: id }, transaction: t });
        const variationsWithId = variacoes.map(v => ({
          ...v,
          produto_id: id
        }));
        await ProductVariation.bulkCreate(variationsWithId, { transaction: t });
      }

      await t.commit();

      filesToRemove.forEach(async (filename) => {
        try {
          const filePath = path.resolve(__dirname, '..', '..', 'uploads', filename);
          await fs.unlink(filePath);
        } catch (err) { console.error(`Erro ao remover arquivo:`, err); }
      });

      return res.json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
      if (t && !t.finished) await t.rollback();
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

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

      await ProductImage.destroy({ where: { produto_id: id }, transaction: t });
      await ProductVariation.destroy({ where: { produto_id: id }, transaction: t });

      await product.destroy({ transaction: t });

      await t.commit();
      res.status(200).json({ message: 'Produto deletado com sucesso.' });

    } catch (error) {
      await t.rollback();
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