const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Crear un nuevo pago
router.post('/', paymentController.createPayment);

// Obtener todos los pagos
router.get('/', paymentController.getPayments);

// Obtener un pago por ID
router.get('/:id', paymentController.getPaymentById);

// Actualizar el estado de un pago
router.put('/:id', paymentController.updatePaymentStatus);

// Eliminar un pago por ID
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
