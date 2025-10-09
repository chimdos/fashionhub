const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, requireUserType } = require('../middleware/auth');

// Rota para listar todos os produtos (pública)
router.get('/', productController.getProducts);

// Rota para criar um novo produto (protegida, apenas para lojistas)
router.post(
  '/',
  authMiddleware,
  requireUserType('lojista'),
  productController.createProduct
);

// Adicione outras rotas de produto aqui (ex: GET /:id, PUT /:id, DELETE /:id)

module.exports = router;
