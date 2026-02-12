const { Transaction, Bag, sequelize } = require('../models');

const webhookController = {
    async handle(req, res) {
        const event = req.body;

        const t = await sequelize.transaction();

        try {
            const gatewayId = event.data?.id || event.id;
            const eventType = event.type || event.action;

            const transaction = await Transaction.findOne({
                where: { gateway_id: gatewayId }
            });

            if (!transaction) {
                return res.status(404).json({ message: 'Transação não encontrada' });
            }

            switch (eventType) {
                case 'payment_intent.succeeded':
                case 'payment.approved':
                    await transaction.update({ status_pagamento: 'aprovado' }, { transaction: t });

                    await Bag.update(
                        { status_mala: 'PAGO' },
                        { where: { id: transaction.mala_id }, transaction: t }
                    );
                    break;

                case 'payment_intent.payment_falied':
                case 'payment.rejected':
                    await transaction.update({ status_pagamento: 'falhou' }, { transaction: t });
                    break;

                default:
                    console.log(`Evento não monitorado: ${EventType}`);
            }

            await t.commit();

            res.status(200).send('Webhook processado com sucesso');
        } catch (error) {
            await t.rollback();
            console.error('Erro no processamento do webhook:', error);
            res.status(500).send('Erro interno');
        }
    }
};

module.exports = webhookController