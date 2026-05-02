import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Brain,
    History,
    Settings,
    LayoutDashboard,
    LogOut,
    User as UserIcon, // Usamos UserIcon para la navegación de Perfil
    ChevronUp,
} from 'lucide-react';

export const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userName, setUserName] = useState('Usuario');

    // Recuperar el nombre guardado al hacer login
    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
        // Usamos navigate en lugar de reload para una mejor UX, 
        // pero si tu app depende del estado global limpio, reload es aceptable.
        window.location.reload();
    };

    // Lista de ítems de navegación corregida
    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Nueva Decisión', path: '/new-decision', icon: Brain },
        { name: 'Historial', path: '/history', icon: History },
        { name: 'Configuración', path: '/settings', icon: Settings },
        { name: 'Mi Perfil', path: '/profile', icon: UserIcon }, // Corregido el icono y la ruta
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">

                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-md shadow-blue-200">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">SIATD Experto</h1>
                </div>

                {/* Navegación Principal */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* SECCIÓN DE USUARIO (INFERIOR) */}
                <div className="p-4 border-t border-gray-100 relative">

                    {/* Menú Desplegable (Popup hacia arriba) */}
                    {isProfileOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            <button
                                onClick={() => {
                                    navigate('/profile');
                                    setIsProfileOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-sm text-slate-600"
                            >
                                <UserIcon className="w-4 h-4" />
                                Ver mi Perfil
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/settings');
                                    setIsProfileOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-sm text-slate-600 border-t border-gray-50"
                            >
                                <Settings className="w-4 h-4" />
                                Ajustes
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 transition-colors text-sm text-red-600 font-semibold border-t border-gray-100"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}

                    {/* Botón de Perfil en Sidebar */}
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isProfileOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-white shadow-md">
                            {userName.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cuenta Activa</p>
                        </div>

                        {/* Flecha */}
                        <ChevronUp
                            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-0' : 'rotate-180'
                                }`}
                        />
                    </button>
                </div>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* Header de la Aplicación */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between z-10">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Área de Trabajo
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-emerald-700">SERVIDOR ACTIVO</span>
                        </div>
                    </div>
                </header>

                {/* Contenedor de Vistas (Outlet) */}
                <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};