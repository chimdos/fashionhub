const { Transaction, User, Bag, sequelize } = require('../models');

const transactionController = {
  async getUserTransactions(req, res) {
    try {
      const cliente_id = req.user.userId;

      const transactions = await Transaction.findAll({
        where: { cliente_id },
        include: [
          { model: Bag, as: 'mala' }
        ],
        order: [['data_transacao', 'DESC']]
      });

      res.json(transactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async authorizePayment(bag, cliente_id, t) {
    try {
      const valorCaucao = 50.00;

      // api do gateway

      const transaction = await Transaction.create({
        cliente_id,
        mala_id: bag.id,
        valor_total: valorCaucao,
        status_pagamento: 'processando',
        tipo: 'autorizacao',
        metodo_pagamento: 'cartao_credito',
        gateway_id: 're_123456'
      }, { transaction: t });

      return transaction;
    } catch (error) {
      console.error('Erro na autorização:', error);
      throw new Error('Falha na pré-autorização do cartão.');
    }
  },
};

module.exports = transactionController;