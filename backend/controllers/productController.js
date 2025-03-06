import multer from 'multer';
import { uploadImageToImgur, uploadImageToCloudinary  } from "../imgurService.js"; // Asegúrate de usar la ruta correcta
import Product from '../models/Product.js';
import Bid from "../models/Bid.js"; 
import WebSocketManager from '../websocket.js';
import User from "../models/User.js"

// Configuración de multer
// Configuración de multer
const multerStorage = multer.memoryStorage();
const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
    },
});

const websocketManager = new WebSocketManager();

export const createProduct = [
    upload.array('images', 5), // Permitir hasta 5 imágenes
    async (req, res) => {
        try {
            const { name, description, category, auctionType, type, startingPrice, auctionEndTime } = req.body;

            const userId = req.user.id; // ID del usuario autenticado

            // Verificar si el usuario está activo
            const user = await User.findById(userId);
            if (!user.isActive) {
                return res.status(403).json({ message: "Tu cuenta está desactivada. No puedes crear productos." });
            }


            if (!name || !description || !category) {
                return res.status(400).json({ error: 'Faltan datos obligatorios' });
            }

            // Subir imágenes a Cloudinary
            const images = await Promise.all(
                req.files.map(async (file) => {
                    try {
                        return await uploadImageToCloudinary(file);
                    } catch (error) {
                        console.error(`Error al subir la imagen ${file.originalname}:`, error);
                        return null;
                    }
                })
            );

            const validImages = images.filter((url) => url !== null);

            // Crear producto en la base de datos
            const newProduct = new Product({
                name,
                description,
                category,
                type: 'subasta',
                auctionType,
                flashDuration: auctionType === 'flash' ? 60 : undefined,
                images: validImages,
                startingPrice: type === 'subasta' ? startingPrice : undefined,
                auctionEndTime: type === 'subasta' ? auctionEndTime : undefined,
                seller_id: req.user.id,
                currentPrice: type === 'subasta' ? startingPrice : undefined,
            });

            await newProduct.save();
            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Error creando el producto:', error.message);
            res.status(500).json({ error: 'No se pudo crear el producto.', details: error.message });
        }
    },
];

// Obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('seller_id', 'name email');
        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener los productos:", error.message);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};


// Obtener productos por usuario
export const getProductsByUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'No autorizado: Usuario no autenticado' });
        }

        const userId = req.user.id;
        const userProducts = await Product.find({ seller_id: userId });
        
        res.status(200).json(userProducts);
    } catch (error) {
        console.error("Error al obtener los productos del usuario:", error.message);
        res.status(500).json({ error: 'Error al obtener los productos del usuario' });
    }
};



// Actualizar el estado del producto (activo/desactivado)
export const updateProductStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: isActive },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // 🔥 Emitir evento WebSocket cuando cambia el estado de un producto
        websocketManager.notifyProductStatusChange(product);

        res.json({ message: 'Estado del producto actualizado', product });
    } catch (error) {
        console.error('Error al actualizar el estado del producto:', error.message);
        res.status(500).json({ message: 'Error al actualizar el estado del producto', error });
    }
};



// Obtener un producto por ID
export const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId).populate('seller_id', 'name email');

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error al obtener el producto:', error.message);
        res.status(500).json({ message: 'Error al obtener el producto', error });
    }
};


// Obtener las ofertas del día
export const getDailyDeals = async (req, res) => {
    try {
        const dailyDeals = await Product.aggregate([
            { $match: { type: 'venta' } },
            { $sample: { size: 4 } }
        ]);

        await Product.populate(dailyDeals, { path: 'seller_id', select: 'name email' });

        res.status(200).json(dailyDeals);
    } catch (error) {
        console.error('Error al obtener las ofertas del día:', error.message);
        res.status(500).json({ message: 'Error al obtener las ofertas del día', error });
    }
};

export const getDailyAuctions = async (req, res) => {
    try {
        const dailyAuctions = await Product.aggregate([
            { $match: { type: 'subasta' } },
            { $sample: { size: 3 } }
        ]);

        await Product.populate(dailyAuctions, { path: 'seller_id', select: 'name email' });

        res.status(200).json(dailyAuctions);
    } catch (error) {
        console.error('Error al obtener las subastas del día:', error.message);
        res.status(500).json({ message: 'Error al obtener las subastas del día', error });
    }
};


// Controlador en el backend
export const getRecommendedProducts = async (req, res) => {
    try {
        const recommendedProducts = await Product.aggregate([{ $sample: { size: 6 } }]);
        await Product.populate(recommendedProducts, { path: 'seller_id', select: 'name email' });
        
        res.status(200).json(recommendedProducts);
    } catch (error) {
        console.error('Error al obtener productos recomendados:', error.message);
        res.status(500).json({ message: 'Error al obtener productos recomendados', error });
    }
};

export const getUserProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller_id: req.user.id })
            .populate({
                path: 'order', // Asegúrate de que 'order' sea un campo en el esquema de Product
                select: '_id status buyer_id', // Selecciona solo los campos necesarios de Order
            });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos del usuario' });
    }
};

export const getFlashAuctions = async (req, res) => {
    try {
        const flashAuctions = await Product.aggregate([
            { $match: { type: 'subasta', auctionType: 'flash', isActive: true } }, // Solo subastas flash activas
            { $sample: { size: 3 } } // Aseguramos que siempre devuelva una lista de hasta 3 productos
        ]);

        await Product.populate(flashAuctions, { path: 'seller_id', select: 'name email' });

        if (!Array.isArray(flashAuctions) || flashAuctions.length === 0) {
            return res.status(404).json([]); // ⬅️ Retorna un array vacío en lugar de un objeto
        }

        // Calculamos el tiempo restante para cada producto
        const currentTime = new Date();
        const formattedAuctions = flashAuctions.map(auction => ({
            _id: auction._id,
            name: auction.name,
            description: auction.description.length > 200 ? auction.description.substring(0, 200) + '...' : auction.description,
            image: auction.images.length > 0 ? auction.images[0] : "https://via.placeholder.com/200",
            seller: auction.seller_id,
            timeLeft: Math.max(0, Math.floor((new Date(auction.auctionEndTime) - currentTime) / 1000)), // Tiempo restante en segundos
            currentPrice: auction.currentPrice || auction.startingPrice,
        }));

        res.status(200).json(formattedAuctions); // ⬅️ Aseguramos que siempre devuelve un array

    } catch (error) {
        console.error('❌ Error al obtener las subastas flash:', error.message);
        res.status(500).json({ message: 'Error al obtener las subastas flash', error });
    }
};
// En tu controlador, por ejemplo, en controllers/productController.js
// Controlador para obtener productos tipo 'flash'
// Controlador para obtener productos tipo 'flash'
export const getFlashProducts = async (req, res) => {
    try {
        const flashProducts = await Product.find({ auctionType: 'flash' });
        res.json(flashProducts);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los productos flash", error });
    }
};


















export const finalizarSubasta = async (req, res) => {
    const { productId } = req.params;

    try {
        // Buscar la subasta en MongoDB
        const product = await Product.findById(productId);

        if (!product || product.type !== "subasta") {
            return res.status(404).json({ error: "Subasta no encontrada" });
        }

        if (product.auctionEndTime > new Date()) {
            return res.status(400).json({ error: "La subasta aún no ha finalizado" });
        }

        // Buscar todas las pujas en la colección `bids`
        const bids = await Bid.find({ auctionId: productId }).sort({ bidAmount: -1 }); // Ordena de mayor a menor

        if (!bids.length) {
            console.log("⚠ No hay pujas registradas en la subasta:", productId);
            return res.status(400).json({ error: "No hay pujas en esta subasta" });
        }

        // Obtener la puja más alta
        const pujaMasAlta = bids[0];

        console.log("🏆 Puja ganadora:", pujaMasAlta);

        // Generar el voucher de OXXO Pay
        let voucherUrl;
        try {
            voucherUrl = await generateOxxoPayment(
                pujaMasAlta.bidAmount,
                pujaMasAlta.userId // Asegúrate de que `userId` contiene el correo o información necesaria
            );
        } catch (paymentError) {
            console.error("❌ Error al generar el voucher:", paymentError);
            return res.status(500).json({ error: "No se pudo generar el voucher" });
        }

        // Notificar al ganador con WebSockets 🚀
        websocketManager.notifyUser(pujaMasAlta.userId, {
            type: "GANADOR_SUBASTA",
            message: "¡Felicidades! Has ganado la subasta!",
            voucherUrl,
        });

        // Notificar a los perdedores 🚀
        bids.forEach(bid => {
            if (bid.userId.toString() !== pujaMasAlta.userId.toString()) {
                websocketManager.notifyUser(bid.userId, {
                    type: "PERDEDOR_SUBASTA",
                    message: `La subasta ha terminado. El ganador fue ${pujaMasAlta.userName}.`,
                });
            }
        });

        // Enviar respuesta al cliente
        res.status(200).json({ voucherUrl });

    } catch (error) {
        console.error("❌ Error al finalizar la subasta:", error);
        res.status(500).json({ error: "Error al finalizar la subasta" });
    }
};

// Eliminar un producto por ID
export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        // Verificar si el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Verificar si el usuario autenticado es el propietario del producto
        if (product.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este producto' });
        }

        // Eliminar el producto
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error.message);
        res.status(500).json({ message: 'Error al eliminar el producto', error });
    }
};