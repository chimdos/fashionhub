const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authMiddleware, requireUserType, requireRole } = require('../middleware/auth');

router.use(authMiddleware);
router.use(requireUserType('lojista'));

router.get('/dashboard', storeController.getOverview);
router.get('/revenue', requireRole(['admin']), storeController.getDetailedRevenue);
router.get('/workers', requireRole(['admin']), storeController.getWorkers);
router.post('/workers', requireRole(['admin']), storeController.registerWorker);

router.put('/workers/:id', requireRole(['admin']), storeController.updateWorker);
router.patch('/workers/:id/status', requireRole(['admin']), storeController.toggleWorkerStatus);
router.delete('/workers/:id', requireRole(['admin']), storeController.deleteWorker);

module.exports = router;