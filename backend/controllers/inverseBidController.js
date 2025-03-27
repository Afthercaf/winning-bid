// controllers/inverseBidController.js
const mongoose = require('mongoose');
const InverseAuction = require('../models/InverseAuction');
const InverseBid = require('../models/InverseBid');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/cloudinary');
const { retryTransaction } = require('../utils/transactions');

// Configuración de multer para imágenes del producto ofrecido
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen'), false);
    }
    cb(null, true);
  }
});

exports.createInverseBid = [
  upload.array('productImages', 5),
  async (req, res) => {
    try {
      await retryTransaction(async () => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const { auctionId } = req.params;
          const { 
            productName, 
            productDescription, 
            bidAmount, 
            deliveryTime 
          } = req.body;

          const userId = req.user.id;

          // Validaciones básicas
          if (
            !mongoose.Types.ObjectId.isValid(userId) ||
            !mongoose.Types.ObjectId.isValid(auctionId) ||
            bidAmount <= 0 ||
            deliveryTime <= 0
          ) {
            throw new Error("Parámetros de entrada inválidos");
          }

          // Verificar si el usuario está activo
          const user = await User.findById(userId).session(session);
          if (!user.isActive) {
            throw new Error("Tu cuenta está desactivada. No puedes hacer ofertas.");
          }

          // Obtener la subasta inversa
          const auction = await InverseAuction.findById(auctionId).session(session);
          if (!auction || auction.status !== 'active') {
            throw new Error("Subasta no válida o cerrada");
          }

          if (auction.endTime < new Date()) {
            throw new Error("La subasta inversa ha finalizado");
          }

          if (parseFloat(bidAmount) > parseFloat(auction.maxPrice)) {
            throw new Error("El precio ofertado excede el máximo permitido por el comprador");
          }

          // Subir imágenes del producto ofrecido
          const productImages = await Promise.all(
            req.files.map(async (file) => {
              try {
                return await uploadImageToCloudinary(file);
              } catch (error) {
                console.error(`Error al subir la imagen ${file.originalname}:`, error);
                return null;
              }
            })
          );

          const validProductImages = productImages.filter(url => url !== null);

          // Crear la oferta
          const newBid = new InverseBid({
            auctionId,
            sellerId: userId,
            sellerName: user.name,
            productOffered: {
              name: productName,
              description: productDescription,
              images: validProductImages
            },
            bidAmount: parseFloat(bidAmount),
            deliveryTime: parseInt(deliveryTime),
            status: 'pending'
          });

          await newBid.save({ session });

          // Emitir evento de WebSocket para actualizar la interfaz
          req.io.to(auctionId).emit('newInverseBid', {
            auctionId,
            bidId: newBid._id,
            sellerName: user.name,
            bidAmount: newBid.bidAmount,
            productName: productName
          });

          await session.commitTransaction();
          return true;
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      });

      res.status(200).json({ message: "Oferta creada con éxito" });
    } catch (error) {
      res.status(400).json({
        message: error.message || "Error al crear la oferta",
      });
    }
  }
];

exports.acceptInverseBid = async (req, res) => {
    try {
      await retryTransaction(async () => {
        const session = await mongoose.startSession();
        session.startTransaction();
  
        try {
          const { bidId } = req.params;
          const userId = req.user.id;
  
          // Validar ID
          if (!mongoose.Types.ObjectId.isValid(bidId)) {
            throw new Error("ID de oferta inválido");
          }
  
          // Obtener la oferta y la subasta relacionada
          const bid = await InverseBid.findById(bidId).session(session);
          if (!bid) {
            throw new Error("Oferta no encontrada");
          }
  
          const auction = await InverseAuction.findById(bid.auctionId).session(session);
          if (!auction || auction.buyerId.toString() !== userId.toString()) {
            throw new Error("No tienes permiso para aceptar esta oferta");
          }
  
          if (auction.status !== 'active') {
            throw new Error("La subasta inversa no está activa");
          }
  
          // Marcar esta oferta como aceptada y rechazar las demás
          await InverseBid.updateMany(
            { 
              auctionId: auction._id,
              _id: { $ne: bid._id },
              status: 'pending'
            },
            { $set: { status: 'rejected' } },
            { session }
          );
  
          bid.status = 'accepted';
          await bid.save({ session });
  
          // Cerrar la subasta inversa
          auction.status = 'closed';
          auction.updatedAt = new Date();
          await auction.save({ session });
  
          // Aquí podrías crear un pedido o notificación para ambos usuarios
          // ...
  
          // Emitir evento de WebSocket
          req.io.to(auction._id.toString()).emit('inverseAuctionClosed', {
            auctionId: auction._id,
            acceptedBidId: bid._id,
            sellerId: bid.sellerId,
            buyerId: auction.buyerId
          });
  
          await session.commitTransaction();
          return true;
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      });
  
      res.status(200).json({ message: "Oferta aceptada con éxito" });
    } catch (error) {
      res.status(400).json({
        message: error.message || "Error al aceptar la oferta",
      });
    }
  };