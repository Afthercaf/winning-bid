const Auction = require('../models/Auction');
const upload = require('../uploads/multerConfig'); // Configuración de Multer

// Crear una subasta con subida de imágenes
exports.createAuction = [
    upload.array('images', 5),
    async (req, res) => {
        try {
            const { product_id, seller_id, startingPrice, auctionType, flashDuration } = req.body;

            if (!product_id || !seller_id || !startingPrice || !auctionType) {
                return res.status(400).json({ error: 'Faltan datos obligatorios' });
            }

            let auctionEndTime = new Date();
            if (auctionType === 'flash') {
                if (!flashDuration || isNaN(flashDuration)) {
                    return res.status(400).json({ error: 'Duración de subasta flash inválida' });
                }
                auctionEndTime.setMinutes(auctionEndTime.getMinutes() + parseInt(flashDuration));
            } else {
                auctionEndTime.setHours(auctionEndTime.getHours() + 24);
            }

            const images = req.files ? req.files.map(file => file.path) : [];
            const newAuction = new Auction({
                product_id,
                seller_id,
                startingPrice,
                auctionEndTime,
                auctionType,
                flashDuration,
                images
            });

            await newAuction.save();
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

// Obtener las tres mejores pujas de una subasta
exports.getTopBids = async (req, res) => {
    const { auctionId } = req.params;

    try {
        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ message: "Subasta no encontrada" });

        const topBids = auction.bids.sort((a, b) => b.bidAmount - a.bidAmount).slice(0, 3);
        console.log(topBids);
        res.status(200).json(topBids);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo las mejores pujas: " + error.message });
    }
};

// Realizar una puja
exports.placeBid = async (req, res) => {
    const { auctionId } = req.params;
    const { user_id, bidAmount } = req.body;

    try {
        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ message: "Subasta no encontrada" });

        if (!auction.isActive) return res.status(400).json({ message: "La subasta ha finalizado" });

        const currentPrice = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;
        if (bidAmount <= currentPrice) {
            return res.status(400).json({
                message: `La oferta debe ser mayor al precio actual (${currentPrice})`
            });
        }

        auction.bids.push({ user_id, bidAmount });
        auction.currentBid = bidAmount;

        auction.bids.sort((a, b) => b.bidAmount - a.bidAmount);
        const topBids = auction.bids.slice(0, 3);

        await auction.save();

        req.io.emit("bidUpdate", { auctionId, topBids });

        res.status(200).json({ message: "Puja realizada con éxito", auction, topBids });
    } catch (error) {
        res.status(500).json({ message: "Error al realizar la puja" });
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
