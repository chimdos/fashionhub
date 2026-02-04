const { User } = require('../models');
const Joi = require('joi');

const toggleStatusSchema = Joi.object({
    ativo: Joi.boolean().required().messages({
        'boolean.base': 'O status deve ser um valor booleano (true/false).',
        'any.required': 'O campo ativo é obrigatório.'
    })
});

const updateWorkerSchema = Joi.object({
    nome: Joi.string().min(3).optional(),
    telefone: Joi.string().pattern(/^[0-9]+$/).min(10).optional()
});

const registerWorkerSchema = Joi.object({
    nome: Joi.string().min(3).required().messages({
        'string.min': 'O nome deve ter pelo menos 3 caracteres.',
        'any.required': 'O nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Informe um e-mail válido.',
        'any.required': 'O e-mail é obrigatório.'
    }),
    senha: Joi.string().min(8).required().messages({
        'string.min': 'A senha deve ter pelo menos 8 caracteres.',
        'any.required': 'A senha é obrigatória.'
    }),
    telefone: Joi.string().pattern(/^[0-9]+$/).min(10).required().messages({
        'string.pattern.base': 'O telefone deve conter apenas números.',
        'any.required': 'O telefone é obrigatório.'
    })
})

const storeController = {
    async registerWorker(req, res) {
        try {
            const { error, value } = registerWorkerSchema.validate(req.body, { stripUnknown: true });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos!',
                    details: error.details
                });
            }

            const { nome, email, senha, telefone } = value;
            const adminLojaId = req.user.loja_id;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Este e-mail já está sendo utilizado!' });
            }

            const newWorker = await User.create({
                nome,
                email,
                senha_hash: senha,
                telefone,
                tipo_usuario: 'lojista',
                loja_id: adminLojaId,
                role: 'worker',
                ativo: true
            });

            const workerResponse = newWorker.toJSON();
            delete workerResponse.senha_hash;

            return res.status(201).json({
                message: 'Ajudante cadastrado!',
                worker: workerResponse
            });
        } catch (error) {
            console.error('Erro ao registrar ajudante!', error);
            return res.status(500).json({ message: 'Erro interno ao cadastrar ajudante.' });
        }
    },

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

    async deleteWorker(req, res) {
        try {
            const { id } = req.params;

            const worker = await User.findOne({
                where: { id, loja_id: req.user.loja_id, role: 'worker' }
            });

            if (!worker) {
                return res.status(404).json({ error: 'Ajudante não encontrado.' });
            }

            await worker.destroy();
            return res.json({ message: 'Ajudante removido da equipe!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao remover ajudante.' });
        }
    },


    async updateWorker(req, res) {
        try {
            const { id } = req.params;

            const { error, value } = updateWorkerSchema.validate(req.body, { stripUnknown: true });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos!',
                    details: error.details
                });
            }

            const worker = await User.findOne({
                where: { id, loja_id: req.user.loja_id, role: 'worker' }
            });

            if (!worker) {
                return res.status(404).json({ error: 'Ajudante não encontrado nesta loja.' });
            }

            await worker.update(value);

            return res.json({
                message: 'Dados atualizados!',
                worker: {
                    id: worker.id,
                    nome: worker.nome,
                    telefone: worker.telefone,
                    email: worker.email
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar ajudante:', error);
            return res.status(500).json({ error: 'Erro interno ao atualizar ajudante.' });
        }
    },
};

module.exports = storeController;