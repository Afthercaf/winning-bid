// controllers/categoryController.js
const Category = require('../models/Category');

// Crear una nueva categoría
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(400).json({ message: 'No se pudo crear la categoría.' });
  }
};

// Obtener todas las categorías
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías.' });
  }
};

const uri =
  "mongodb+srv://mikecrafrosado:uganbzTZm69Rmxgm@inegradora.3gsb4.mongodb.net/marketapp?retryWrites=true&w=majority&appName=inegradora";

// Función para obtener usuarios con paginación
const getUsers = async (req, res) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Conectado a MongoDB para obtener usuarios");

    const database = client.db("tecnoshop");
    const collection = database.collection("usuarios");

    // Parámetros para paginación
    const page = parseInt(req.query.page) || 1; // Página actual
    const limit = parseInt(req.query.limit) || 10; // Usuarios por página
    const skip = (page - 1) * limit; // Usuarios a omitir

    // Consultar usuarios con paginación
    const users = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    // Contar el total de usuarios
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
  } finally {
    await client.close();
  }
};
