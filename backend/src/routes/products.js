const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, requireUserType } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = require('../config/multer');

router.get('/', productController.getProducts);

router.get('/search-store', authMiddleware, productController.searchStoreProducts);

router.get(
  '/store/my-products',
  authMiddleware,
  requireUserType('lojista'),
  productController.getStoreProducts
);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  authMiddleware,
  requireUserType('lojista'),
  upload.array('imagens', 5),
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  requireUserType('lojista'),
  productController.updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  requireUserType('lojista'),
  productController.deleteProduct
);

router.put('/:id', authMiddleware, upload.array('files'), productController.updateProduct);

module.exports = router;