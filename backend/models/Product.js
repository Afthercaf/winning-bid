const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ type: String }], // Almacena URLs de las imágenes
    type: { type: String, enum: ['venta', 'subasta'], required: true },
    auctionType: { 
        type: String, 
        enum: ['normal', 'flash'], 
        required: false // Este campo es opcional, pero si es subasta, puede ser necesario
    },
    flashDuration: { 
        type: Number, 
        required: false, // Este campo solo es necesario si la subasta es tipo "flash"
        min: 30, 
        max: 120 // Minimo 30 minutos, máximo 2 horas (120 minutos)
    },
    price: { type: Number },
    startingPrice: { type: Number },
    auctionEndTime: { type: Date },
    currentPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
