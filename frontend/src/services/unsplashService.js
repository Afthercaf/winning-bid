import axios from "axios";

// Obtener el Access Key de Unsplash desde el .env
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
  console.error("❌ Unsplash Access Key no está definido en las variables de entorno.");
}

// Función para buscar imágenes relacionadas en Unsplash
export const fetchUnsplashImage = async (query) => {
  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: { query, per_page: 1 },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    // Extraer la primera imagen encontrada
    const photo = response.data.results[0];

    return photo ? photo.urls.small : "https://via.placeholder.com/200"; // Imagen de respaldo si no encuentra resultados
  } catch (error) {
    console.error(`❌ Error al obtener imagen para "${query}" desde Unsplash:`, error.response?.data || error.message);
    return "https://via.placeholder.com/200"; // Imagen de respaldo en caso de error
  }
};
