const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// Rota para buscar o perfil do usuário logado
router.get('/me', authMiddleware, userController.getCurrentUserProfile);

// Adicione outras rotas de usuário aqui (ex: PUT /me para atualizar perfil)

module.exports = router;
