const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener todos los productos
router.get('/', productController.getProducts); // Ruta para obtener todos los productos

// Crear un nuevo producto (requiere autenticación)
router.post('/create', authMiddleware, productController.createProduct);

// Obtener productos por usuario (requiere autenticación)
router.get('/user-products', authMiddleware, productController.getProductsByUser);

// Actualizar el estado del producto (requiere autenticación)
router.patch('/:id/status', authMiddleware, productController.updateProductStatus);

// Ruta para obtener las ofertas del día
router.get('/daily-deals', productController.getDailyDeals);

router.get('/daily-auctions', productController.getDailyAuctions);

router.get('/seller/:sellerId/products', productController.getProductsBySeller);

// Ruta en el backend
router.get('/recommendations', productController.getRecommendedProducts);

// Obtener producto por ID
router.get('/:productId', productController.getProductById);


router.delete('/:productId',authMiddleware ,productController.deleteProduct);

module.exports = router;
