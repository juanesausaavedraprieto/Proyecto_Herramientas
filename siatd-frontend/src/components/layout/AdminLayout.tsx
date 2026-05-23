import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings, LogOut } from 'lucide-react';

export const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const adminLinks = [
        { name: 'Panel Principal', icon: LayoutDashboard, path: '/admin' },
        { name: 'Gestión de Usuarios', icon: Users, path: '/admin/users' },
        { name: 'Auditoría Global', icon: Activity, path: '/admin/audit' },
        { name: 'Configuración SIATD', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar Exclusivo del Admin */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-black text-white tracking-tight">SIATD <span className="text-indigo-500">Admin</span></h1>
                    <p className="text-xs font-bold text-slate-500 uppercase mt-2 tracking-widest">Centro de Control</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {adminLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-bold"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal (Outlet) */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};