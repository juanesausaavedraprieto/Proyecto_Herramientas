import { useState } from 'react';
import { User, Mail, ShieldCheck, Edit2, Save, X, Loader2, Lock } from 'lucide-react';

export const Profile = () => {
    // Estado principal del usuario
    const [user, setUser] = useState({
        name: localStorage.getItem('userName') || 'Usuario Estudiante',
        email: localStorage.getItem('userEmail') || 'juan@correo.com', // Asume que tienes el correo guardado, si no, usa el default
        role: 'ESTUDIANTE'
    });

    // Estados para manejar la edición
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Estado temporal para los cambios en el formulario
    const [formData, setFormData] = useState({
        name: user.name
    });

    // Activar modo edición
    const handleEditClick = () => {
        setFormData({ name: user.name }); // Reseteamos el form al valor actual
        setIsEditing(true);
    };

    // Cancelar edición
    const handleCancel = () => {
        setIsEditing(false);
    };

    // Guardar cambios
    const handleSave = async () => {
        if (!formData.name.trim()) return; // Evitar guardar nombres vacíos

        setIsLoading(true);
        try {
            // AQUÍ IRÍA TU LLAMADA A LA API (ej. api.put('/users/me', formData))
            // Simulamos un tiempo de carga de 1 segundo para el efecto visual
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Actualizamos el estado local
            setUser(prev => ({ ...prev, name: formData.name }));

            // Actualizamos el localStorage para que el Sidebar/Navbar se enteren
            localStorage.setItem('userName', formData.name);

            // Desactivamos el modo edición
            setIsEditing(false);

            // Opcional: Podrías disparar un evento para que otros componentes se actualicen
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error("Error al actualizar el perfil", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Mi Perfil</h1>

                {/* Botones de Acción Superiores */}
                {!isEditing ? (
                    <button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors font-semibold shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar Perfil
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-red-500 transition-colors font-semibold disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-200 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
                {/* Cabecera del Perfil (Banner) */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 h-32 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    {/* Badge de Rol */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">
                        {user.role}
                    </div>
                </div>

                <div className="pt-20 p-8 space-y-8">
                    {/* Formulario de Datos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Campo: Nombre (Editable) */}
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-1">
                                Nombre Completo
                            </label>
                            <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${isEditing ? 'bg-white border-blue-400 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-100'}`}>
                                <User className={`w-5 h-5 ${isEditing ? 'text-blue-500' : 'text-slate-400'}`} />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent outline-none text-slate-800 font-semibold placeholder-slate-300"
                                        placeholder="Ingresa tu nombre completo"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-slate-700 font-semibold">{user.name}</span>
                                )}
                            </div>
                        </div>

                        {/* Campo: Correo (Bloqueado) */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                    Correo Electrónico
                                </label>
                                {isEditing && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> No editable</span>}
                            </div>
                            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 opacity-80 cursor-not-allowed">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-600 font-medium w-full truncate">{user.email}</span>
                            </div>
                        </div>

                    </div>

                    {/* Tarjeta de Seguridad */}
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl flex items-start sm:items-center gap-4 transition-all">
                        <div className="bg-emerald-100 p-3 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-900 mb-0.5">Cuenta Verificada y Segura</p>
                            <p className="text-xs text-emerald-700 font-medium leading-relaxed">Tu acceso está protegido mediante autenticación con cifrado JWT en el servidor. Tus datos están seguros.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};