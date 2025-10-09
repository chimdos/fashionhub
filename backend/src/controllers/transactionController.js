const { Transaction, User, Bag } = require('../models');

// Objeto para agrupar todas as funções do controller
const transactionController = {
  // Exemplo de função para listar as transações de um usuário
  async getUserTransactions(req, res) {
    try {
      const cliente_id = req.user.userId;

      const transactions = await Transaction.findAll({
        where: { cliente_id },
        include: [
            { model: Bag, as: 'mala' } // Exemplo de associação
        ],
        order: [['data_transacao', 'DESC']]
      });

      res.json(transactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Adicione outras funções de controller para transações aqui...
};

// Exporta o objeto com todas as funções
module.exports = transactionController;
