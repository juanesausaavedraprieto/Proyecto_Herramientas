import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Users, Shield, Trash2, Loader2, UserCheck, UserX } from 'lucide-react';

export const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error al obtener el listado de usuarios", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'ADMIN' ? 'ESTUDIANTE' : 'ADMIN';
        if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`)) return;

        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error al mutar privilegios de usuario", error);
            alert("No se pudo actualizar el rol.");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("¿Deseas eliminar permanentemente a este usuario del sistema? Esta acción borrará sus análisis relacionados.")) return;

        try {
            await api.delete(`/admin/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Error al purgar usuario", error);
            alert("Error al intentar remover la cuenta seleccionada.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="mt-4 text-slate-500 font-medium">Sincronizando registros con la base de datos...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><Shield className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-slate-500 mt-1">Control operativo de accesos, credenciales y asignación de roles.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                                <th className="p-4 font-bold">Nombre Completo</th>
                                <th className="p-4 font-bold">Correo Electrónico</th>
                                <th className="p-4 font-bold">Rol Asignado</th>
                                <th className="p-4 font-bold text-center">Acciones de Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-slate-400 font-medium">
                                        No se encuentran usuarios registrados adicionales.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                                        <td className="p-4 text-slate-600 font-medium">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-black rounded-full tracking-wider uppercase ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-3 justify-center">
                                            <button
                                                onClick={() => handleToggleRole(user.id, user.role)}
                                                className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all"
                                                title="Alternar Permisos"
                                            >
                                                {user.role === 'ADMIN' ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                                                Cambiar Rol
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl transition-all"
                                                title="Eliminar Cuenta"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remover
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};