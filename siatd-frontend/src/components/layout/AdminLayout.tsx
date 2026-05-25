import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 👈 Importamos el hook
import { LayoutDashboard, Users, Activity, Settings, LogOut, Globe } from 'lucide-react'; // 👈 Añadimos Globe

export const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 👈 Inicializamos la traducción
    const { t, i18n } = useTranslation();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // 👈 Función para cambiar el idioma
    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    // 👈 Mapeo con t()
    const adminLinks = [
        { name: t('admin.dashboard'), icon: LayoutDashboard, path: '/admin' },
        { name: t('admin.users'), icon: Users, path: '/admin/users' },
        { name: t('admin.audit'), icon: Activity, path: '/admin/audit' },
        { name: t('admin.settings'), icon: Settings, path: '/admin/settings' },
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

                <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
                    {/* 👈 Botón de Idioma */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors font-bold uppercase tracking-wider"
                    >
                        <Globe className="w-4 h-4" />
                        {i18n.language === 'es' ? 'English' : 'Español'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-bold"
                    >
                        <LogOut className="w-5 h-5" />
                        {t('sidebar.logout')}
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