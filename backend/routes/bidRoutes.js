const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

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

        if (!mongoose.Types.ObjectId.isValid(userId) ||
            !mongoose.Types.ObjectId.isValid(productId) ||
            bidAmount <= 0) {
            throw new Error("Parámetros de entrada inválidos");
        }

        const user = await User.findById(userId).session(session);
        const product = await Product.findById(productId).session(session);

        if (!user) throw new Error("Usuario no encontrado");
        if (!product || product.type !== "subasta") throw new Error("Producto no válido");

        if (product.endTime && product.endTime < new Date()) {
            throw new Error("La subasta ha finalizado");
        }

        // Obtener la puja más alta existente
        const highestBid = await Bid.findOne({ auctionId: productId })
            .sort({ bidAmount: -1 })
            .session(session);

        const minValidPrice = highestBid ? highestBid.bidAmount : product.startingPrice;
        if (bidAmount <= minValidPrice) {
            throw new Error(`La puja debe ser mayor a $${minValidPrice}`);
        }

        // Verificar si el usuario que tenía la puja más alta perdió su lugar
        let lostUserId = null;
        if (highestBid && highestBid.userId.toString() !== userId) {
            lostUserId = highestBid.userId;
        }

        // Actualizar o crear la puja del usuario
        const existingBid = await Bid.findOne({ auctionId: productId, userId }).session(session);

        if (existingBid) {
            existingBid.bidAmount = bidAmount;
            existingBid.bidTime = new Date();
            await existingBid.save({ session });
        } else {
            const newBid = new Bid({
                auctionId: productId,
                userId,
                userName: user.name,
                bidAmount,
                bidTime: new Date()
            });
            await newBid.save({ session });
        }

        await Product.findByIdAndUpdate(
            productId,
            { $set: { currentPrice: bidAmount } },
            { session }
        );

        // 📌 Notificar al usuario que perdió el primer lugar
        if (lostUserId) {
            const lostUser = await User.findById(lostUserId).session(session);
            if (lostUser && lostUser.oneSignalId) {
                await sendNotification(
                    lostUser.oneSignalId,
                    "Has perdido el primer puesto en la subasta",
                    `Alguien ha superado tu oferta en ${product.name}. ¡Haz una nueva puja para recuperarlo!`
                );
            }
        }

        // 📌 Notificar al usuario que ahora es el nuevo líder
        if (user.oneSignalId) {
            await sendNotification(
                user.oneSignalId,
                "¡Eres el líder de la subasta!",
                `Tu puja es la más alta en ${product.name}. ¡Mantente atento!`
            );
        }

        await session.commitTransaction();
        res.status(200).json({ message: "Puja aceptada con éxito" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message || "Error al realizar la puja" });
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

// Ruta para eliminar una puja
router.delete("/d/:bidId", async (req, res) => {
    try {
        const { bidId } = req.params;

        // Verificar si la puja existe
        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ message: 'Puja no encontrada' });
        }

        // Verificar si el usuario autenticado es el dueño de la puja
        if (bid.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta puja' });
        }

        // Eliminar la puja
        await Bid.findByIdAndDelete(bidId);
        res.status(200).json({ message: 'Puja eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la puja:', error.message);
        res.status(500).json({ message: 'Error al eliminar la puja', error });
    }
});

router.get("/:userId/bids", async (req, res) => {
    const { userId } = req.params;
    const { productId, sortBy = "bidTime", order = "desc" } = req.query;

    try {
        // Validar si el userId es válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID de usuario inválido" });
        }

        // Construir el filtro
        const filter = { userId };
        if (productId) {
            filter.auctionId = productId; // Filtrar por producto si se proporciona
        }

        // Construir el orden
        const sortOptions = {};
        sortOptions[sortBy] = order === "asc" ? 1 : -1;

        // Obtener las pujas del usuario
        const userBids = await Bid.find(filter)
            .sort(sortOptions)
            .populate("auctionId", "name currentPrice endTime"); // Incluir detalles del producto

        // Filtrar solo las subastas que el usuario ganó
        const wonBids = await Promise.all(
            userBids.map(async (bid) => {
                const product = bid.auctionId;

                // Obtener la puja más alta para esta subasta
                const highestBid = await Bid.findOne({ auctionId: product._id })
                    .sort({ bidAmount: -1 })
                    .limit(1);

                // Verificar si el usuario ganó la subasta
                if (highestBid && highestBid.userId.toString() === userId) {
                    return {
                        id: bid._id,
                        name: product.name,
                        finalPrice: bid.bidAmount,
                        date: bid.bidTime.toLocaleDateString(),
                        image: product.image, // Asume que el producto tiene un campo "image"
                        status: "won", // Estado de la subasta
                    };
                }
                return null;
            })
        );

        // Eliminar valores nulos (subastas no ganadas)
        const filteredWonBids = wonBids.filter((bid) => bid !== null);

        res.status(200).json({
            success: true,
            data: filteredWonBids,
        });
    } catch (error) {
        console.error("Error al obtener el historial de pujas:", error);
        res.status(500).json({ message: "Error al obtener el historial de pujas", error });
    }
});


module.exports = router;