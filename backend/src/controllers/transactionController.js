const { Transaction, User, Bag, sequelize } = require('../models');
const { Payment, MercadoPagoConfig } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const payment = new Payment(client);

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
      const user = await User.findByPk(cliente_id, {
        attributes: ['email'],
        transaction: t
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const valorCaucao = 50.00;

      const body = {
        transaction_amount: valorCaucao,
        description: `Caução Mala #${bag.id} - Fashion Hub`,
        payment_method_id: 'pix',
        payer: {
          email: user.email,
        },
        notification_url: "https://unanswerable-flawiest-junko.ngrok-free.dev",
      };

      const result = await payment.create({ body });

      const transaction = await Transaction.create({
        cliente_id,
        mala_id: bag.id,
        valor_total: valorCaucao,
        status_pagamento: 'processando',
        tipo: 'autorizacao',
        metodo_pagamento: 'pix',
        gateway_id: result.id
      }, { transaction: t });

      return {
        transaction,
        qr_code: result.point_of_interaction.transaction_data.qr_code_base64,
        qr_code_copy: result.point_of_interaction.transaction_data.qr_code
      };
    } catch (error) {
      console.error('Erro na autorização:', error);
      throw new Error('Falha ao gerar pagamento via Pix.');
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