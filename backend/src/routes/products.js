const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, requireUserType } = require('../middleware/auth');

// Rota para listar todos os produtos (pública)
// Usada na HomeScreen do cliente. Ex: GET /api/products?limit=6
router.get('/', productController.getProducts);

// Rota para buscar um produto específico pelo seu ID (pública)
// Usada na ProductDetailScreen. Ex: GET /api/products/uuid-do-produto
router.get('/:id', productController.getProductById);

// Rota para criar um novo produto (protegida, apenas para lojistas)
// Ex: POST /api/products
router.post(
  '/',
  authMiddleware, // Garante que o usuário está logado
  requireUserType('lojista'), // Garante que o usuário é do tipo 'lojista'
  productController.createProduct
);

// No futuro, você pode adicionar mais rotas aqui, como para atualizar ou deletar um produto.
// Ex: router.put('/:id', authMiddleware, requireUserType('lojista'), productController.updateProduct);
// Ex: router.delete('/:id', authMiddleware, requireUserType('lojista'), productController.deleteProduct);

module.exports = router;