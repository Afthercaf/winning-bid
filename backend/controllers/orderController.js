const { CustomersApi, Configuration, OrdersApi } = require("conekta");
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require('mongoose');
const Conekta = require('conekta');
const axios = require('axios');
const Bid = require("../models/Bid");

// 🔹 *Configuración de Conekta*
const API_KEY = "key_lucr1u8feoEOd6BY9nQuPZp"; // Reemplaza con tu clave privada
const config = new Configuration({ accessToken: API_KEY });
const customersClient = new CustomersApi(config);
const ordersClient = new OrdersApi(config);

// 🔹 *Función para validar ObjectId de MongoDB*
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 🔹 *Función reutilizable para manejar errores*
const handleError = (res, message, error) => {
  console.error(`❌ ${message}:`, error);
    return res.status(500).json({ message, error: error.message });
};



// 🔹 *Crear un Cliente en Conekta si no existe*
const createCustomerIfNotExists = async (user) => {
    try {
        console.log("🔍 Buscando cliente en Conekta...");
        const customerData = {
            name: user.name,
            email: user.email,
            phone: user.phone,
        };

        const customerResponse = await customersClient.createCustomer(customerData);
        console.log("✔ Cliente creado en Conekta:", customerResponse.data.id);
        return customerResponse.data.id;
    } catch (error) {
        console.error("❌ Error creando el cliente en Conekta:", error);
        throw new Error("Error al crear el cliente en Conekta");
    }
};

exports.createOrderC = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    console.log("📌 ID de producto recibido:", productId);
    console.log("📌 ID de usuario recibido:", userId);
    console.log("📌 Método de pago: OXXO");

    // 🔹 *Validar IDs*
    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ message: "ID de usuario o producto no válido" });
    }

    // 🔹 *Obtener Producto*
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    console.log("✔ Producto encontrado:", product.name);

    // 🔹 *Obtener Usuario*
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    console.log("✔ Usuario encontrado:", user.name);

    // 🔹 *Definir el precio*
    const price = product.currentPrice || product.startingPrice;
    console.log("💰 Precio a pagar:", price);

    // 🔹 *Obtener o Crear Cliente en Conekta*
    let customerId;
    try {
      customerId = await createCustomerIfNotExists(user);
    } catch (error) {
      return handleError(res, "Error al crear el cliente en Conekta", error);
    }

    // 🔹 *Crear Orden en Conekta (Solo OXXO)*
    const orderRequest = {
      currency: "MXN",
      customer_info: {
        customer_id: customerId,
      },
      line_items: [
        {
          name: product.name,
          unit_price: price * 100, // Conekta usa centavos
          quantity: 1,
        },
      ],
      charges: [
        {
          payment_method: {
            type: "oxxo_cash",
            expires_at: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60, // Expira en 3 días
          },
        },
      ],
    };

    console.log("📤 Enviando solicitud de orden a Conekta...");
    const orderResponse = await ordersClient.createOrder(orderRequest);

    console.log("✔ Orden creada en Conekta:", orderResponse.data.id);

    // 🔹 *Guardar la Orden en la Base de Datos*
    const newOrder = new Order({
      product_id: productId,
      buyer_id: userId,
      seller_id: product.seller_id,
      price,
      status: "pendiente",
      conekta_order_id: orderResponse.data.id,
    });

    await newOrder.save();
    console.log("✔ Orden guardada en la base de datos:", newOrder);

    // 🔹 *Obtener la información de pago de OXXO*
    const chargeData = orderResponse.data.charges.data[0]?.payment_method || {};
    const responsePayload = {
      message: "Orden creada correctamente",
      orderId: newOrder._id,
      reference: chargeData.reference || "N/A",
      barcodeUrl: chargeData.barcode_url || "N/A",
      paymentStatus: orderResponse.data.payment_status || "N/A",
    };

    res.status(200).json(responsePayload);

  } catch (error) {
    return handleError(res, "❌ Error general al crear la orden en Conekta", error);
  }
};
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

// 🔹 *Obtener los detalles de una orden*
exports.getOrderDetails = async (req, res) => {
  try {
      const { orderId } = req.params;

      console.log('📌 ID de la orden recibida:', orderId);

      // Verificar que el ID es un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
          return res.status(400).json({ message: 'ID de la orden no válido' });
      }

      // Buscar la orden en la base de datos
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Orden no encontrada' });

      console.log('✔ Orden encontrada:', order);

        // Obtener información del usuario
        const user = await User.findById(order.buyer_id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

      // Realizar la solicitud HTTP a la API de Conekta
      const response = await axios.get(`https://api.conekta.io/orders/${order.conekta_order_id}`, {
          headers: {
              'Accept': 'application/vnd.conekta-v2.0.0+json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${API_KEY}`
          }
      });

      console.log('Detalles de la orden en Conekta:', response.data);

      // Devolver los detalles de la orden en formato JSON
      res.status(200).json({
          paymentReference: response.data.charges.data[0].payment_method.reference,
          barcodeUrl: response.data.charges.data[0].payment_method.barcode_url,
          order: order,
          winnerName: user.name, // Agregar el nombre del ganador
          conektaDetails: response.data
      });
  } catch (error) {
      console.error('Error al obtener los detalles de la orden:', error);
      res.status(500).json({ message: 'Error al obtener los detalles de la orden', error: error.message });
  }
};