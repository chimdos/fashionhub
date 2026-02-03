const express = require('express');
const router = express.Router();
const bagController = require('../controllers/bagController');
const { authMiddleware, requireUserType, requireRole } = require('../middleware/auth');

router.get('/store', authMiddleware, requireUserType('lojista'), bagController.getStoreBagRequests);
router.get('/available', authMiddleware, bagController.getAvailableDeliveries);
router.get('/active-deliveries', authMiddleware, bagController.getActiveDeliveries);
router.get('/', authMiddleware, bagController.getClientBags);
router.post('/', authMiddleware, requireUserType('cliente'), bagController.createBagRequest);
router.get('/finalize-selection', authMiddleware, bagController.finalizeSelection);
router.get('/active-with-client', authMiddleware, bagController.getActiveWithClient);
router.get('/pending', authMiddleware, requireUserType('lojista'), requireRole(['admin', 'worker']), bagController.getPending);
router.get('/stats', authMiddleware, requireUserType('lojista'), requireRole(['admin', 'worker']), bagController.getStats);

router.get('/:bagId', authMiddleware, bagController.getBagById);
router.post('/:bagId/confirm-purchase', authMiddleware, requireUserType('cliente'), bagController.confirmPurchase);
router.post('/:bagId/store-action', authMiddleware, requireUserType('lojista'), bagController.updateStatusByStore);
router.post('/:bagId/accept', authMiddleware, requireUserType('entregador'), bagController.acceptDelivery);
router.post('/:bagId/request-courier', authMiddleware, requireUserType('lojista'), bagController.requestCourier);
router.post('/:bagId/confirm-pickup', authMiddleware, bagController.confirmPickup);
router.post('/:bagId/confirm-delivery', authMiddleware, bagController.confirmDelivery);
router.put('/:bagId/confirm-return', authMiddleware, requireUserType('lojista'), bagController.confirmReturn);

module.exports = router;