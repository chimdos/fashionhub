const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/StoreController');
const { authMiddleware, requireUserType, requireRole } = require('../middleware/auth');

router.use(authMiddleware);
router.use(requireUserType('lojista'));

router.get('/dashboard', StoreController.getOverview);
router.get('/revenue', requireRole('admin'), StoreController.getDetailedRevenue);
router.post('/register-worker', authMiddleware, requireUserType('lojista'), requireRole('admin'));

module.exports = router;