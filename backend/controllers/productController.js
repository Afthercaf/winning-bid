import multer from 'multer';
import { uploadImageToImgur } from "../imgurService.js"; // Asegúrate de usar la ruta correcta
import Product from '../models/Product.js';

// Configuración de multer
const multerStorage = multer.memoryStorage();
const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            const error = new Error('Solo se permiten archivos de imagen');
            error.status = 400;
            return cb(error, false);
        }
        cb(null, true);
    },
});

// Controlador para crear un producto
export const createProduct = [
    upload.array('images', 5),
    async (req, res) => {
        try {
            const { name, description, category, type, auctionType, flashDuration, price, stock, startingPrice, auctionEndTime } = req.body;

            if (!name || !description || !category || !type) {
                return res.status(400).json({ error: 'Faltan datos obligatorios' });
            }

            // Subir imágenes a Imgur
            const images = await Promise.all(
                req.files.map(async (file) => {
                    try {
                        return await uploadImageToImgur(file); // Usa la función de Imgur
                    } catch (error) {
                        console.error(`Error al subir la imagen ${file.originalname}:`, error);
                        return null;
                    }
                })
            );

            const validImages = images.filter((url) => url !== null); // Filtra imágenes no subidas

            // Crear el producto en la base de datos
            const newProduct = new Product({
                name,
                description,
                category,
                type,
                auctionType,
                flashDuration,
                images: validImages,
                price: type === 'venta' ? price : undefined,
                stock: type === 'venta' ? stock : undefined,
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