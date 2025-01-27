const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const WebSocketManager = require("./websocket");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const allRouter = require("./routes/allRouter");
const bidRoutes = require("./routes/bidRoutes");

const app = express();

const PORT = process.env.PORT;

// Configurar CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Cambia esto por el origen de tu frontend
    credentials: true,
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

// Usar el router consolidado
app.use("/api", allRouter);
app.use("/api/bids", bidRoutes);

// Configuración de Socket.IO
// Inicializar WebSocket
const websocketManager = new WebSocketManager(app);
const server = websocketManager.getServer();
const io = websocketManager.getIO();

// Configuración de MongoDB Client
const mongoClient = new MongoClient(process.env.MONGODB_URI);

// Endpoint para crear o actualizar usuarios
app.post("/api/users", async (req, res) => {
  const { userId, name, email } = req.body;

  try {
    await mongoClient.connect();
    const database = mongoClient.db("tecnoshop");
    const collection = database.collection("usuarios");

    const existingUser = await collection.findOne({ userId });

    if (existingUser) {
      await collection.updateOne(
        { userId },
        { $set: { name, email, updatedAt: new Date() } }
      );
      res.status(200).json({ message: "Usuario actualizado con éxito" });
    } else {
      await collection.insertOne({ userId, name, email, createdAt: new Date() });
      res.status(201).json({ message: "Usuario creado con éxito" });
    }
  } catch (error) {
    console.error("Error al crear o actualizar el usuario:", error);
    res.status(500).json({ error: "Error al crear o actualizar el usuario" });
  } finally {
    await mongoClient.close();
  }
});

// Endpoint para obtener usuarios
app.get("/api/users2", async (req, res) => {
  try {
    await mongoClient.connect();
    console.log("Conectado a MongoDB para obtener usuarios");

    const database = mongoClient.db("tecnoshop");
    const collection = database.collection("usuarios");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await collection.find({}).skip(skip).limit(limit).toArray();
    const totalUsers = await collection.countDocuments();

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
    await mongoClient.connect();
    const database = mongoClient.db("tecnoshop");
    const collection = database.collection("bids");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bids = await collection
      .find({ productId })
      .sort({ bidTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const totalBids = await collection.countDocuments({ productId });

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

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
