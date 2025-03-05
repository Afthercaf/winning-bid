import axios from 'axios';

export const uploadImageToImgur = async (file) => {
    try {
        const image = file.buffer.toString('base64'); // Convierte el buffer de la imagen a Base64

        const response = await axios.post(
            'https://api.imgur.com/3/image', // Endpoint de Imgur para subir imágenes
            { image }, // Envía la imagen en formato Base64
            {
                headers: {
                    Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`, // Usa tu Client ID
                },

            }
        );

        // Devuelve la URL pública de la imagen subida
        return response.data.data.link;
    } catch (error) {
        console.error('Error al subir imagen a Imgur:', error.response?.data || error.message);
        throw new Error('No se pudo subir la imagen a Imgur.');
    }
};

import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import streamifier from 'streamifier';

config(); // Cargar variables de entorno

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'productos' }, // Carpeta en Cloudinary
            (error, result) => {
                if (error) {
                    console.error('Error subiendo imagen a Cloudinary:', error);
                    reject(new Error('No se pudo subir la imagen a Cloudinary.'));
                } else {
                    resolve(result.secure_url); // URL de la imagen subida
                }
            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};
