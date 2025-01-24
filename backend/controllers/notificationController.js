const Notification = require('../models/Notification');

// Crear una nueva notificación
exports.createNotification = async (req, res) => {
    try {
        const { user_id, message } = req.body;
        const newNotification = new Notification({ user_id, message });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({ error: 'Error creando la notificación: ' + error.message });
    }
};

// Obtener todas las notificaciones de un usuario
exports.getNotificationsByUserId = async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.params.user_id });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las notificaciones: ' + error.message });
    }
};

// Marcar una notificación como leída
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        if (!notification) return res.status(404).json({ message: 'Notificación no encontrada' });
        res.status(200).json(notification);
    } catch (error) {
        res.status(400).json({ error: 'Error marcando como leída: ' + error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user_id: req.params.user_id, read: false }, { $set: { read: true } });
        res.status(200).json({ message: 'Notificaciones marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ error: 'Error marcando las notificaciones como leídas: ' + error.message });
    }
};

// Eliminar una notificación por ID
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notificación no encontrada' });
        res.status(200).json({ message: 'Notificación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando la notificación: ' + error.message });
    }
};
