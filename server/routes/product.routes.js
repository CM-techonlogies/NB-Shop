const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/:id', productController.getProductById);

router.post('/', protect, adminOnly, productController.createProduct);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);
router.patch('/:id/toggle', protect, adminOnly, productController.toggleAvailability);
router.patch('/:id/toggle-loose', protect, adminOnly, productController.toggleLoose);
router.patch('/:id/stock', protect, adminOnly, productController.updateStock);

module.exports = router;
