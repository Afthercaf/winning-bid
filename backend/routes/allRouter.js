const express = require("express");

// Importar todas las rutas
const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const orderRoutes = require("./orderRoutes");
const messageRoutes = require("./messageRoutes");
const categoryRoutes = require("./categoryRoutes");
const reviewRoutes = require("./reviewRoutes");
const paymentRoutes = require("./paymentRoutes");
const wishlistRoutes = require("./wishlistRoutes");
const notificationRoutes = require("./notificationRoutes");
const bidRoutes = require("./bidRoutes");
const auctionRoutes = require("./auctionRoutes");

const router = express.Router();

// Configurar rutas
router.get("/auctionos", auctionRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/productsflash", productRoutes);
router.use("/flash", productRoutes);
router.use("/orders", orderRoutes);
router.use("/messages", messageRoutes);
router.use("/", categoryRoutes);
router.use("/reviews", reviewRoutes);
router.use("/payments", paymentRoutes);
router.use("/wishlists", wishlistRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
