const Payment = require('../models/Payment');

// Crear un nuevo pago
exports.createPayment = async (req, res) => {
    try {
        const { order_id, user_id, amount, method } = req.body;
        const newPayment = new Payment({ order_id, user_id, amount, method });
        await newPayment.save();
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(400).json({ error: 'Error creando el pago: ' + error.message });
    }
};

// Obtener todos los pagos
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('order_id', 'status')
            .populate('user_id', 'name email');
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los pagos: ' + error.message });
    }
};

// Obtener un pago por ID
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('order_id', 'status')
            .populate('user_id', 'name email');
        if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el pago: ' + error.message });
    }
};

// Actualizar el estado de un pago
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
        res.status(200).json(payment);
    } catch (error) {
        res.status(400).json({ error: 'Error actualizando el pago: ' + error.message });
    }
};

// Eliminar un pago por ID
exports.deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
        res.status(200).json({ message: 'Pago eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando el pago: ' + error.message });
    }
};
