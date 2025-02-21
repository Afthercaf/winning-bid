const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Product = require("../models/Product");
const User = require("../models/User");
const Role = require("../models/Role");
const WebSocketManager = require("../websocket");
const router = express.Router();
const bcrypt = require("bcrypt"); // Para encriptar contraseñas
const Conekta = require('conekta'); // SDK de Conekta
const axios = require("axios");

// Configurar Conekta
const { CustomersApi, Configuration, OrdersApi } = require("conekta");


// Constantes y configuración
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100; // Delay entre reintentos

// Utilitarios
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const validateBid = async (product, bidAmount, session) => {
    const currentMaxBid = await Bid.findOne({ auctionId: product._id })
        .sort({ bidAmount: -1 })
        .select('bidAmount')
        .session(session)
        .lean();

    const minValidPrice = currentMaxBid ? currentMaxBid.bidAmount : product.startingPrice;
    const minIncrease = product.minBidIncrement || 1; // Incremento mínimo configurable

    if (bidAmount <= minValidPrice) {
        throw new Error(`La puja debe ser mayor a $${minValidPrice}`);
    }

    if (bidAmount < minValidPrice + minIncrease) {
        throw new Error(`El incremento mínimo debe ser $${minIncrease}`);
    }

    return true;
};

const executeTransaction = async (session, productId, userId, bidAmount, user, product, req) => {
    // Validaciones adicionales de seguridad
    if (userId.toString() === product.sellerId?.toString()) {
        throw new Error("El vendedor no puede pujar en su propia subasta");
    }

    // Verificar si la subasta está activa
    const now = new Date();
    if (product.startTime && product.startTime > now) {
        throw new Error("La subasta aún no ha comenzado");
    }
    if (product.endTime && product.endTime < now) {
        throw new Error("La subasta ha finalizado");
    }

    // Validar la puja
    await validateBid(product, bidAmount, session);

    // Crear o actualizar la puja con optimistic locking
    const existingBid = await Bid.findOne({ 
        auctionId: productId, 
        userId 
    }).session(session);

    if (existingBid) {
        const result = await Bid.updateOne(
            { 
                _id: existingBid._id,
                bidAmount: { $lt: bidAmount } // Solo actualizar si la nueva puja es mayor
            },
            {
                $set: {
                    bidAmount: bidAmount,
                    bidTime: new Date()
                }
            },
            { session }
        );

        if (result.modifiedCount === 0) {
            throw new Error("No se pudo actualizar la puja - valor inferior o conflicto");
        }
    } else {
        await new Bid({
            auctionId: productId,
            userId,
            userName: user.name,
            bidAmount,
            bidTime: new Date(),
        }).save({ session });
    }

    // Actualizar el precio actual del producto con verificación
    const updatedProduct = await Product.findOneAndUpdate(
        { 
            _id: productId,
            currentPrice: { $lt: bidAmount }
        },
        {
            $set: { currentPrice: bidAmount },
            $inc: { totalBids: 1 }
        },
        { 
            session,
            new: true,
            runValidators: true
        }
    );

    if (!updatedProduct) {
        throw new Error("No se pudo actualizar el precio del producto - conflicto detectado");
    }

    // Obtener las pujas más altas de forma eficiente
    const topBids = await Bid.find({ auctionId: productId })
        .sort({ bidAmount: -1 })
        .limit(5)
        .select('userId userName bidAmount bidTime')
        .session(session)
        .lean();

    // Emitir actualización vía WebSocket
    req.io.to(productId).emit('bidUpdate', {
        productId,
        currentPrice: bidAmount,
        topBids: topBids.map(bid => ({
            userId: bid.userId,
            userName: bid.userName,
            bidAmount: bid.bidAmount,
            timestamp: bid.bidTime,
        })),
        totalBids: updatedProduct.totalBids
    });

    return { topBids, updatedProduct };
};

// Middleware de validación
const validateRequest = (req, res, next) => {
    const { userId, bidAmount } = req.body;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "IDs inválidos" });
    }

    if (!bidAmount || typeof bidAmount !== 'number' || bidAmount <= 0) {
        return res.status(400).json({ message: "Monto de puja inválido" });
    }

    next();
};

// Manejador principal de pujas
router.post("/:productId/bid", validateRequest, async (req, res) => {
    let retryCount = 0;
    const { productId } = req.params;
    const { userId, bidAmount } = req.body;

    while (retryCount < MAX_RETRIES) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Buscar usuario y producto con timeout
            const [user, product] = await Promise.all([
                User.findById(userId).session(session).lean(),
                Product.findById(productId).session(session).lean()
            ]);

            // Validaciones básicas
            if (!user) {
                throw new Error("Usuario no encontrado");
            }
            if (!product || product.type !== "subasta") {
                throw new Error("Producto no válido o no es una subasta");
            }

            // Ejecutar la transacción principal
            const result = await executeTransaction(
                session, 
                productId, 
                userId, 
                bidAmount, 
                user, 
                product, 
                req
            );

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: "Puja procesada con éxito",
                currentPrice: bidAmount,
                topBids: result.topBids,
                totalBids: result.updatedProduct.totalBids
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            const isWriteConflict = error.message.includes("Write conflict");
            
            if (isWriteConflict && retryCount < MAX_RETRIES - 1) {
                retryCount++;
                console.warn(`Conflicto de escritura detectado. Reintento ${retryCount + 1}/${MAX_RETRIES}`);
                await sleep(RETRY_DELAY_MS * Math.pow(2, retryCount)); // Backoff exponencial
                continue;
            }

            // Log detallado del error para debugging
            console.error('Error en proceso de puja:', {
                error: error.message,
                productId,
                userId,
                bidAmount,
                retryCount,
                timestamp: new Date()
            });

            return res.status(400).json({
                message: isWriteConflict 
                    ? "Sistema ocupado, por favor intente nuevamente"
                    : error.message || "Error al procesar la puja"
            });
        }
    }

    return res.status(429).json({
        message: "Demasiados intentos fallidos, por favor intente más tarde"
    });
});


// Obtener las pujas por ID del producto con paginación optimizada
router.get("/:productId/bids", async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (page - 1) * limit;
        const [bids, total] = await Promise.all([
            Bid.find({ auctionId: productId }).sort({ bidAmount: -1 }).skip(skip).limit(Number(limit)).lean(),
            Bid.countDocuments({ auctionId: productId }),
        ]);

        res.status(200).json({ bids, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
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
        if (bid.userId.toString() !== req.user.id) return res.status(403).json({ message: "No tienes permiso para eliminar esta puja" });

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
        const auctionIds = [...new Set(userBids.map((bid) => bid.auctionId._id.toString()))];

        const highestBids = await Bid.aggregate([
            { $match: { auctionId: { $in: auctionIds.map((id) => mongoose.Types.ObjectId(id)) } } },
            { $sort: { bidAmount: -1 } },
            { $group: { _id: "$auctionId", topBid: { $first: "$$ROOT" } } },
        ]);

        const wonBids = userBids.filter((bid) =>
            highestBids.some((topBid) => topBid.topBid.userId.toString() === userId && topBid._id.toString() === bid.auctionId._id.toString())
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
        res.status(500).json({ message: "Error al obtener el historial de pujas", error });
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
                    as: "auctionDetails"
                }
            },
            { $unwind: { path: "$auctionDetails", preserveNullAndEmptyArrays: true } }, // Descomponer el array resultante de $lookup
            {
                $project: {
                    bidId: "$_id",
                    bidAmount: 1,
                    bidTime: 1,
                    "auctionDetails.name": 1,
                    "auctionDetails.currentPrice": 1,
                    "auctionDetails.auctionEndTime": 1,
                    "auctionDetails.images": 1,
                    "auctionDetails.type": 1
                }
            }
        ]);

        if (!participatedAuctions || participatedAuctions.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        res.status(200).json({ success: true, data: participatedAuctions });
    } catch (error) {
        console.error("Error al obtener subastas:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});

const ADMIN_EMAIL = 'juanguapo@admin.com';

// Ruta para registrar un nuevo usuario con información de pago
router.post("/register", async (req, res) => {
    const { name, email, password, phone, avatar, cardNumber, bankAccount } = req.body;

    try {
        // Validar campos obligatorios
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        // Validar que la tarjeta tenga exactamente 16 dígitos
        if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
            return res.status(400).json({ message: "El número de tarjeta debe tener 16 dígitos" });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const role = await Role.findOne({ roleName: email === ADMIN_EMAIL ? 'admin' : 'cliente' }).lean();

        // Crear el nuevo usuario
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            avatar: avatar || 'uploads/avatar-default.webp',
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

        res.status(201).json({ message: "Usuario creado exitosamente", user: userResponse });
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: "Error al crear el usuario", error: error.message });
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

const createPayoutOrder = async (amount, customerId, seller, productId, sellerId, userId, orderId) => {
    try {
        const payoutResponse = await axios.post(
            "https://api.conekta.io/payout_orders",
            {
                amount: amount * 100, // Amount in cents
                currency: "MXN",
                reason: "cashout",
                customer_info: {
                    customer_id: customerId
                },
                payout: {
                    payout_method: {
                        type: "cashout", // Correct payout method type
                        card: {
                            token_id: seller.paymentInfo.cardToken
                        }
                    }
                },
                allowed_payout_methods: ["cashout"], // Correct format for allowed_payout_methods
                metadata: {
                    product_id: productId,
                    seller_id: sellerId,
                    buyer_id: userId,
                    order_id: orderId
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CONEKTA_API_KEY}`,
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.conekta-v2.1.0+json",
                    "Accept-Language": "es"
                }
            }
        );

        return payoutResponse.data;
    } catch (error) {
        console.error("❌ Error al crear la payout order:", error.response?.data || error.message);
        throw error;
    }
};

router.post("/pay", async (req, res) => {
    const { productId, userId, sellerId, amount } = req.body;

    try {
        // Validar los parámetros de entrada
        if (!mongoose.Types.ObjectId.isValid(userId) ||
            !mongoose.Types.ObjectId.isValid(sellerId) ||
            amount <= 0) {
            return res.status(400).json({ message: "Parámetros de entrada inválidos" });
        }

        // Buscar el comprador y el vendedor
        const User = mongoose.model('User');
        const buyer = await User.findById(userId);
        const seller = await User.findById(sellerId);

        if (!buyer || !seller) {
            return res.status(404).json({ message: "Comprador o vendedor no encontrado" });
        }

        console.log("✔ Usuario encontrado:", buyer.name);

        // Crear cliente en Conekta si no existe
        let customerId;
        try {
            customerId = await createCustomerIfNotExists(buyer);
        } catch (error) {
            console.error("❌ Error al crear el cliente en Conekta:", error);
            return res.status(500).json({ message: "Error al crear el cliente en Conekta" });
        }

        // Crear una orden en Conekta con pago en OXXO
        let order;
        try {
            order = await ordersClient.createOrder({
                currency: "MXN",
                customer_info: {
                    customer_id: customerId,
                },
                line_items: [{
                    name: `Pago C2C por producto ${productId}`,
                    unit_price: amount * 100,
                    quantity: 1,
                }],
                charges: [{
                    payment_method: {
                        type: "oxxo_cash",
                        expires_at: Math.floor(Date.now() / 1000) + 172800,
                    },
                }],
            });

            console.log("✔ Orden creada exitosamente:", order.data.id);
        } catch (error) {
            console.error("❌ Error al crear la orden en Conekta:", error.response?.data || error.message);
            return res.status(500).json({ message: "Error al crear la orden en Conekta" });
        }

        // Validar que el vendedor tenga una tarjeta registrada
        if (!seller.paymentInfo?.cardToken) {
            return res.status(400).json({ message: "El vendedor no tiene una tarjeta registrada para recibir pagos" });
        }

        // Crear payout order para transferir al vendedor
        let payoutOrder;
        try {
            payoutOrder = await createPayoutOrder(amount, customerId, seller, productId, sellerId, userId, order.data.id);
            console.log("✔ Payout order creada exitosamente:", payoutOrder.id);
        } catch (error) {
            if (error.response?.data?.details?.[0]?.code === 'conekta.errors.parameter_validation.payout.disabled') {
                return res.status(403).json({
                    message: "Su cuenta de Conekta no tiene habilitada la función de pagos a terceros. Por favor contacte a su ejecutivo de cuenta.",
                    details: error.response.data
                });
            }

            return res.status(500).json({ message: "Error al transferir fondos al vendedor", details: error.response?.data });
        }

        // Responder con éxito
        res.status(200).json({
            message: "Pago y orden de pago creados exitosamente",
            order: order.data,
            payoutOrder,
        });

    } catch (error) {
        console.error("❌ Error al procesar el pago:", error);
        res.status(500).json({ message: "Error al procesar el pago", error: error.message });
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
                    "Accept-Language": "es"
                }
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
                order_id: payoutData.metadata?.order_id
            }
        });
    } catch (error) {
        console.error("❌ Error al obtener el estado del pago:", error.response?.data || error.message);
        res.status(500).json({
            message: "Error al obtener el estado del pago",
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;

