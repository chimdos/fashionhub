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

  async captureFinalPayment(bag, t) {
    try {
      const valorFinal = bag.itens
        .filter(i => i.status_item === 'COMPRADO')
        .reduce((acc, i) => acc + Number(i.preco_unitario_mala), 0);

      const frete = 15.00;
      const taxaSeguro = valorFinal * 0.05;

      const totalACobrar = valorFinal + frete + taxaSeguro;

      // gateway call

      await Transaction.create({
        cliente_id: bag.cliente_id,
        mala_id: bag.id,
        valor_total: totalACobrar,
        valor_itens: valorFinal,
        valor_frete: frete,
        taxa_seguro: taxaSeguro,
        status_pagamento: 'aprovado',
        tipo: 'captura',
        metodo_pagamento: 'cartao_credito'
      }, { transaction: t });

      return true;
    } catch (error) {
      console.error('Erro na captura final:', error);
      throw new Error('Erro ao processar pagamento final.');
    }
  },
};

module.exports = transactionController;