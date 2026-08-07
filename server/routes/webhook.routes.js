const express = require('express');
const router = express.Router();
const { handleClerkWebhook } = require('../controllers/auth.controller');

// Clerk requires raw body for svix signature verification
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

module.exports = router;
