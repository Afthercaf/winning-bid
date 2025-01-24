const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Crear una nueva lista de deseos
router.post('/', wishlistController.createWishlist);

// Obtener todas las listas de deseos de un usuario
router.get('/user/:user_id', wishlistController.getWishlistByUserId);

// Agregar un producto a la lista de deseos
router.put('/user/:user_id/add', wishlistController.addProductToWishlist);

// Eliminar un producto de la lista de deseos
router.put('/user/:user_id/remove', wishlistController.removeProductFromWishlist);

// Eliminar una lista de deseos por ID
router.delete('/:id', wishlistController.deleteWishlist);

module.exports = router;
