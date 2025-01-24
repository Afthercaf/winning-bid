const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Crear una nueva orden y generar notificaciones
exports.createOrder = async (req, res) => {
    try {
        console.log("Datos recibidos en el backend:", req.body); // Agrega este log
        const { product_id, buyer_id, seller_id, price } = req.body;

        // Verifica que todos los campos estén presentes
        if (!product_id || !buyer_id || !seller_id || typeof price !== 'number') {
            return res.status(400).json({ error: 'Faltan campos requeridos o el precio no es un número.' });
        }

        // Crear la nueva orden
        const newOrder = new Order({ product_id, buyer_id, seller_id, price });
        await newOrder.save();

        // Crear notificación para el comprador
        const buyerNotification = new Notification({
            user_id: buyer_id,
            message: `Tu compra está en proceso.`
        });
        await buyerNotification.save();

        // Crear notificación para el vendedor
        const sellerNotification = new Notification({
            user_id: seller_id,
            message: `Un usuario ha comprado tu producto, clic aquí para ver detalles.`
        });
        await sellerNotification.save();

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error al crear la orden y notificaciones:", error.message);
        res.status(400).json({ error: 'Error creando la orden y notificaciones: ' + error.message });
    }
};


// Obtener todas las órdenes
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('product_id', 'title')
            .populate('buyer_id', 'name email')
            .populate('seller_id', 'name email');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las órdenes: ' + error.message });
    }
};

// Obtener una orden por ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('product_id', 'title')
            .populate('buyer_id', 'name email')
            .populate('seller_id', 'name email');
        if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo la orden: ' + error.message });
    }
};

// Endpoint para finalizar la venta
exports.finalizeOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: 'completado' },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Orden no encontrada' });
      }
  
      // Crear la notificación para el comprador
      const notification = new Notification({
        user_id: updatedOrder.buyer_id,
        message: 'Su compra ha sido confirmada y finalizada.'
      });
      await notification.save();
  
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error al finalizar la orden:", error);
      res.status(500).json({ error: 'Error al finalizar la orden' });
    }
  };
  


// Eliminar una orden por ID
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
        res.status(200).json({ message: 'Orden eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando la orden: ' + error.message });
    }
};

// Obtener ganancias totales y cambio porcentual en el último mes
exports.getGanancias = async (req, res) => {
    try {
        const fechaActual = new Date();
        const primerDiaMesActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        const primerDiaMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
        const ultimoDiaMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0);

        const ordenesMesActual = await Order.find({
            status: 'completado',
            created_at: { $gte: primerDiaMesActual }
        });

        const ordenesMesAnterior = await Order.find({
            status: 'completado',
            created_at: { $gte: primerDiaMesAnterior, $lte: ultimoDiaMesAnterior }
        });

        const gananciasMesActual = ordenesMesActual.reduce((total, order) => total + order.price, 0);
        const gananciasMesAnterior = ordenesMesAnterior.reduce((total, order) => total + order.price, 0);

        let cambioPorcentual = 0;
        if (gananciasMesAnterior > 0) {
            cambioPorcentual = ((gananciasMesActual - gananciasMesAnterior) / gananciasMesAnterior) * 100;
        }

        res.status(200).json({
            total: gananciasMesActual || 0,
            cambioPorcentual: parseFloat(cambioPorcentual.toFixed(2)) || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las ganancias: ' + error.message });
    }
};

// Obtener el número total de productos vendidos
exports.getProductosVendidos = async (req, res) => {
    try {
        const totalProductosVendidos = await Order.countDocuments({ status: 'completado' });
        res.status(200).json({ total: totalProductosVendidos });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los productos vendidos: ' + error.message });
    }
};

// Obtener los últimos 3 productos vendidos
exports.getLastSoldProducts = async (req, res) => {
    try {
        const lastSoldProducts = await Order.find({ status: 'completado' })
            .sort({ created_at: -1 })
            .limit(3)
            .populate('product_id', 'title');

        res.status(200).json(lastSoldProducts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los últimos productos vendidos: ' + error.message });
    }
};

// Obtener las ventas mensuales
exports.getMonthlySales = async (req, res) => {
    try {
        const sales = await Order.aggregate([
            { $match: { status: 'completado' } },
            {
                $group: {
                    _id: { $month: '$created_at' },
                    totalSales: { $sum: '$price' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formattedSales = sales.map(sale => ({
            month: sale._id,
            totalSales: sale.totalSales
        }));

        res.status(200).json(formattedSales);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las ventas mensuales: ' + error.message });
    }
};

exports.getOrdersByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const orders = await Order.find({ product_id: productId })
            .populate('buyer_id', 'name email')
            .populate('seller_id', 'name email')
            .populate('product_id', 'name price'); // Populamos datos del producto si es necesario

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes para este producto' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error al obtener las órdenes por productId:", error.message);
        res.status(500).json({ error: 'Error al obtener las órdenes del producto' });
    }
};

