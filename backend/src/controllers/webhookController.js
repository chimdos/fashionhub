const { Transaction, Bag, sequelize } = require('../models');
const { Payment, MercadoPagoConfig } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const payment = new Payment(client);

const webhookController = {
    async handle(req, res) {
        const { action, data } = req.body;

        if (action !== 'payment.created' && action !== 'payment.updated') {
            return res.status(200).send('OK');
        }

        const paymentId = data?.id;
        if (!paymentId) {
            return res.status(400).send('ID do pagamento não encontrado');
        }

        const t = await sequelize.transaction();

        try {
            const mpPayment = await payment.get({ id: paymentId });
            const mpStatus = mpPayment.status;

            const transaction = await Transaction.findOne({
                where: { gateway_id: paymentId.toString() }
            });

            if (!transaction) {
                await t.rollback();
                return res.status(404).send('Transação não localizada no Fashion Hub');
            }

            switch (mpStatus) {
                case 'approved':
                    await transaction.update({ status_pagamento: 'aprovado' }, { transaction: t });

                    await Bag.update(
                        { status_mala: 'PAGO' },
                        { where: { id: transaction.mala_id }, transaction: t }
                    );
                    break;

                case 'rejected':
                case 'cancelled':
                    await transaction.update({ status_pagamento: 'falhou' }, { transaction: t });
                    break;

                case 'pending':
                case 'in_process':
                    await transaction.update({ status_pagamento: 'processando' }, { transaction: t });
                    break;

                default:
                    console.log(`Status não mapeado: ${mpStatus}`);
            }

            await t.commit();
            res.status(200).send('Webhook processado');

        } catch (error) {
            if (t) await t.rollback();
            console.error('Erro crítico no processamento do webhook:', error);
            res.status(500).send('Erro interno no servidor');
        }
    }
};

module.exports = webhookController;