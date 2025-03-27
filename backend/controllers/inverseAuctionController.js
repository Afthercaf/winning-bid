const InverseAuction = require("../models/InverseAuction");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../imgurService");
const mongoose = require("mongoose");

// Crear una subasta inversa (comprador)
exports.createInverseAuction = async (req, res) => {
  try {
    const { title, description, category, desiredPrice, endTime } = req.body;
    const userId = req.user.id;

    // Verificar si el usuario está activo
    const user = await User.findById(userId);
    if (!user.isActive) {
      return res.status(403).json({ message: "Tu cuenta está desactivada. No puedes crear subastas inversas." });
    }

    // Subir imágenes si existen
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map(async (file) => {
          try {
            return await uploadImageToCloudinary(file);
          } catch (error) {
            console.error(`Error al subir la imagen: ${error}`);
            return null;
          }
        })
      );
      images = images.filter(img => img !== null);
    }

    const newInverseAuction = new InverseAuction({
      title,
      description,
      category,
      desiredPrice,
      images,
      buyerId: userId,
      buyerName: user.name,
      endTime: new Date(endTime),
      status: "active",
      currentLowestBid: desiredPrice,
    });

    await newInverseAuction.save();
    res.status(201).json(newInverseAuction);
  } catch (error) {
    console.error("Error creating inverse auction:", error);
    res.status(500).json({ error: "Error creating inverse auction" });
  }
};

// Obtener todas las subastas inversas activas
exports.getAllInverseAuctions = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const query = { status: "active" };

    if (category) query.category = category;
    if (minPrice) query.desiredPrice = { $gte: Number(minPrice) };
    if (maxPrice) {
      query.desiredPrice = query.desiredPrice || {};
      query.desiredPrice.$lte = Number(maxPrice);
    }

    const auctions = await InverseAuction.find(query)
      .sort({ createdAt: -1 })
      .populate("buyerId", "name rating");

    res.status(200).json(auctions);
  } catch (error) {
    console.error("Error getting inverse auctions:", error);
    res.status(500).json({ error: "Error getting inverse auctions" });
  }
};

// Hacer una oferta en una subasta inversa (vendedor)
exports.placeBidOnInverseAuction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { auctionId } = req.params;
    const { bidAmount, productName, productDescription } = req.body;
    const userId = req.user.id;

    // Verificar si el usuario está activo
    const user = await User.findById(userId).session(session);
    if (!user.isActive) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Tu cuenta está desactivada. No puedes hacer ofertas." });
    }

    const auction = await InverseAuction.findById(auctionId).session(session);
    if (!auction) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Subasta inversa no encontrada" });
    }

    if (auction.status !== "active") {
      await session.abortTransaction();
      return res.status(400).json({ error: "Esta subasta inversa ya no está activa" });
    }

    if (new Date(auction.endTime) < new Date()) {
      auction.status = "expired";
      await auction.save({ session });
      await session.abortTransaction();
      return res.status(400).json({ error: "Esta subasta inversa ha expirado" });
    }

    if (bidAmount >= auction.currentLowestBid) {
      await session.abortTransaction();
      return res.status(400).json({ 
        error: `Tu oferta debe ser menor al precio actual ($${auction.currentLowestBid})` 
      });
    }

    // Subir imágenes del producto ofrecido
    let productImages = [];
    if (req.files && req.files.length > 0) {
      productImages = await Promise.all(
        req.files.map(async (file) => {
          try {
            return await uploadImageToCloudinary(file);
          } catch (error) {
            console.error(`Error al subir la imagen: ${error}`);
            return null;
          }
        })
      );
      productImages = productImages.filter(img => img !== null);
    }

    // Crear la nueva oferta
    const newBid = {
      sellerId: userId,
      sellerName: user.name,
      bidAmount,
      productOffered: {
        name: productName,
        description: productDescription,
        images: productImages,
      },
    };

    auction.bids.push(newBid);
    auction.currentLowestBid = bidAmount;
    await auction.save({ session });

    await session.commitTransaction();

    // Emitir evento de WebSocket para actualizar en tiempo real
    req.io.to(auctionId).emit("inverseAuctionUpdate", {
      auctionId,
      currentLowestBid: bidAmount,
      newBid: {
        sellerId: userId,
        sellerName: user.name,
        bidAmount,
        productOffered: newBid.productOffered,
      },
    });

    res.status(200).json({ message: "Oferta colocada con éxito", auction });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error placing bid on inverse auction:", error);
    res.status(500).json({ error: "Error placing bid on inverse auction" });
  } finally {
    session.endSession();
  }
};

// Aceptar una oferta (comprador)
exports.acceptBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { auctionId, bidIndex } = req.params;
    const userId = req.user.id;

    const auction = await InverseAuction.findById(auctionId).session(session);
    if (!auction) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Subasta inversa no encontrada" });
    }

    if (auction.buyerId.toString() !== userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: "No tienes permiso para aceptar ofertas en esta subasta" });
    }

    if (bidIndex < 0 || bidIndex >= auction.bids.length) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Índice de oferta no válido" });
    }

    // Marcar la oferta como aceptada
    auction.bids[bidIndex].isAccepted = true;
    auction.status = "completed";
    await auction.save({ session });

    await session.commitTransaction();

    // Emitir evento de WebSocket
    req.io.to(auctionId).emit("inverseAuctionCompleted", {
      auctionId,
      acceptedBid: auction.bids[bidIndex],
    });

    // Aquí podrías agregar lógica para crear una orden de compra, notificar al vendedor, etc.

    res.status(200).json({ message: "Oferta aceptada con éxito", auction });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error accepting bid:", error);
    res.status(500).json({ error: "Error accepting bid" });
  } finally {
    session.endSession();
  }
};

// Obtener detalles de una subasta inversa
exports.getInverseAuctionDetails = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const auction = await InverseAuction.findById(auctionId)
      .populate("buyerId", "name rating")
      .populate("bids.sellerId", "name rating");

    if (!auction) {
      return res.status(404).json({ error: "Subasta inversa no encontrada" });
    }

    res.status(200).json(auction);
  } catch (error) {
    console.error("Error getting inverse auction details:", error);
    res.status(500).json({ error: "Error getting inverse auction details" });
  }
};