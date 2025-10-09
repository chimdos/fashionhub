const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation'); // Supondo que você tenha um middleware de validação

// Rota para registrar um novo usuário
router.post('/register', authController.register);

// Rota para fazer login
router.post('/login', authController.login);

module.exports = router;
