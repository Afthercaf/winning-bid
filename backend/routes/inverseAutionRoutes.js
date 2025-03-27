const express = require("express");
const router = express.Router();
const inverseAuctionController = require("../controllers/inverseAuctionController");
const multer = require("multer");
const { uploadImageToCloudinary } = require("../imgurService");

// Configuración de multer
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten archivos de imagen"), false);
    }
    cb(null, true);
  },
});

// Crear subasta inversa (comprador)
router.post(
  "/",
  upload.array("images", 5),
  inverseAuctionController.createInverseAuction
);

// Obtener todas las subastas inversas activas
router.get("/", inverseAuctionController.getAllInverseAuctions);

// Hacer una oferta en subasta inversa (vendedor)
router.post(
  "/:auctionId/bids",
  upload.array("productImages", 5),
  inverseAuctionController.placeBidOnInverseAuction
);

// Aceptar una oferta (comprador)
router.post(
  "/:auctionId/accept/:bidIndex",
  inverseAuctionController.acceptBid
);

// Obtener detalles de una subasta inversa
router.get("/:auctionId", inverseAuctionController.getInverseAuctionDetails);

module.exports = router;