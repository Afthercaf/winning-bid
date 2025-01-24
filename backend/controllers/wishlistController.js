const Wishlist = require('../models/Wishlist');

// Crear una nueva lista de deseos
exports.createWishlist = async (req, res) => {
    try {
        const { user_id, products } = req.body;
        const newWishlist = new Wishlist({ user_id, products });
        await newWishlist.save();
        res.status(201).json(newWishlist);
    } catch (error) {
        res.status(400).json({ error: 'Error creando la lista de deseos: ' + error.message });
    }
};

// Obtener todas las listas de deseos de un usuario
exports.getWishlistByUserId = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({ user_id: req.params.user_id })
            .populate('products', 'title price'); // Obtener detalles de los productos en la lista
        if (!wishlist) return res.status(404).json({ message: 'Lista de deseos no encontrada' });
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo la lista de deseos: ' + error.message });
    }
};

// Agregar un producto a la lista de deseos
exports.addProductToWishlist = async (req, res) => {
    try {
        const { product_id } = req.body;
        const wishlist = await Wishlist.findOne({ user_id: req.params.user_id });
        if (!wishlist) return res.status(404).json({ message: 'Lista de deseos no encontrada' });

        wishlist.products.push(product_id);
        await wishlist.save();
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(400).json({ error: 'Error agregando el producto: ' + error.message });
    }
};

// Eliminar un producto de la lista de deseos
exports.removeProductFromWishlist = async (req, res) => {
    try {
        const { product_id } = req.body;
        const wishlist = await Wishlist.findOne({ user_id: req.params.user_id });
        if (!wishlist) return res.status(404).json({ message: 'Lista de deseos no encontrada' });

        wishlist.products = wishlist.products.filter(product => product.toString() !== product_id);
        await wishlist.save();
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(400).json({ error: 'Error eliminando el producto: ' + error.message });
    }
};

// Eliminar una lista de deseos por ID
exports.deleteWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findByIdAndDelete(req.params.id);
        if (!wishlist) return res.status(404).json({ message: 'Lista de deseos no encontrada' });
        res.status(200).json({ message: 'Lista de deseos eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando la lista de deseos: ' + error.message });
    }
};
