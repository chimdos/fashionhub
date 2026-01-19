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
};

module.exports = transactionController;