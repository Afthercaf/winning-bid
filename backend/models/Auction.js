const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startingPrice: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    auctionEndTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    auctionType: { type: String, enum: ['normal', 'flash'], required: true },  // Nuevo campo
    flashDuration: { type: Number, enum: [30, 60, 120], default: 60 }, // Nuevo campo, duración en minutos
    bids: [
        {
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            bidAmount: Number,
            bidTime: { type: Date, default: Date.now }
        }
    ],
    images: [{ type: String }], // Campo para almacenar rutas de imágenes
    createdAt: { type: Date, default: Date.now }
});

const Auction = mongoose.model('Auction', auctionSchema);
module.exports = Auction;
