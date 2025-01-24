const User = require('../models/User');
const Role = require('../models/Role'); // Importar el modelo de Role
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Para manejar la carga de archivos

const ADMIN_EMAIL = 'juanguapo@admin.com'; // Correo predefinido para el rol de administrador

// Configuración de multer para guardar los avatares en la carpeta `uploads`
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Verificar si el correo corresponde a un administrador
        let role = await Role.findOne({ roleName: 'cliente' });
        if (email === ADMIN_EMAIL) {
            const adminRole = await Role.findOne({ roleName: 'admin' });
            if (adminRole) role = adminRole; // Asignar el rol de administrador si existe
        }

        // Crear el nuevo usuario con la contraseña encriptada y rol asignado
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role._id,
            phone,
            avatar: 'uploads/avatar-default.webp' // Avatar por defecto
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Error creando el usuario: ' + error.message });
    }
};

// Iniciar sesión de usuario
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('role');
        if (!user) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user._id, role: user.role.roleName }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user });
    } catch (error) {
        console.error('Error en el login:', error);  // Agrega esta línea para imprimir el error en el servidor
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Obtener usuarios paginados
exports.getUsers = async (req, res) => {
    const { page = 1, limit = 20 } = req.query; // Valores por defecto: página 1, 20 resultados por página

    try {
        // Obtener usuarios con paginación
        const users = await User.find()
            .populate('role') // Poblar la información del rol
            .skip((page - 1) * limit) // Saltar los registros correspondientes
            .limit(Number(limit)); // Limitar la cantidad de registros

        // Contar el número total de usuarios
        const totalUsers = await User.countDocuments();

        // Enviar la respuesta con datos y metadatos de la paginación
        res.status(200).json({
            data: users,
            total: totalUsers,
            page: Number(page),
            totalPages: Math.ceil(totalUsers / limit),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los usuarios: ' + error.message });
    }
};


// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el usuario: ' + error.message });
    }
};

// Actualizar un usuario por ID
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('role');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: 'Error actualizando el usuario: ' + error.message });
    }
};

// Subir o actualizar avatar de usuario
exports.updateAvatar = [
    upload.single('avatar'), // Middleware de multer para manejar la carga de archivo
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            user.avatar = req.file.path; // Guardar la ruta del archivo subido en el avatar del usuario
            await user.save();

            res.status(200).json({ message: 'Avatar actualizado correctamente', user });
        } catch (error) {
            res.status(400).json({ error: 'Error actualizando el avatar: ' + error.message });
        }
    }
];

// Eliminar un usuario por ID
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando el usuario: ' + error.message });
    }
};

// Obtener avatar de usuario por ID
exports.getAvatar = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      // Asegura que 'avatar' tenga un valor de ruta válido
      res.status(200).json({ avatar: user.avatar || '/uploads/avatar-default.webp' });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el avatar' });
    }
  };
  
  // Obtener el número total de clientes
  exports.getTotalClientes = async (req, res) => {
    try {
        const totalClientes = await User.countDocuments(); // Cuenta todos los documentos en la colección de usuarios
        res.status(200).json({ total: totalClientes });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el total de clientes: ' + error.message });
    }
};

// Obtener los últimos 3 usuarios agregados
exports.getLatestUsers = async (req, res) => {
    try {
      const latestUsers = await User.find().sort({ createdAt: -1 }).limit(3);
      res.status(200).json(latestUsers);
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo los últimos usuarios: ' + error.message });
    }
  };

  