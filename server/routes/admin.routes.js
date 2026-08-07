const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect, adminOnly);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.post('/send-whatsapp', adminController.sendCustomWhatsApp);

module.exports = router;
