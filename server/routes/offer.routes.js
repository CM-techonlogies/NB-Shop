const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', offerController.getOffers);
router.post('/', protect, adminOnly, offerController.createOffer);
router.put('/:id', protect, adminOnly, offerController.updateOffer);
router.delete('/:id', protect, adminOnly, offerController.deleteOffer);

module.exports = router;
