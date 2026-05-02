import { useState, useEffect } from 'react';
import { Moon, Sun, Shield, User, Bell, ChevronRight } from 'lucide-react';
import { Link} from 'react-router-dom';
export const Settings = () => {
    // Estado para el interruptor visual
    const [isDark, setIsDark] = useState(false);

    // Al montar el componente, revisamos si ya estaba activado el modo oscuro
    useEffect(() => {
        const isDarkStored = document.documentElement.classList.contains('dark') ||
            localStorage.getItem('theme') === 'dark';
        setIsDark(isDarkStored);
    }, []);

    // Lógica para alternar el tema
    const toggleDarkMode = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 min-h-screen transition-colors duration-300">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-8">Configuración</h1>

            <div className="space-y-4">

                {/* --- SECCIÓN: TEMA --- */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-colors ${isDark ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">Modo Oscuro</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Alternar tema visual del sistema</p>
                        </div>
                    </div>

                    {/* Switch Custom con Tailwind */}
                    <button
                        onClick={toggleDarkMode}
                        className={`w-14 h-8 flex items-center rounded-full p-1 duration-300 ease-in-out ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${isDark ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* --- SECCIÓN: PERFIL --- */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all hover:border-blue-200 dark:hover:border-blue-900">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">Información del Perfil</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Gestionar nombre y datos personales</p>
                        </div>
                    </div>

                    {/* Cambiamos el button por Link */}
                    <Link
                        to="/profile"
                        className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline flex items-center gap-1"
                    >
                        Editar
                    </Link>
                </div>

                {/* --- SECCIÓN: NOTIFICACIONES --- */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">Notificaciones</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Alertas de decisiones y recordatorios</p>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-400 w-5 h-5" />
                </div>

                {/* --- SECCIÓN: SEGURIDAD --- */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">Seguridad</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Cambiar contraseña y 2FA</p>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-400 w-5 h-5" />
                </div>

            </div>

            {/* Pie de página de configuración */}
            <p className="mt-12 text-center text-slate-400 text-xs">
                SIATD v1.0.4 — Sistema Inteligente de Apoyo a la Toma de Decisiones
            </p>
        </div>
    );
};