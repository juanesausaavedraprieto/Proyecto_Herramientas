// src/services/auth.service.ts
import axios from 'axios';

// URL base de tu backend Spring Boot (cámbiala si usas otro puerto en local)
const API_URL = 'http://localhost:8080/api/auth';

// Opcional: Definimos cómo esperamos que nos responda el backend (ej. con un JWT)
export interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export const authService = {
    // Petición POST para Iniciar Sesión
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
            email,
            password,
        });
        return response.data;
    },

    // Petición POST para Registrarse
    register: async (userData: { name: string; email: string; age: number; password: string }) => {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    },
};