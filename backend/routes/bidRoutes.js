const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Product = require("../models/Product");
const User = require("../models/User");
const WebSocketManager = require("../websocket");
const router = express.Router();

// Validación de pujas
const validateBid = async (product, bidAmount) => {
    const currentMaxBid = await Bid.findOne({ auctionId: product._id })
        .sort({ bidAmount: -1 })
        .select("bidAmount")
        .lean();

    const minValidPrice = currentMaxBid ? currentMaxBid.bidAmount : product.startingPrice;
    if (bidAmount <= minValidPrice) {
        throw new Error(`La puja debe ser mayor a $${minValidPrice}`);
    }
    return true;
};

// Ruta para crear o actualizar una puja
router.post("/:productId/bid-j", async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { productId } = req.params;
        const { userId, bidAmount } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId) || bidAmount <= 0) {
            return res.status(400).json({ message: "Parámetros de entrada inválidos" });
        }

        const [user, product] = await Promise.all([
            User.findById(userId).session(session),
            Product.findById(productId).session(session),
        ]);

        if (!user) throw new Error("Usuario no encontrado");
        if (!product || product.type !== "subasta") throw new Error("Producto no encontrado o no es una subasta");
        if (product.endTime && product.endTime < new Date()) throw new Error("La subasta ha terminado");

        await validateBid(product, bidAmount);

        let bid;
        const existingBid = await Bid.findOne({ auctionId: productId, userId }).session(session);

        if (existingBid) {
            existingBid.bidAmount = bidAmount;
            existingBid.bidTime = new Date();
            await existingBid.save({ session });
            bid = existingBid;
        } else {
            bid = await new Bid({
                auctionId: productId,
                userId,
                userName: user.name,
                bidAmount,
                bidTime: new Date(),
            }).save({ session });
        }

        await Product.findByIdAndUpdate(productId, { currentPrice: bidAmount }, { session });

        // Obtener las mejores 5 ofertas para mostrar en tiempo real
        const topBids = await Bid.find({ auctionId: productId })
            .sort({ bidAmount: -1 })
            .limit(5)
            .lean();

        await session.commitTransaction();
        session.endSession();

        // Emitir evento de WebSocket para actualizar la interfaz
        req.io.to(productId).emit("bidUpdate", {
            productId,
            currentPrice: bidAmount,
            topBids: topBids.map((bid) => ({
                userId: bid.userId,
                userName: bid.userName,
                bidAmount: bid.bidAmount,
                timestamp: bid.bidTime,
            })),
        });

        res.status(200).json({ message: "Puja actualizada con éxito" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message || "Error al crear o actualizar la puja" });
    }
});


// Obtener las pujas por ID del producto con paginación optimizada
router.get("/:productId/bids", async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (page - 1) * limit;
        const [bids, total] = await Promise.all([
            Bid.find({ auctionId: productId }).sort({ bidAmount: -1 }).skip(skip).limit(Number(limit)).lean(),
            Bid.countDocuments({ auctionId: productId }),
        ]);

        res.status(200).json({ bids, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las pujas", error });
    }
});

// Eliminar una puja con validación de usuario
router.delete("/d/:bidId", async (req, res) => {
    try {
        const { bidId } = req.params;
        const bid = await Bid.findById(bidId).lean();

        if (!bid) return res.status(404).json({ message: "Puja no encontrada" });
        if (bid.userId.toString() !== req.user.id) return res.status(403).json({ message: "No tienes permiso para eliminar esta puja" });

        await Bid.findByIdAndDelete(bidId);
        res.status(200).json({ message: "Puja eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la puja", error });
    }
});

// Obtener subastas en las que el usuario ha participado y si ganó alguna
router.get("/:userId/bids2", async (req, res) => {
    const { userId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID de usuario inválido" });
        }

        // Obtener las pujas del usuario
        const userBids = await Bid.find({ userId })
            .populate("auctionId", "name currentPrice endTime image")
            .lean();

        if (!userBids.length) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Obtener las subastas ganadas de forma optimizada
        const auctionIds = [...new Set(userBids.map((bid) => bid.auctionId._id.toString()))];

        const highestBids = await Bid.aggregate([
            { $match: { auctionId: { $in: auctionIds.map((id) => mongoose.Types.ObjectId(id)) } } },
            { $sort: { bidAmount: -1 } },
            { $group: { _id: "$auctionId", topBid: { $first: "$$ROOT" } } },
        ]);

        const wonBids = userBids.filter((bid) =>
            highestBids.some((topBid) => topBid.topBid.userId.toString() === userId && topBid._id.toString() === bid.auctionId._id.toString())
        );

        res.status(200).json({
            success: true,
            data: wonBids.map((bid) => ({
                id: bid._id,
                name: bid.auctionId.name,
                finalPrice: bid.bidAmount,
                date: bid.bidTime.toLocaleDateString(),
                image: bid.auctionId.image,
                status: "won",
            })),
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el historial de pujas", error });
    }
});

// Obtener subastas en las que el usuario ha participado
router.get("/:userId/participated-auctions", async (req, res) => {
    const { userId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID de usuario inválido" });
        }

        const objectIdUserId = new mongoose.Types.ObjectId(userId);

        // Verificar si el usuario existe antes de continuar
        const userExists = await User.findById(objectIdUserId);
        if (!userExists) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Obtener subastas en las que el usuario ha participado
        const participatedAuctions = await Bid.aggregate([
            { $match: { userId: objectIdUserId } }, // Filtrar por userId
            {
                $lookup: {
                    from: "products", // Nombre de la colección de productos en la base de datos
                    localField: "auctionId",
                    foreignField: "_id",
                    as: "auctionDetails"
                }
            },
            { $unwind: { path: "$auctionDetails", preserveNullAndEmptyArrays: true } }, // Descomponer el array resultante de $lookup
            {
                $project: {
                    bidId: "$_id",
                    bidAmount: 1,
                    bidTime: 1,
                    "auctionDetails.name": 1,
                    "auctionDetails.currentPrice": 1,
                    "auctionDetails.auctionEndTime": 1,
                    "auctionDetails.images": 1,
                    "auctionDetails.type": 1
                }
            }
        ]);

        if (!participatedAuctions || participatedAuctions.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        res.status(200).json({ success: true, data: participatedAuctions });
    } catch (error) {
        console.error("Error al obtener subastas:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});


module.exports = router;

