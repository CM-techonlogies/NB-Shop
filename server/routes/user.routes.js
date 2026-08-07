const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:id', userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);
router.patch('/addresses/:id/default', userController.setDefaultAddress);

router.get('/admin/all', adminOnly, userController.getAllUsers);
router.get('/admin/:id', adminOnly, userController.getUserById);
router.patch('/admin/:id/toggle', adminOnly, userController.toggleUserActive);

module.exports = router;
