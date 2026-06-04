import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Asegúrate de que esta sea tu URL
});

// 🚨 EL INTERCEPTOR DE PETICIÓN: Se ejecuta antes de cada petición
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

// 🪄 INTERCEPTOR DE RESPUESTA CORREGIDO
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Verificamos si la petición falló con 401 o 403
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {

            // 🚨 EXCEPCIÓN CLAVE: Si el error viene de la ruta de login, NO redirigir ni limpiar el almacenamiento
            if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
                return Promise.reject(error); // Deja que el catch de Login.tsx maneje el error y muestre el toast
            }

            // Comportamiento normal para el resto de la aplicación (Token expirado)
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userBirthDate');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);