const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Referencia al producto que se está reseñando
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Usuario que deja la reseña
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5 // Calificación entre 1 y 5
    },
    comment: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
