const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { createOrderValidator } = require('../validators/order.validator');

router.post('/', protect, createOrderValidator, orderController.createOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/admin/all', protect, adminOnly, orderController.getAllOrders);
router.get('/admin/stats', protect, adminOnly, orderController.getOrderStats);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/status', protect, adminOnly, orderController.updateOrderStatus);
router.post('/:id/payment-screenshot', protect, orderController.uploadPaymentScreenshot);

module.exports = router;
