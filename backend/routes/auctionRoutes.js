const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

// Definir rutas específicas antes de las genéricas
router.get('/flash-auctions', auctionController.getFlashAuctions);
router.post('/', auctionController.createAuction);
router.get('/all', auctionController.getAuctions); // Ruta específica
router.get('/:id', auctionController.getAuctionById); // Ruta genérica
router.get('/:auctionId/top-bids', auctionController.getTopBids);
router.post('/:auctionId/bid2', auctionController.placeBid); // Realizar una puja

module.exports = router;
