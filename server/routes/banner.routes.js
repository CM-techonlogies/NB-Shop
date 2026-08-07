const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', bannerController.getBanners);
router.get('/admin', protect, adminOnly, bannerController.getAllBannersAdmin);
router.post('/', protect, adminOnly, bannerController.createBanner);
router.put('/:id', protect, adminOnly, bannerController.updateBanner);
router.delete('/:id', protect, adminOnly, bannerController.deleteBanner);

module.exports = router;
