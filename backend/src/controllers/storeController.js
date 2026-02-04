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
};

module.exports = storeController;