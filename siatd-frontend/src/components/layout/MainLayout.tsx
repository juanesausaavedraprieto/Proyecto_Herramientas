import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Brain,
    History,
    Settings,
    LayoutDashboard,
    LogOut,
    User as UserIcon,
    ChevronUp,
    Users,
} from 'lucide-react';

export const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userName, setUserName] = useState('Usuario');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        const storedRole = localStorage.getItem('userRole');
        if (storedName) setUserName(storedName);
        if (storedRole) setUserRole(storedRole);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        navigate('/login');
        window.location.reload();
    };

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Nueva Decisión', path: '/new-decision', icon: Brain },
        { name: 'Historial', path: '/history', icon: History },
        { name: 'Configuración', path: '/settings', icon: Settings },
        { name: 'Mi Perfil', path: '/profile', icon: UserIcon },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-colors duration-300">

                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-md shadow-blue-200 dark:shadow-blue-900">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SIATD Experto</h1>
                </div>

                {/* Navegación principal */}
                <nav className="flex-1 px-4 py-4 overflow-y-auto">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Solo  para AdmIN */}
                    {userRole === 'ADMIN' && (
                        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase px-3 tracking-widest">
                                Administración
                            </p>
                            <Link
                                to="/admin/users"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${location.pathname === '/admin/users'
                                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <Users className={`w-5 h-5 ${location.pathname === '/admin/users' ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                                Gestión de Usuarios
                            </Link>
                        </div>
                    )}
                </nav>

                {/*  Usuario(Inferior) */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 relative">

                    {/* Menú Desplegable */}
                    {isProfileOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            <button
                                onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-600 dark:text-slate-300"
                            >
                                <UserIcon className="w-4 h-4" />
                                Ver mi Perfil
                            </button>
                            <button
                                onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-600 dark:text-slate-300 border-t border-gray-50 dark:border-slate-700"
                            >
                                <Settings className="w-4 h-4" />
                                Ajustes
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-600 dark:text-red-400 font-semibold border-t border-gray-100 dark:border-slate-700"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}

                    {/* Botón perfil */}
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isProfileOpen
                            ? 'bg-gray-100 dark:bg-slate-700'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-white shadow-md">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                {userRole === 'ADMIN' ? 'Administrador' : 'Cuenta Activa'}
                            </p>
                        </div>
                        <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-0' : 'rotate-180'}`} />
                    </button>
                </div>
            </aside>

            {/* --- Principal --- */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center px-8 justify-between z-10 transition-colors duration-300">
                    <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Área de Trabajo
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">SERVIDOR ACTIVO</span>
                        </div>
                    </div>
                </header>

                {/* Contenedor de Vistas */}
                <div className="flex-1 overflow-auto p-8 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};