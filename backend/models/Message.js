const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Referencia a la orden relacionada con la conversación
        required: true
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Participantes en la conversación (comprador y vendedor)
            required: true
        }
    ],
    messages: [
        {
            sender_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Usuario que envía el mensaje
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
