// src/controllers/productController.js

const { Product, ProductVariation, ProductImage, Lojista } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');
const sequelize = require('../config/database');

// --- Esquemas de Validação com Joi ---

// Esquema para a query de listagem de produtos
const getProductsSchema = Joi.object({
  categoria: Joi.string().optional(),
  lojista_id: Joi.string().uuid().optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20) // Limite máximo de 100
});

// Esquema para a criação de um novo produto
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


// --- Controller ---

const productController = {
  /**
   * Listar produtos com filtros, busca e paginação
   */
  async getProducts(req, res) {
    try {
      // 1. Validar a query string
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
          { model: ProductVariation, as: 'variacoes' },
          { model: ProductImage, as: 'imagens', order: [['ordem', 'ASC']] },
          { model: Lojista, as: 'lojista', attributes: ['nome_loja'] } // Supondo um modelo Lojista
        ],
        limit,
        offset,
        order: [['data_cadastro', 'DESC']],
        distinct: true // Importante para contagens corretas com 'include'
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
   * Criar um novo produto (apenas para lojistas)
   */
  async createProduct(req, res) {
    // Inicia a transação
    const t = await sequelize.transaction();

    try {
      // 1. Validar o corpo da requisição
      const { error, value } = createProductSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: 'Dados de entrada inválidos', details: error.details });
      }

      const { nome, descricao, preco, categoria, variacoes, imagens } = value;
      const lojista_id = req.user.userId; // Vem do middleware de autenticação

      if (req.user.tipo_usuario !== 'lojista') {
        return res.status(403).json({ message: 'Acesso negado. Apenas lojistas podem criar produtos.' });
      }

      // 2. Executar operações dentro da transação
      const newProduct = await Product.create({
        lojista_id,
        nome,
        descricao,
        preco,
        categoria
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

      // 3. Se tudo ocorreu bem, confirma a transação
      await t.commit();
      
      // Opcional: buscar o produto recém-criado com suas associações
      const createdProductWithAssociations = await Product.findByPk(newProduct.id, {
          include: ['variacoes', 'imagens']
      });

      res.status(201).json({
        message: 'Produto criado com sucesso',
        product: createdProductWithAssociations
      });

    } catch (error) {
      // 4. Se ocorreu algum erro, desfaz todas as operações
      await t.rollback();
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
};

module.exports = productController;