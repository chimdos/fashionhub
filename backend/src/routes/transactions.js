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
  const { User, Bag, Loja, BagItem, Product, ProductVariation } = require('../models');

  const usuarios = await User.findAll({ attributes: ['id', 'nome', 'email'] });
  const malas = await Bag.findAll();
  const lojas = await Loja.findAll({ attributes: ['id', 'nome_loja'] });
  const produtos = await Product.findAll({ attributes: ['id', 'nome', 'preco'] });
  const variacoes = await ProductVariation.findAll({ attributes: ['id', 'produto_id', 'tamanho', 'cor'] });
  const itensMala = await BagItem.findAll({ attributes: ['id', 'mala_id', 'variacao_produto_id', 'status_item'] });

  res.json({ usuarios, malas, lojas, produtos, variacoes, itensMala });
});

module.exports = router;