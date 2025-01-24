// models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // Opcional, en caso de descuento
    available: { type: Boolean, default: true },
    images: [{ type: String }], // Campo para almacenar rutas de imágenes
    createdAt: { type: Date, default: Date.now }
});

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
