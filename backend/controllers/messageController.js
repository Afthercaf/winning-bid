const Message = require('../models/Message');

// Crear un nuevo mensaje o conversación
exports.createMessage = async (req, res) => {
    try {
        const { order_id, participants, content, sender_id } = req.body;

        // Verificar si ya existe una conversación para la orden
        let message = await Message.findOne({ order_id });

        if (message) {
            // Si existe, agregar el nuevo mensaje a la conversación
            message.messages.push({ sender_id, content });
            await message.save();
        } else {
            // Si no existe, crear una nueva conversación
            message = new Message({
                order_id,
                participants,
                messages: [{ sender_id, content }]
            });
            await message.save();
        }

        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: 'Error enviando el mensaje: ' + error.message });
    }
};

// Obtener todas las conversaciones
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .populate('participants', 'name email')
            .populate('messages.sender_id', 'name email');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las conversaciones: ' + error.message });
    }
};

// Obtener una conversación por ID de la orden
exports.getMessageByOrderId = async (req, res) => {
    try {
        const message = await Message.findOne({ order_id: req.params.order_id })
            .populate('participants', 'name email')
            .populate('messages.sender_id', 'name email');
        if (!message) return res.status(404).json({ message: 'Conversación no encontrada' });
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo la conversación: ' + error.message });
    }
};

// Eliminar una conversación por ID
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) return res.status(404).json({ message: 'Conversación no encontrada' });
        res.status(200).json({ message: 'Conversación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando la conversación: ' + error.message });
    }
};
