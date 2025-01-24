const express = require("express");
const router = express.Router();
const Bid = require("../models/Bid");
const Product = require("../models/Product");
const User = require("../models/User"); // Importa el modelo de usuario

// Ruta para crear una nueva puja
router.post("/:productId/bid", async (req, res) => {
    const { productId } = req.params;
    const { userId, bidAmount } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product || product.type !== "subasta") {
            return res.status(400).json({ message: "El producto no es una subasta" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const newBid = new Bid({
            auctionId: productId,
            userId,
            userName: user.name, // Guarda el nombre del usuario
            bidAmount,
        });

        await newBid.save();
        res.status(201).json(newBid);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la puja", error });
    }
});

// Ruta para obtener todas las pujas de una subasta específica
router.get("/:productId/bids", async (req, res) => {
    const { productId } = req.params;

    try {
        const bids = await Bid.find({ auctionId: productId }).sort({ bidAmount: -1 });
        res.status(200).json(bids);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las pujas", error });
    }
});

module.exports = router;
