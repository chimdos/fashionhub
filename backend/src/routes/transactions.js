const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware, requireUserType } = require('../middleware/auth');

router.get(
  '/',
  authMiddleware,
  requireUserType('cliente'),
  transactionController.getUserTransactions
);

router.post(
  '/authorize',
  authMiddleware,
  requireUserType('cliente'),
  transactionController.initiatePayment
);

module.exports = router;