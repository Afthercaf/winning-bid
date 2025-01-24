const Auction = require('../models/Auction');
const upload = require('../uploads/multerConfig'); // Configuración de Multer

// Crear una subasta con subida de imágenes
exports.createAuction = [
    upload.array('images', 5), // Permitir hasta 5 imágenes
    async (req, res) => {
        try {
            const { product_id, seller_id, startingPrice, auctionType, flashDuration } = req.body;
            
            // Validación de datos
            if (!product_id || !seller_id || !startingPrice || !auctionType) {
                return res.status(400).json({ error: 'Faltan datos obligatorios' });
            }

            // Si es una subasta flash, validamos la duración
            let auctionEndTime = new Date();
            if (auctionType === 'flash') {
                if (!flashDuration || isNaN(flashDuration)) {
                    return res.status(400).json({ error: 'La duración de la subasta flash debe ser un número válido' });
                }
                auctionEndTime.setMinutes(auctionEndTime.getMinutes() + parseInt(flashDuration)); // Sumamos minutos a la hora actual
            } else {
                auctionEndTime.setHours(auctionEndTime.getHours() + 24); // Subasta normal de 24 horas
            }

            // Si no se envían imágenes, lo manejamos
            const images = req.files ? req.files.map(file => file.path) : [];

            // Crear la subasta
            const newAuction = new Auction({
                product_id,
                seller_id,
                startingPrice,
                auctionEndTime,
                auctionType,
                flashDuration, // Solo se usará si es una subasta flash
                images // Guardar las rutas de las imágenes
            });

            // Guardar la subasta en la base de datos
            await newAuction.save();

            // Responder con la subasta creada
            res.status(201).json({ message: 'Subasta creada exitosamente', auction: newAuction });
        } catch (error) {
            res.status(400).json({ error: 'Error creando la subasta: ' + error.message });
        }
    }
];

// Obtener todas las subastas
exports.getAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find()
            .populate('product_id')
            .populate('seller_id', 'name email');
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las subastas: ' + error.message });
    }
};

// Obtener subastas flash
exports.getFlashAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find({ auctionType: 'flash' })
            .populate('product_id')
            .populate('seller_id', 'name email');
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las subastas flash: ' + error.message });
    }
};

// Obtener una subasta por ID
exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id)
            .populate('product_id')
            .populate('seller_id', 'name email');
        if (!auction) return res.status(404).json({ message: 'Subasta no encontrada' });
        res.status(200).json(auction);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo la subasta: ' + error.message });
    }
};

exports.makeOffer = async (req, res) => {
    try {
      const { auctionId, amount, bidder } = req.body; // Ahora usamos auctionId y no productId.
  
      // Buscar la subasta por ID
      const auction = await Auction.findById(auctionId);
  
      if (!auction) {
        return res.status(404).json({
          status: 'error',
          message: 'Subasta no encontrada',
        });
      }
  
      const now = new Date();
  
      // Verificar si la subasta ha comenzado
      if (now > auction.auctionEndTime) {
        return res.status(400).json({
          status: 'error',
          message: 'La subasta ha finalizado',
        });
      }
  
      // Verificar si la subasta está activa
      if (!auction.isActive) {
        return res.status(400).json({
          status: 'error',
          message: 'La subasta no está activa',
        });
      }
  
      // Verificar si la oferta es mayor que el precio actual
      if (amount <= (auction.currentBid || auction.startingPrice)) {
        return res.status(400).json({
          status: 'error',
          message: 'La oferta debe ser mayor que el precio actual',
        });
      }
  
      // Agregar la oferta a la lista de ofertas y actualizar la oferta actual
      auction.bids.push({
        user_id: bidder,
        bidAmount: amount,
        bidTime: now,
      });
      auction.currentBid = amount;
  
      // Guardar la subasta actualizada
      const updatedAuction = await auction.save();
  
      // Emitir evento de nueva oferta (si tienes WebSocket configurado)
      req.app.get('io').emit('newOffer', {
        auctionId,
        currentBid: amount,
        bidder,
      });
  
      res.status(200).json({
        status: 'success',
        auction: updatedAuction,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error al realizar la oferta: ' + error.message,
      });
    }
  };