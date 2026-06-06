import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Aquí definimos nuestros diccionarios
const resources = {
    es: {
        translation: {
            sidebar: {
                dashboard: "Panel de Control",
                newDecision: "Nueva Decisión",
                history: "Historial",
                profile: "Mi Perfil",
                admin: "Administración",
                users: "Gestión de Usuarios",
                settings: "Configuración",
                logout: "Cerrar Sesión"
            },
            admin: {
                dashboard: "Panel Principal",
                users: "Gestión de Usuarios",
                audit: "Auditoría Global",
                settings: "Configuración SIATD",
                systemLogs: "Registros del Sistema"
            },
            common: {
                welcome: "Bienvenido a SIATD",
                loading: "Cargando..."
            }
        }
    },
    en: {
        translation: {
            sidebar: {
                dashboard: "Dashboard",
                newDecision: "New Decision",
                history: "History",
                profile: "My Profile",
                admin: "Administration",
                users: "User Management",
                settings: "Settings",
                logout: "Logout"
            },
            admin: {
                dashboard: "Main Dashboard",
                users: "User Management",
                audit: "Global Audit",
                settings: "SIATD Settings",
                systemLogs: "System Logs"
            },
            common: {
                welcome: "Welcome to SIATD",
                loading: "Loading..."
            }
        }
    }
};

i18n
    .use(initReactI18next) // Conecta i18n con React
    .init({
        resources,
        lng: "es", // Idioma por defecto
        fallbackLng: "en", // Si falla algo, usa inglés
        interpolation: {
            escapeValue: false // React ya nos protege de ataques XSS
        }
    });

export default i18n;