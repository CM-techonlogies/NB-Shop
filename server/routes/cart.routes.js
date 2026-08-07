const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
