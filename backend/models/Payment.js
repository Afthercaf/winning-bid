const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Referencia a la orden relacionada con el pago
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Usuario que realiza el pago
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['Tarjeta', 'Paypal', 'Transferencia'],
        required: true
    },
    status: {
        type: String,
        enum: ['pendiente', 'completado', 'fallido'],
        default: 'pendiente'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
