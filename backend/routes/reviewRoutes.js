const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Crear una nueva reseña
router.post('/', reviewController.createReview);

// Obtener todas las reseñas de un producto
router.get('/product/:product_id', reviewController.getReviewsByProductId);

// Obtener todas las reseñas de un usuario
router.get('/user/:user_id', reviewController.getReviewsByUserId);

// Actualizar una reseña por ID
router.put('/:id', reviewController.updateReview);

// Eliminar una reseña por ID
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
