const express = require('express');
const router = express.Router();
const bagController = require('../controllers/bagController');
const { authMiddleware, requireUserType } = require('../middleware/auth');

// Rota para um cliente criar uma nova solicitação de mala
router.post(
  '/',
  authMiddleware,
  requireUserType('cliente'),
  bagController.createBagRequest
);

// Rota para o cliente confirmar a compra/devolução
router.put(
  '/:bagId/confirm-purchase',
  authMiddleware,
  requireUserType('cliente'),
  bagController.confirmPurchase
);

// Rota para o lojista confirmar o retorno da mala
router.put(
  '/:bagId/confirm-return',
  authMiddleware,
  requireUserType('lojista'),
  bagController.confirmReturn
);

// Rota para o lojista buscar as solicitações de malas pendentes da sua loja
router.get(
  '/store', // O endpoint será GET /api/bags/store
  authMiddleware,
  requireUserType('lojista'), // Apenas lojistas podem acessar
  bagController.getStoreBagRequests // Chama a nova função do controller
);
// Rota para o entregador aceitar a entrega
router.post('/:bagId/accept', authMiddleware, bagController.acceptDelivery);
router.post('/:bagId/confirm-pickup', authMiddleware, bagController.confirmPickup);

module.exports = router;