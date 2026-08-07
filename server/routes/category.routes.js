const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', categoryController.getCategories);
router.get('/admin', protect, adminOnly, categoryController.getAllCategoriesAdmin);
router.get('/:slug', categoryController.getCategoryBySlug);

router.post('/', protect, adminOnly, categoryController.createCategory);
router.put('/:id', protect, adminOnly, categoryController.updateCategory);
router.delete('/:id', protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
