const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ type: String }], // Almacena URLs de las imágenes
    type: { 
        type: String, 
        enum: ['subasta'], // Solo "subasta"
        required: true 
    },
    auctionType: { 
        type: String, 
        enum: ['normal', 'flash'], 
        required: true 
    },
    flashDuration: { 
        type: Number, 
        required: function() { return this.auctionType === 'flash'; }, 
        default: 60, // Duración por defecto de 1 hora (60 minutos)
        min: 60, 
        max: 60 // Solo permite 1 hora
    },
    startingPrice: { type: Number, required: true },
    auctionEndTime: { type: Date },
    currentPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
