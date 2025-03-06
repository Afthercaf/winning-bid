const User = require('../models/User');
const Role = require('../models/Role'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const ADMIN_EMAIL = 'juanguapo@admin.com';

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Crear usuario optimizado
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const role = await Role.findOne({ roleName: email === ADMIN_EMAIL ? 'admin' : 'cliente' }).lean();

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role._id,
            phone,
            avatar: 'uploads/avatar-default.webp'
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario creado', user: newUser });
    } catch (error) {
        res.status(400).json({ error: 'Error creando usuario: ' + error.message });
    }
};

// Login optimizado
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('role').lean();
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user._id, role: user.role.roleName }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Obtener usuarios con paginación optimizada
exports.getUsers = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    try {
        const [users, totalUsers] = await Promise.all([
            User.find().populate('role').skip((page - 1) * limit).limit(Number(limit)).lean(),
            User.countDocuments()
        ]);

        res.status(200).json({ data: users, total: totalUsers, page: Number(page), totalPages: Math.ceil(totalUsers / limit) });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo usuarios' });
    }
};

// Obtener usuario por ID optimizado
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role').lean();
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el usuario' });
    }
};

// Actualizar usuario optimizado
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('role').lean();
        if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: 'Error actualizando usuario' });
    }
};

// Actualizar avatar optimizado
exports.updateAvatar = [
    upload.single('avatar'),
    async (req, res) => {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, { avatar: req.file.path }, { new: true }).lean();
            if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

            res.status(200).json({ message: 'Avatar actualizado', user: updatedUser });
        } catch (error) {
            res.status(400).json({ error: 'Error actualizando avatar' });
        }
    }
];

// Eliminar usuario optimizado
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando usuario' });
    }
};

// Obtener avatar por ID optimizado
exports.getAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id, 'avatar').lean();
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.status(200).json({ avatar: user.avatar || '/uploads/avatar-default.webp' });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo avatar' });
    }
};

// Obtener total de clientes optimizado
exports.getTotalClientes = async (req, res) => {
    try {
        const totalClientes = await User.countDocuments();
        res.status(200).json({ total: totalClientes });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo total de clientes' });
    }
};

// Obtener últimos 3 usuarios optimizado
exports.getLatestUsers = async (req, res) => {
    try {
        const latestUsers = await User.find({}, 'name email createdAt').sort({ createdAt: -1 }).limit(3).lean();
        res.status(200).json(latestUsers);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los últimos usuarios' });
    }
};

  
exports.deactivateUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.opportunities > 1) {
            user.opportunities -= 1;
            await user.save();
            return res.status(200).json({ message: `Oportunidad reducida. Oportunidades restantes: ${user.opportunities}`, user });
        } else {
            user.isActive = false;
            user.opportunities = 0;
            await user.save();
            return res.status(200).json({ message: 'Cuenta desactivada', user });
        }
    } catch (error) {
        console.error('Error al desactivar la cuenta:', error.message);
        res.status(500).json({ message: 'Error al desactivar la cuenta', error });
    }
};

exports.activateAllUsers = async (req, res) => {
    try {
        // Buscar y actualizar todas las cuentas desactivadas
        const result = await User.updateMany(
            {}, // Actualizar todos los documentos
            { 
                $set: { 
                    isActive: true, // Establecer isActive como true
                    opportunities: 3 // Establecer oportunidades como 3
                } 
            },
            { upsert: false } // No crear nuevos documentos si no existen
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No se encontraron cuentas para actualizar' });
        }

        res.status(200).json({ message: `Se actualizaron ${result.modifiedCount} cuentas` });
    } catch (error) {
        console.error('Error activando todas las cuentas:', error.message);
        res.status(500).json({ message: 'Error activando todas las cuentas', error });
    }
};

exports.activateUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.isActive) {
            return res.status(200).json({ message: 'La cuenta ya está activa', user });
        }

        user.isActive = true;
        user.opportunities = 3; // Restablecer las oportunidades a 3 (o el valor que desees)
        await user.save();

        res.status(200).json({ message: 'Cuenta activada exitosamente', user });
    } catch (error) {
        console.error('Error activando la cuenta:', error.message);
        res.status(500).json({ message: 'Error activando la cuenta', error });
    }
};