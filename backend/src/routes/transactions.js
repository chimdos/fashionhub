const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware, requireUserType } = require('../middleware/auth');

// Rota para o cliente ver seu histórico de transações
router.get(
  '/',
  authMiddleware,
  requireUserType('cliente'),
  transactionController.getUserTransactions
);

module.exports = router;
