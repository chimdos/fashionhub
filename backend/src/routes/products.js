const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, requireUserType } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

router.get('/', productController.getProducts);

router.get('/:id', productController.getProductById);

router.post(
  '/',
  authMiddleware,
  requireUserType('lojista'),
  upload.array('imagens', 5),
  productController.createProduct
);

router.get(
  '/store/my-products',
  authMiddleware,
  requireUserType('lojista'),
  productController.getStoreProducts
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

module.exports = router;