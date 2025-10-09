const express = require('express');
const router = express.Router();
const bagController = require('../controllers/bagController');
const { authMiddleware, requireUserType } = require('../middleware/auth');

// Rota para um cliente solicitar uma nova mala (protegida, apenas para clientes)
router.post(
  '/',
  authMiddleware,
  requireUserType('cliente'),
  bagController.createBagRequest
);

// Rota para o cliente confirmar a compra/devolução (protegida, apenas para clientes)
router.put(
  '/:bagId/confirm-purchase',
  authMiddleware,
  requireUserType('cliente'),
  bagController.confirmPurchase
);

// Rota para o lojista confirmar o retorno da mala (protegida, apenas para lojistas)
router.put(
  '/:bagId/confirm-return',
  authMiddleware,
  requireUserType('lojista'),
  bagController.confirmReturn
);


module.exports = router;
