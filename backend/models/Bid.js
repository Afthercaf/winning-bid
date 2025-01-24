const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bidSchema = new Schema({
    auctionId: {
        type: Schema.Types.ObjectId,
        ref: "Product", // Asume que tu modelo de productos se llama "Product"
        required: true,
    },
    userId: { // Referencia al ID del usuario
        type: Schema.Types.ObjectId,
        ref: "User", // Asume que tienes un modelo de usuario llamado "User"
        required: true,
    },
    userName: { // Guarda el nombre del usuario directamente
        type: String,
        required: true,
    },
    bidAmount: {
        type: Number,
        required: true,
    },
    bidTime: {
        type: Date,
        default: Date.now, // Se guarda la fecha y hora de la puja por defecto
    },
});

module.exports = mongoose.model("Bid", bidSchema);
