const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Product = require("../models/Product");
const User = require("../models/User");
const Role = require("../models/Role");
const Order = require("../models/Order");
const WebSocketManager = require("../websocket");
const router = express.Router();
const bcrypt = require("bcrypt"); // Para encriptar contraseñas
const Conekta = require("conekta"); // SDK de Conekta
const axios = require("axios");

// Configurar Conekta
const { CustomersApi, Configuration, OrdersApi } = require("conekta");

// Validación de pujas
const validateBid = async (product, bidAmount) => {
  const currentMaxPrice = await Bid.findOne({ auctionId: product._id })
    .sort({ bidAmount: -1 })
    .select("bidAmount")
    .lean(); // Usar lean() para obtener un objeto plano y mejorar el rendimiento

  const minValidPrice = currentMaxPrice
    ? currentMaxPrice.bidAmount
    : product.startingPrice;
  if (bidAmount <= minValidPrice) {
    throw new Error(`La puja debe ser mayor a $${minValidPrice}`);
  }
  return true;
};

// Función auxiliar para reintento
const retryTransaction = async (callback, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callback();
    } catch (error) {
      if (attempt === maxRetries || !error.message.includes("Write conflict")) {
        throw error;
      }
      // Esperar un tiempo aleatorio antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
    }
  }
};

// Ruta para crear o actualizar una puja
router.post("/:productId/bid-j", async (req, res) => {
  try {
    await retryTransaction(async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const { productId } = req.params;
        const { userId, bidAmount } = req.body;

        // Validar los parámetros de entrada
        if (
          !mongoose.Types.ObjectId.isValid(userId) ||
          !mongoose.Types.ObjectId.isValid(productId) ||
          bidAmount <= 0
        ) {
          throw new Error("Parámetros de entrada inválidos");
        }

        // Buscar el usuario y el producto
        const user = await User.findById(userId).session(session);
        const product = await Product.findById(productId).session(session);

        if (!user) throw new Error("Usuario no encontrado");
        if (!product || product.type !== "subasta")
          throw new Error("Producto no válido");

        if (product.endTime && product.endTime < new Date()) {
          throw new Error("La subasta ha finalizado");
        }

        // Validar la puja
        await validateBid(product, bidAmount);

        // Actualizar o crear la puja
        const existingBid = await Bid.findOne({
          auctionId: productId,
          userId,
        }).session(session);

        if (existingBid) {
          existingBid.bidAmount = bidAmount;
          existingBid.bidTime = new Date();
          await existingBid.save({ session });
        } else {
          const newBid = new Bid({
            auctionId: productId,
            userId,
            userName: user.name,
            bidAmount,
            bidTime: new Date(),
          });
          await newBid.save({ session });
        }

        // Actualizar el precio actual del producto
        await Product.findByIdAndUpdate(
          productId,
          {
            currentPrice: bidAmount,
          },
          { session }
        );

        // Obtener las 5 pujas más altas
        const topBids = await Bid.find({ auctionId: productId })
          .sort({ bidAmount: -1 })
          .limit(5)
          .session(session);

        // Emitir el evento de WebSocket
        req.io.to(productId).emit("bidUpdate", {
          productId,
          currentPrice: bidAmount,
          topBids: topBids.map((bid) => ({
            userId: bid.userId,
            userName: bid.userName,
            bidAmount: bid.bidAmount,
            timestamp: bid.bidTime,
          })),
        });

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    });

    res.status(200).json({ message: "Puja actualizada con éxito" });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Error al crear o actualizar la puja",
    });
  }
});

// Obtener las pujas por ID del producto con paginación optimizada
router.get("/:productId/bids", async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;
    const [bids, total] = await Promise.all([
      Bid.find({ auctionId: productId })
        .sort({ bidAmount: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Bid.countDocuments({ auctionId: productId }),
    ]);

    res.status(200).json({
      bids,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las pujas", error });
  }
});

// Eliminar una puja con validación de usuario
router.delete("/d/:bidId", async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId).lean();

    if (!bid) return res.status(404).json({ message: "Puja no encontrada" });
    if (bid.userId.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta puja" });

    await Bid.findByIdAndDelete(bidId);
    res.status(200).json({ message: "Puja eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la puja", error });
  }
});

// Obtener subastas en las que el usuario ha participado y si ganó alguna
router.get("/:userId/bids2", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    // Obtener las pujas del usuario
    const userBids = await Bid.find({ userId })
      .populate("auctionId", "name currentPrice endTime image")
      .lean();

    if (!userBids.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Obtener las subastas ganadas de forma optimizada
    const auctionIds = [
      ...new Set(userBids.map((bid) => bid.auctionId._id.toString())),
    ];

    const highestBids = await Bid.aggregate([
      {
        $match: {
          auctionId: {
            $in: auctionIds.map((id) => mongoose.Types.ObjectId(id)),
          },
        },
      },
      { $sort: { bidAmount: -1 } },
      { $group: { _id: "$auctionId", topBid: { $first: "$$ROOT" } } },
    ]);

    const wonBids = userBids.filter((bid) =>
      highestBids.some(
        (topBid) =>
          topBid.topBid.userId.toString() === userId &&
          topBid._id.toString() === bid.auctionId._id.toString()
      )
    );

    res.status(200).json({
      success: true,
      data: wonBids.map((bid) => ({
        id: bid._id,
        name: bid.auctionId.name,
        finalPrice: bid.bidAmount,
        date: bid.bidTime.toLocaleDateString(),
        image: bid.auctionId.image,
        status: "won",
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el historial de pujas", error });
  }
});

// Obtener subastas en las que el usuario ha participado
router.get("/:userId/participated-auctions", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // Verificar si el usuario existe antes de continuar
    const userExists = await User.findById(objectIdUserId);
    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener subastas en las que el usuario ha participado
    const participatedAuctions = await Bid.aggregate([
      { $match: { userId: objectIdUserId } }, // Filtrar por userId
      {
        $lookup: {
          from: "products", // Nombre de la colección de productos en la base de datos
          localField: "auctionId",
          foreignField: "_id",
          as: "auctionDetails",
        },
      },
      {
        $unwind: { path: "$auctionDetails", preserveNullAndEmptyArrays: true },
      }, // Descomponer el array resultante de $lookup
      {
        $project: {
          bidId: "$_id",
          bidAmount: 1,
          bidTime: 1,
          "auctionDetails.name": 1,
          "auctionDetails.currentPrice": 1,
          "auctionDetails.auctionEndTime": 1,
          "auctionDetails.images": 1,
          "auctionDetails.type": 1,
        },
      },
    ]);

    if (!participatedAuctions || participatedAuctions.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: participatedAuctions });
  } catch (error) {
    console.error("Error al obtener subastas:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
});

const ADMIN_EMAIL = "juanguapo@admin.com";

// Ruta para registrar un nuevo usuario con información de pago
router.post("/register", async (req, res) => {
  const { name, email, password, phone, avatar, cardNumber, bankAccount } =
    req.body;

  try {
    // Validar campos obligatorios
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nombre, correo y contraseña son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Validar que la tarjeta tenga exactamente 16 dígitos
    if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
      return res
        .status(400)
        .json({ message: "El número de tarjeta debe tener 16 dígitos" });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = await Role.findOne({
      roleName: email === ADMIN_EMAIL ? "admin" : "cliente",
    }).lean();

    // Crear el nuevo usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      avatar: avatar || "uploads/avatar-default.webp",
      role: role._id,
      paymentInfo: {
        cardToken: cardNumber ? `tok_${cardNumber.slice(-4)}` : null, // Guardar solo los últimos 4 dígitos como token
        last4Digits: cardNumber ? cardNumber.slice(-4) : null, // Guardar los últimos 4 dígitos para referencia
        bankAccount, // Información de cuenta bancaria (opcional)
      },
    });

    // Guardar el usuario en la base de datos
    await newUser.save();

    // Responder con el usuario creado (sin la contraseña)
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", user: userResponse });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    res
      .status(500)
      .json({ message: "Error al crear el usuario", error: error.message });
  }
});

require("dotenv").config();

// Configuración de Conekta
const API_KEY = process.env.CONEKTA_API_KEY; // Usar variable de entorno
const config = new Configuration({ accessToken: API_KEY });
const customersClient = new CustomersApi(config);
const ordersClient = new OrdersApi(config);

Conekta.api_key = process.env.CONEKTA_API_KEY;
console.log(Conekta.api_key);
Conekta.locale = "es"; // Configurar idioma español

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

const createPayoutOrder = async (
  amount,
  customerId,
  seller,
  productId,
  sellerId,
  userId,
  orderId
) => {
  try {
    const payoutResponse = await axios.post(
      "https://api.conekta.io/payout_orders",
      {
        amount: amount * 100, // Amount in cents
        currency: "MXN",
        reason: "cashout",
        customer_info: {
          customer_id: customerId,
        },
        payout: {
          payout_method: {
            type: "cashout", // Correct payout method type
            card: {
              token_id: seller.paymentInfo.cardToken,
            },
          },
        },
        allowed_payout_methods: ["cashout"], // Correct format for allowed_payout_methods
        metadata: {
          product_id: productId,
          seller_id: sellerId,
          buyer_id: userId,
          order_id: orderId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CONEKTA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.conekta-v2.1.0+json",
          "Accept-Language": "es",
        },
      }
    );

    return payoutResponse.data;
  } catch (error) {
    console.error(
      "❌ Error al crear la payout order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

router.post("/pay", async (req, res) => {
  const { productId, userId, sellerId, amount } = req.body;

  try {
    // Validar los parámetros de entrada
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(sellerId) ||
      amount <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Parámetros de entrada inválidos" });
    }

    // Buscar el comprador y el vendedor
    const User = mongoose.model("User");
    const buyer = await User.findById(userId);
    const seller = await User.findById(sellerId);

    if (!buyer || !seller) {
      return res
        .status(404)
        .json({ message: "Comprador o vendedor no encontrado" });
    }

    console.log("✔ Usuario encontrado:", buyer.name);

    // Crear cliente en Conekta y orden
    const customerId = await createCustomerIfNotExists(buyer);
    const conektaOrder = await ordersClient.createOrder({
      currency: "MXN",
      customer_info: {
        customer_id: customerId,
      },
      line_items: [
        {
          name: `Pago C2C por producto ${productId}`,
          unit_price: amount * 100,
          quantity: 1,
        },
      ],
      charges: [
        {
          payment_method: {
            type: "oxxo_cash",
            expires_at: Math.floor(Date.now() / 1000) + 172800,
          },
        },
      ],
    });

    const payoutOrder = await createPayoutOrder(
      amount,
      customerId,
      seller,
      productId,
      sellerId,
      userId,
      conektaOrder.data.id
    );

    // Guardar la orden en la base de datos
    const newOrder = new Order({
      product_id: productId,
      buyer_id: userId,
      seller_id: sellerId,
      price: amount,
      status: "pendiente",
      conekta_order_id: conektaOrder.data.id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await newOrder.save();

    console.log("💾 Orden guardada en la base de datos:", newOrder._id);

    // Responder con éxito
    res.status(200).json({
      message: "Pago y orden de pago creados exitosamente",
      order: {
        ...conektaOrder.data,
        internal_order_id: newOrder._id,
      },
      payoutOrder,
    });
  } catch (error) {
    console.error("❌ Error al procesar el pago:", error);
    res.status(500).json({
      message: "Error al procesar el pago",
      error: error.message,
    });
  }
});

// Ruta para que el vendedor consulte el estado del pago
router.get("/payout/status/:payoutOrderId", async (req, res) => {
  const { payoutOrderId } = req.params;

  try {
    // Hacer la solicitud a Conekta para obtener el estado del pago
    const payoutResponse = await axios.get(
      `https://api.conekta.io/payout_orders/${payoutOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CONEKTA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.conekta-v2.1.0+json",
          "Accept-Language": "es",
        },
      }
    );

    // Extraer la información del pago
    const payoutData = payoutResponse.data;

    res.status(200).json({
      message: "Estado del pago obtenido exitosamente",
      payoutOrder: {
        id: payoutData.id,
        amount: payoutData.amount / 100, // Convertir de centavos a MXN
        currency: payoutData.currency,
        status: payoutData.status, // pending, paid, failed
        created_at: payoutData.created_at,
        updated_at: payoutData.updated_at,
        expires_at: payoutData.expires_at,
        seller_id: payoutData.metadata?.seller_id,
        buyer_id: payoutData.metadata?.buyer_id,
        order_id: payoutData.metadata?.order_id,
      },
    });
  } catch (error) {
    console.error(
      "❌ Error al obtener el estado del pago:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Error al obtener el estado del pago",
      error: error.response?.data || error.message,
    });
  }
});

// Ruta para registrar información de pago del vendedor
router.post("/register-payment-info", async (req, res) => {
  try {
    const { userId, cardNumber, bankAccount, clabe } = req.body;

    // Validar que el usuario existe
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Objeto para almacenar la información de pago actualizada
    const paymentInfo = {};

    // Validar y procesar la tarjeta si se proporciona
    if (cardNumber) {
      // Validar que la tarjeta tenga exactamente 16 dígitos
      if (!/^\d{16}$/.test(cardNumber)) {
        return res.status(400).json({
          message: "El número de tarjeta debe tener 16 dígitos",
        });
      }
      paymentInfo.cardToken = `tok_${cardNumber.slice(-4)}`;
      paymentInfo.last4Digits = cardNumber.slice(-4);
    }

    // Validar y procesar la CLABE si se proporciona
    if (clabe) {
      // Validar que la CLABE tenga exactamente 18 dígitos
      if (!/^\d{18}$/.test(clabe)) {
        return res.status(400).json({
          message: "La CLABE debe tener 18 dígitos",
        });
      }
      paymentInfo.clabe = clabe;
    }

    // Validar y procesar la cuenta bancaria si se proporciona
    if (bankAccount) {
      // Validar el formato de la cuenta bancaria (ajusta según tus necesidades)
      if (!/^\d{10,16}$/.test(bankAccount)) {
        return res.status(400).json({
          message: "Número de cuenta bancaria inválido",
        });
      }
      paymentInfo.bankAccount = bankAccount;
    }

    // Verificar que se proporcionó al menos un método de pago
    if (Object.keys(paymentInfo).length === 0) {
      return res.status(400).json({
        message:
          "Debe proporcionar al menos un método de pago (tarjeta, CLABE o cuenta bancaria)",
      });
    }

    // Actualizar la información de pago del usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: { paymentInfo },
      },
      { new: true }
    ).select("-password");

    // Crear o actualizar el cliente en Conekta si es necesario
    try {
      await createCustomerIfNotExists({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    } catch (error) {
      console.error("⚠️ Error al registrar en Conekta:", error);
      // No detenemos el proceso si falla Conekta
    }

    res.status(200).json({
      message: "Información de pago actualizada exitosamente",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        paymentInfo: updatedUser.paymentInfo,
      },
    });
  } catch (error) {
    console.error("❌ Error al registrar información de pago:", error);
    res.status(500).json({
      message: "Error al actualizar la información de pago",
      error: error.message,
    });
  }
});

// Ruta para obtener todos los productos vendidos de un vendedor
router.get("/:sellerId/sales", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    console.log("⭐ Buscando ventas para el vendedor:", sellerId);

    // Validar el ID del vendedor
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "ID de vendedor inválido" });
    }

    // Construir el filtro base
    const filter = { seller_id: new mongoose.Types.ObjectId(sellerId) };

    // Agregar filtro por estado si se proporciona
    if (status) {
      filter.status = status;
    }

    console.log("📋 Filtro de búsqueda:", JSON.stringify(filter));

    // Calcular el skip para la paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Pipeline de agregación
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "buyer_id",
          foreignField: "_id",
          as: "buyerInfo",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$buyerInfo" },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 1,
          conekta_order_id: 1,
          price: 1,
          status: 1,
          created_at: 1,
          updated_at: 1,
          buyer: {
            id: "$buyerInfo._id",
            name: "$buyerInfo.name",
            email: "$buyerInfo.email",
          },
          product: {
            id: "$productInfo._id",
            name: "$productInfo.name",
            price: "$productInfo.currentPrice",
            image: "$productInfo.image",
            type: "$productInfo.type",
          },
        },
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ];

    console.log("🔍 Ejecutando pipeline de agregación...");

    // Ejecutar la agregación
    const [sales, totalCount] = await Promise.all([
      mongoose.model("Order").aggregate(pipeline),
      mongoose.model("Order").countDocuments(filter),
    ]);

    console.log("📊 Resultados encontrados:", sales.length);
    console.log("📈 Total de documentos:", totalCount);

    // Verificar si hay órdenes en la base de datos
    const totalOrders = await mongoose.model("Order").countDocuments({});
    console.log("🔢 Total de órdenes en la base de datos:", totalOrders);

    // Calcular el total de páginas
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        sales,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener ventas del vendedor:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las ventas",
      error: error.message,
    });
  }
});

// Ruta para obtener productos ganados por un comprador
router.get("/:buyerId/won-products", async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log('⭐ Buscando productos ganados para el comprador:', buyerId);

    // Validar el ID del comprador
    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(400).json({ message: "ID de comprador inválido" });
    }

    // Construir el filtro base
    const filter = { 
      buyer_id: new mongoose.Types.ObjectId(buyerId),
      status: { $in: ['pendiente', 'confirmado_por_vendedor', 'completado'] }
    };

    // Calcular el skip para la paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Pipeline de agregación
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "seller_id",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$sellerInfo" },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 1,
          conekta_order_id: 1,
          price: 1,
          status: 1,
          created_at: 1,
          updated_at: 1,
          seller: {
            id: "$sellerInfo._id",
            name: "$sellerInfo.name",
            email: "$sellerInfo.email",
          },
          product: {
            id: "$productInfo._id",
            name: "$productInfo.name",
            price: "$productInfo.currentPrice",
            image: "$productInfo.image",
            type: "$productInfo.type",
            description: "$productInfo.description"
          }
        },
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ];

    console.log('🔍 Ejecutando pipeline de agregación...');

    // Ejecutar la agregación
    const [wonProducts, totalCount] = await Promise.all([
      mongoose.model("Order").aggregate(pipeline),
      mongoose.model("Order").countDocuments(filter),
    ]);

    console.log('📊 Productos ganados encontrados:', wonProducts.length);
    console.log('📈 Total de productos:', totalCount);

    // Calcular el total de páginas
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        wonProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener productos ganados:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los productos ganados",
      error: error.message,
    });
  }
});

module.exports = router;
