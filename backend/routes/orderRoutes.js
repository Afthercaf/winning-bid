const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); // Asegúrate de que la ruta sea correcta

// 🔹 *Ruta para crear una orden con Conekta (OXXO)*
router.post('/create-order-conekta', orderController.createOrderC);

// 🔹 *Ruta para crear una orden y generar notificaciones*
router.post('/create-order', orderController.createOrder);

// 🔹 *Ruta para obtener los detalles de una orden*
router.get('/order-details/:orderId', orderController.getOrderDetails);

module.exports = router;