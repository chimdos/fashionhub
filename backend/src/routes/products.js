const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, requireUserType } = require('../middleware/auth');

// --- ROTAS PÚBLICAS ---
// Usada na HomeScreen do cliente. Ex: GET /api/products?limit=6
router.get('/', productController.getProducts);

// Usada na ProductDetailScreen. Ex: GET /api/products/uuid-do-produto
router.get('/:id', productController.getProductById);


// --- ROTAS PROTEGIDAS PARA LOJISTAS ---

// Rota para o lojista criar um novo produto
// Ex: POST /api/products
router.post(
  '/',
  authMiddleware, // Garante que o usuário está logado
  requireUserType('lojista'), // Garante que o usuário é do tipo 'lojista'
  productController.createProduct
);

// --- NOVA ROTA ADICIONADA ---
// Rota para o lojista buscar todos os SEUS produtos
// Ex: GET /api/products/store/my-products
router.get(
  '/store/my-products',
  authMiddleware,
  requireUserType('lojista'),
  productController.getStoreProducts
);

// --- NOVA ROTA ADICIONADA ---
// Rota para o lojista ATUALIZAR um de seus produtos
// Ex: PUT /api/products/uuid-do-produto
router.put(
  '/:id',
  authMiddleware,
  requireUserType('lojista'),
  productController.updateProduct
);

// --- NOVA ROTA ADICIONADA ---
// Rota para o lojista DELETAR um de seus produtos
// Ex: DELETE /api/products/uuid-do-produto
router.delete(
  '/:id',
  authMiddleware,
  requireUserType('lojista'),
  productController.deleteProduct
);

module.exports = router;