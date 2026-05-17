import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Asegúrate de que esta sea tu URL
});

// 🚨 EL INTERCEPTOR: Se ejecuta mágicamente antes de cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Opcional: Interceptor de respuesta para cerrar sesión si el token expira (Error 401/403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Si el token expiró, limpiamos y mandamos al login
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);