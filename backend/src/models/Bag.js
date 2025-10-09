const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Bag extends Model {
    static associate(models) {
      // Uma mala pertence a um cliente
      this.belongsTo(models.User, { foreignKey: 'cliente_id', as: 'cliente' });
      // Uma mala pode pertencer a um entregador
      this.belongsTo(models.User, { foreignKey: 'entregador_id', as: 'entregador' });
      // Uma mala tem um endereço de entrega
      this.belongsTo(models.Address, { foreignKey: 'endereco_entrega_id', as: 'endereco_entrega' });
      // Uma mala tem muitos itens
      this.hasMany(models.BagItem, { foreignKey: 'mala_id', as: 'itens' });
    }
  }

  Bag.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    status: {
      type: DataTypes.ENUM(
        'solicitada',
        'em_preparacao',
        'a_caminho',
        'entregue_cliente',
        'em_devolucao',
        'devolvida_lojista',
        'finalizada',
        'cancelada'
      ),
      allowNull: false
    },
    data_solicitacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    data_entrega_cliente: {
      type: DataTypes.DATE
    },
    data_devolucao_lojista: {
      type: DataTypes.DATE
    },
    observacoes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Bag',
    tableName: 'malas',
    timestamps: false
  });

  return Bag;
};

