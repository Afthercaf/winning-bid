const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Crear una nueva notificación
router.post('/', notificationController.createNotification);

// Obtener todas las notificaciones de un usuario
router.get('/user/:user_id', notificationController.getNotificationsByUserId);

// Marcar una notificación como leída
router.put('/:id/read', notificationController.markAsRead);

router.put('/user/:user_id/read', notificationController.markAllAsRead);

// Eliminar una notificación por ID
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
