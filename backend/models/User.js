const mongoose = require('mongoose');

// Definir el esquema de usuario
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    avatar: {
        type: String,
        default: 'uploads/avatar-default.webp', // Imagen por defecto para el avatar
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role', // Relación con la colección Role
    },
    ratings: [
        {
            reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: String,
            rating: Number,
            date: { type: Date, default: Date.now },
        }
    ],
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {   
        type: Date,
        default: Date.now,
    },
    playerId: {
        type: String,
    },
});

// Crear el modelo de usuario usando el esquema definido
const User = mongoose.model('User', userSchema);

// Exportar el modelo
module.exports = User;
