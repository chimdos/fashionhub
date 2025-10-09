const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Transaction extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'cliente_id', as: 'cliente' });
      this.belongsTo(models.Bag, { foreignKey: 'mala_id', as: 'mala' });
    }
  }

  Transaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    valor_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status_pagamento: {
      type: DataTypes.ENUM('pendente', 'processando', 'aprovado', 'recusado', 'estornado'),
      allowNull: false
    },
    metodo_pagamento: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transacoes',
    timestamps: true,
    createdAt: 'data_transacao',
    updatedAt: false
  });

  return Transaction;
};
