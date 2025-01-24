require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { Server: SocketServer } = require("socket.io");
const http = require("http");
const { MongoClient } = require("mongodb");

// Importar rutas
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const messageRoutes = require("./routes/messageRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const bidRoutes = require("./routes/bidRoutes");

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;

// Configurar CORS
app.use(
  cors({
    origin: "*",
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

// Rutas para cada recurso
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bids", bidRoutes);

// Configuración de Socket.IO
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("message", (data) => {
    console.log("Nuevo mensaje recibido:", data);
    io.emit("message", data);
  });

  socket.on("bidPlaced", (bidData) => {
    console.log("Nueva puja realizada:", bidData);
    io.emit("bidUpdate", bidData);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

// Configuración de MongoDB Client
const mongoClient = new MongoClient(process.env.MONGODB_URI);

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