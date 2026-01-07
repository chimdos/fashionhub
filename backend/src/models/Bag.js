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
        'SOLICITADA',
        'ANALISE',
        'RECUSADA',
        'PREPARANDO',
        'AGUARDANDO_MOTO',
        'EM_ROTA_ENTREGA',
        'ENTREGUE',
        'EM_ROTA_DEVOLUCAO',
        'FINALIZADA',
        'CANCELADA'
      ),
      defaultValue: 'SOLICITADA',
      allowNull: false
    },

    token_retirada: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    token_entrega: {
      type: DataTypes.STRING(6),
      allowNull: true
    },

    motivo_recusa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    valor_frete: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
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