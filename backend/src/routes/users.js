const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

router.get('/me', authMiddleware, userController.getCurrentUserProfile);
router.put('/:id', authMiddleware, userController.updateUser);
router.put('/become-courier', authMiddleware, userController.becomeCourier);
router.put('/store/profile', authMiddleware, userController.updateStoreProfile);
router.put('/responsible', authMiddleware, userController.updateResponsibleData);
router.put('/store/address', authMiddleware, userController.updateStoreAddress);
router.put('/change-password', authMiddleware, userController.changePassword);

module.exports = router;