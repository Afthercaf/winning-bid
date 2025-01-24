const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Crear un nuevo mensaje o conversación
router.post('/', messageController.createMessage);

// Obtener todas las conversaciones
router.get('/', messageController.getMessages);

// Obtener una conversación por ID de la orden
router.get('/order/:order_id', messageController.getMessageByOrderId);

// Eliminar una conversación por ID
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
