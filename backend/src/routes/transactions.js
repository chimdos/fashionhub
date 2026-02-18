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

router.get('/debug-ids', async (req, res) => {
  const { User, Bag, Loja } = require('../models');
  
  const usuarios = await User.findAll({ attributes: ['id', 'nome', 'email'] });
  const malas = await Bag.findAll({ attributes: ['id', 'status'] });
  const lojas = await Loja.findAll({ attributes: ['id', 'nome_loja'] });

  res.json({ usuarios, malas, lojas });
});

module.exports = router;