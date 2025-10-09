const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BagItem extends Model {
    static associate(models) {
      // Um item da mala pertence a uma mala
      this.belongsTo(models.Bag, { foreignKey: 'mala_id', as: 'mala' });
      // Um item da mala está associado a uma variação de produto específica
      this.belongsTo(models.ProductVariation, { foreignKey: 'variacao_produto_id', as: 'variacao_produto' });
    }
  }

  BagItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quantidade_solicitada: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantidade_incluida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status_item: {
      type: DataTypes.ENUM('incluido', 'comprado', 'devolvido', 'nao_incluido'),
      allowNull: false,
      defaultValue: 'nao_incluido'
    },
    preco_unitario_mala: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'BagItem',
    tableName: 'itens_mala',
    timestamps: false
  });

  return BagItem;
};

