import { Users, Shield, Trash2 } from 'lucide-react';

export const UserManagement = () => {
    return (
        <div className="max-w-6xl mx-auto mt-6 animate-in fade-in">
            <div className="flex items-center gap-3 mb-8">
                <Shield className="w-8 h-8 text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Gestión de Usuarios</h1>
                    <p className="text-slate-500">Panel exclusivo de Administración</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-10 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-bold text-slate-700">Módulo en Construcción</h2>
                    <p>Aquí listaremos a todos los usuarios consumiendo un endpoint GET /api/users.</p>
                </div>
            </div>
        </div>
    );
};