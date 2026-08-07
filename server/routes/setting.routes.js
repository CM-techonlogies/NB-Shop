const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', settingController.getSettings);
router.get('/full', protect, adminOnly, settingController.getFullSettings);
router.put('/', protect, adminOnly, settingController.updateSettings);

module.exports = router;
