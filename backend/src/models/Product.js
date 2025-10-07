// src/models/Product.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  lojista_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lojistas',
      key: 'id'
    }
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false // CORRIGIDO
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { // CORRIGIDO - Garante que o preço é positivo
      isDecimal: true,
      min: 0.01
    }
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'produtos',
  timestamps: false,
  
  // SUGESTÃO: Escopo padrão para buscar apenas produtos ativos.
  // Isso simplifica os controllers, que não precisarão adicionar 'where: { ativo: true }' sempre.
  defaultScope: {
    where: {
      ativo: true
    }
  },
  scopes: {
    // Escopo para buscar todos os produtos, incluindo os inativos (para painéis de admin, etc.)
    all: {
      where: {}
    }
  },

  // SUGESTÃO: Definir índices diretamente no modelo
  indexes: [
    {
      fields: ['lojista_id']
    },
    {
      fields: ['categoria']
    }
  ]
});

// MELHORIA: Definindo as associações do modelo
Product.associate = (models) => {
  // Um Produto pertence a um Lojista
  Product.belongsTo(models.Lojista, {
    foreignKey: 'lojista_id',
    as: 'lojista' // O mesmo 'as' que você usou no controller
  });

  // Um Produto tem muitas Variações
  Product.hasMany(models.ProductVariation, {
    foreignKey: 'produto_id',
    as: 'variacoes' // O mesmo 'as' do controller
  });

  // Um Produto tem muitas Imagens
  Product.hasMany(models.ProductImage, {
    foreignKey: 'produto_id',
    as: 'imagens' // O mesmo 'as' do controller
  });
};

module.exports = Product;