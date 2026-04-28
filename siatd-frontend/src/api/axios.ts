import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // IMPORTANTE: El espacio después de 'Bearer ' es obligatorio
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🚀 Enviando Token:", token.substring(0, 10) + "...");
    } else {
        console.warn("⚠️ No se encontró token en LocalStorage");
    }
    return config;
});