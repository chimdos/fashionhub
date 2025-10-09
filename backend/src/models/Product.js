const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      // Um Produto pertence a um Lojista
      this.belongsTo(models.Lojista, {
        foreignKey: 'lojista_id',
        as: 'lojista'
      });

      // Um Produto tem muitas Variações
      this.hasMany(models.ProductVariation, {
        foreignKey: 'produto_id',
        as: 'variacoes'
      });

      // Um Produto tem muitas Imagens
      this.hasMany(models.ProductImage, {
        foreignKey: 'produto_id',
        as: 'imagens'
      });
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0.01
      }
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
    // Os campos lojista_id e data_cadastro são gerenciados pelas opções abaixo
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'produtos',
    timestamps: true,
    createdAt: 'data_cadastro',
    updatedAt: false,
    defaultScope: {
      where: {
        ativo: true
      }
    },
    scopes: {
      all: {
        where: {}
      }
    },
    indexes: [
      { fields: ['lojista_id'] },
      { fields: ['categoria'] }
    ]
  });

  return Product;
};

