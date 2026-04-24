// src/components/layout/MainLayout.tsx
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Brain, History, Settings, LayoutDashboard } from 'lucide-react';

export const MainLayout = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Nueva Decisión', path: '/new-decision', icon: Brain },
        { name: 'Historial', path: '/history', icon: History },
        { name: 'Configuración', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">SIATD Experto</h1>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar simple */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Área de Trabajo
                    </h2>
                </header>

                {/* Renderiza el componente de la ruta actual */}
                <div className="flex-1 overflow-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};