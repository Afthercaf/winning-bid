// controllers/saleController.js
const Sale = require('../models/Sale');
const upload = require('../uploads/multerConfig');// Cambia esto por la ruta correcta de tu configuración de Multer

// Crear una venta con subida de imágenes
exports.createSale = [
    upload.array('images', 5), // Permite subir hasta 5 imágenes
    async (req, res) => {
        try {
            const { product_id, seller_id, price, discount } = req.body;
            const images = req.files.map(file => file.path); // Guardar las rutas de las imágenes

            const newSale = new Sale({
                product_id,
                seller_id,
                price,
                discount,
                images // Guardar las rutas de las imágenes en la base de datos
            });

            await newSale.save();
            res.status(201).json(newSale);
        } catch (error) {
            res.status(400).json({ error: 'Error creando la venta: ' + error.message });
        }
    }
];

// Obtener todas las ventas
exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.find()
            .populate('product_id')
            .populate('seller_id', 'name email');
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las ventas: ' + error.message });
    }
};

// Obtener una venta por ID
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('product_id')
            .populate('seller_id', 'name email');
        if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
        res.status(200).json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo la venta: ' + error.message });
    }
};
