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

};

module.exports = storeController;