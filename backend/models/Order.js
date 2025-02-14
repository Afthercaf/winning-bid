const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pendiente', 'confirmado_por_vendedor', 'completado'],
        default: 'pendiente'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    conekta_order_id: {
        type: String,
        required: true
    }

});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
