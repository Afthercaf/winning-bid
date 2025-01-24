const Review = require('../models/Review');

// Crear una nueva reseña
exports.createReview = async (req, res) => {
    try {
        const { product_id, user_id, rating, comment } = req.body;
        const newReview = new Review({ product_id, user_id, rating, comment });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(400).json({ error: 'Error creando la reseña: ' + error.message });
    }
};

// Obtener todas las reseñas de un producto
exports.getReviewsByProductId = async (req, res) => {
    try {
        const reviews = await Review.find({ product_id: req.params.product_id })
            .populate('user_id', 'name email'); // Obtener detalles del usuario que hizo la reseña
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las reseñas: ' + error.message });
    }
};

// Obtener todas las reseñas de un usuario
exports.getReviewsByUserId = async (req, res) => {
    try {
        const reviews = await Review.find({ user_id: req.params.user_id })
            .populate('product_id', 'title'); // Obtener detalles del producto reseñado
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las reseñas: ' + error.message });
    }
};

// Actualizar una reseña por ID
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
        res.status(200).json(review);
    } catch (error) {
        res.status(400).json({ error: 'Error actualizando la reseña: ' + error.message });
    }
};

// Eliminar una reseña por ID
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
        res.status(200).json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando la reseña: ' + error.message });
    }
};
