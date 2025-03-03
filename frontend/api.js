// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://winning-bid-zmiw.onrender.com/api', // Cambia esto por tu URL de API
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            try {
                const response = await axios.post('https://winning-bid-zmiw.onrender.com/auth/refresh-token', { token: refreshToken });
                const newAccessToken = response.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (err) {
                console.error("Refresh token expired or invalid.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login'; // Redirige al login si ambos tokens son inválidos
            }
        }
        return Promise.reject(error);
    }
);

export default api;
