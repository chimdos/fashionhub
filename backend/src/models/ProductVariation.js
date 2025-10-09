const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProductVariation extends Model {
    static associate(models) {
      // Uma variação pertence a um produto
      this.belongsTo(models.Product, { foreignKey: 'produto_id', as: 'produto' });
    }
  }

  ProductVariation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tamanho: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantidade_estoque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ProductVariation',
    tableName: 'variacoes_produto',
    timestamps: false
  });

  return ProductVariation;
};

