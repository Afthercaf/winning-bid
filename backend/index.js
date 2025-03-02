const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const WebSocketManager = require("./websocket");
require("dotenv").config();

const allRouter = require("./routes/allRouter");
const bidRoutes = require("./routes/bidRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : process.env.CORS_ORIGIN || "*";

// Configurar CORS para Web y Móviles
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para leer JSON
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conexión exitosa a MongoDB Atlas"))
  .catch((err) => console.error("Error al conectar a MongoDB Atlas:", err));

// Servir archivos estáticos desde la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Iniciar el servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Inicializar WebSocket
const websocketManager = new WebSocketManager(server);
const io = websocketManager.getIO();

// Pasar io a las rutas
app.use((req, res, next) => {
  req.io = io; // Inyectar io en el request
  next();
});

// Usar el router consolidado
app.use("/api", allRouter);
app.use("/api/bids", bidRoutes);


// Endpoint para crear o actualizar usuarios
app.post("/api/users", async (req, res) => {
  const { userId, name, email } = req.body;

  try {
    const existingUser = await User.findOne({ userId });

    if (existingUser) {
      await User.updateOne(
        { userId },
        { $set: { name, email, updatedAt: new Date() } }
      );
      res.status(200).json({ message: "Usuario actualizado con éxito" });
    } else {
      await User.create({ userId, name, email, createdAt: new Date() });
      res.status(201).json({ message: "Usuario creado con éxito" });
    }
  } catch (error) {
    console.error("Error al crear o actualizar el usuario:", error);
    res.status(500).json({ error: "Error al crear o actualizar el usuario" });
  }
});




// Endpoint para obtener usuarios
app.get("/api/users2", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}).skip(skip).limit(limit);
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      data: users,
      page,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Ruta para obtener las ofertas por ID del producto
app.get("/api/bids2/:productId", async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bids = await Bid.find({ productId })
      .sort({ bidTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBids = await Bid.countDocuments({ productId });

    res.json({
      status: "success",
      bids,
      pagination: {
        total: totalBids,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    res.status(500).json({ status: "error", message: "Error al obtener las ofertas" });
  }
});



