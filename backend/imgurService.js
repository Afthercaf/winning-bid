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
