const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Product = require("../models/Product");
const User = require("../models/User");
const WebSocketManager = require('../websocket'); // Importamos el WebSocketManager
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGODB_URI);

// Instanciamos WebSocketManager
const websocketManager = new WebSocketManager();
const io = websocketManager.getIO(); // Obtenemos la instancia de io

// Middleware para inyectar socket en las rutas
const router = express.Router();
router.use((req, res, next) => {
    req.io = io; // Inyectamos la instancia de io en el request
    next();
});

// Validación de pujas
const validateBid = async (product, bidAmount) => {
    const currentMaxPrice = await Bid.findOne({ auctionId: product._id })
        .sort({ bidAmount: -1 })
        .select('bidAmount');

    const minValidPrice = currentMaxPrice ? currentMaxPrice.bidAmount : product.startingPrice;
    if (bidAmount <= minValidPrice) {
        throw new Error(`La puja debe ser mayor a $${minValidPrice}`);
    }
    return true;
};

// Ruta para crear o actualizar una puja
router.post("/:productId/bid-j", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId } = req.params;
        const { userId, bidAmount } = req.body;

        // Validación de parámetros de entrada
        if (!mongoose.Types.ObjectId.isValid(userId) || 
            !mongoose.Types.ObjectId.isValid(productId) || 
            bidAmount <= 0) {
            throw new Error("Parámetros de entrada inválidos");
        }

        // Buscar usuario y producto
        const user = await User.findById(userId).session(session);
        const product = await Product.findById(productId).session(session);

        if (!user) {
            throw new Error("Usuario no encontrado");
        }
        if (!product || product.type !== "subasta") {
            throw new Error("Producto no encontrado o no es una subasta");
        }

        if (product.endTime && product.endTime < new Date()) {
            throw new Error("La subasta ha terminado");
        }

        await validateBid(product, bidAmount);

        // Verificar si ya existe una puja del usuario para este producto
        const existingBid = await Bid.findOne({ auctionId: productId, userId }).session(session);

        if (existingBid) {
            // Actualizar la puja existente
            existingBid.bidAmount = bidAmount;
            existingBid.bidTime = new Date();
            await existingBid.save({ session });
        } else {
            // Crear una nueva puja si no existe
            const newBid = new Bid({
                auctionId: productId,
                userId,
                userName: user.name,
                bidAmount,
                bidTime: new Date()
            });
            await newBid.save({ session });
        }

        // Actualizar el precio actual del producto
        await Product.findByIdAndUpdate(productId, { 
            currentPrice: bidAmount 
        }, { session });

        const topBids = await Bid.find({ auctionId: productId })
            .sort({ bidAmount: -1 })
            .limit(5)
            .session(session);

        // Emitir el evento de WebSocket
        req.io.to(productId).emit('bidUpdate', {
            productId,
            currentPrice: bidAmount,
            topBids: topBids.map(bid => ({
                userId: bid.userId,
                userName: bid.userName,
                bidAmount: bid.bidAmount,
                timestamp: bid.bidTime
            }))
        });

        await session.commitTransaction();
        res.status(200).json({ message: "Puja actualizada con éxito" });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message || "Error al crear o actualizar la puja" });
    } finally {
        session.endSession();
    }
});


// Ruta para obtener las ofertas por ID del producto
router.get("/:productId/bids", async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (page - 1) * limit;
        const bids = await Bid.find({ auctionId: productId })
            .sort({ bidAmount: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Bid.countDocuments({ auctionId: productId });

        res.status(200).json({
            bids,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las pujas", error });
    }
});

module.exports = router;
