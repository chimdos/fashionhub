const { User } = require('../models');
const Joi = require('joi');

const toggleStatusSchema = Joi.object({
    ativo: Joi.boolean().required().messages({
        'boolean.base': 'O status deve ser um valor booleano (true/false).',
        'any.required': 'O campo ativo é obrigatório.'
    })
});

const udpateWorkerSchema = Joi.object({
    nome: Joi.string().min(3).optional(),
    telefone: Joi.string().pattern(/^[0-9]+$/).min(10).optional()
});

const storeController = {
    async getWorkers(req, res) {
        try {
            const workers = await User.findAll({
                where: {
                    loja_id: req.user.loja_id,
                    role: 'worker'
                },
                attributes: ['id', 'nome', 'email', 'telefone', 'ativo', 'data_cadastro'],
                order: [['nome', 'ASC']]
            });

            return res.json(workers);
        } catch (error) {
            console.error('Erro ao buscar ajudantes!', error);
            return res.status(500).json({ error: 'Erro interno ao buscar ajudantes.' });
        }
    },

    async toggleWorkerStatus(req, res) {
        try {
            const { id } = req.params;

            const { error, value } = toggleStatusSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    details: error.details
                });
            }

            const worker = await User.findOne({
                where: { id, loja_id: req.user.loja_id, role: 'worker' }
            });

            if (!worker) {
                return res.status(404).json({ error: 'Ajudante não encontrado nessa loja.' });
            }

            await worker.update({ ativo: value.ativo });

            return res.json({
                message: `Ajudante ${value.ativo ? 'ativado' : 'desativado'} com sucesso!`,
                worker: { id: worker.id, ativo: worker.ativo }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao processar solicitação.' });
        }
    },
};

module.exports = storeController;