const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BagItem extends Model {
    static associate(models) {
      this.belongsTo(models.Bag, { foreignKey: 'mala_id', as: 'mala' });
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
      type: DataTypes.ENUM('INCLUIDO', 'NAO_INCLUIDO', 'COMPRADO', 'DEVOLVIDO'),
      allowNull: false,
      defaultValue: 'NAO_INCLUIDO'
    },
    preco_unitario_mala: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_extra: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'BagItem',
    tableName: 'itens_mala',
    timestamps: false
  });

  return BagItem;
};