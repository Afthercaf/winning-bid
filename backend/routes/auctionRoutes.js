// routes/auctionRoutes.js
const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

router.get('/flash-auctions', auctionController.getFlashAuctions);
router.post('/', auctionController.createAuction);
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);

module.exports = router;
