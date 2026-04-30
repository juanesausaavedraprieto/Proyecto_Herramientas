import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    // Si la URL incluye '/auth/', no buscamos token ni avisamos nada
    if (config.url?.includes('/auth/')) {
        return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // Solo avisar si NO es una ruta de auth y no hay token
        console.warn("⚠️ No se encontró token para una ruta protegida");
    }
    return config;
});