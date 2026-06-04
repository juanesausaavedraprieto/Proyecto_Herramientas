import { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, Edit2, Save, X, Loader2, Lock, Cake } from 'lucide-react';
import { api } from '../../api/axios';
import { toast } from 'sonner';

export const Profile = () => {
    // Estado inicial (mientras carga el backend)
    const [user, setUser] = useState({
        name: localStorage.getItem('userName') || 'Cargando...',
        email: localStorage.getItem('userEmail') || 'Cargando...',
        role: localStorage.getItem('userRole') || 'USER',
        birthDate: ''
    });

    const [formData, setFormData] = useState({ name: '', birthDate: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // 🚨 NUEVO: Cargar los datos reales desde la Base de Datos al entrar
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('/users/me');
                const userData = response.data;

                // Limpiamos la fecha por si viene con horas (ej: "1998-05-12T00:00:00")
                const cleanDate = userData.birthDate ? userData.birthDate.split('T')[0] : '';

                setUser({
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    birthDate: cleanDate
                });

                setFormData({
                    name: userData.name,
                    birthDate: cleanDate
                });

                // Sincronizamos el LocalStorage para que el resto de la app (como el Sidebar) se actualice
                localStorage.setItem('userName', userData.name);
                localStorage.setItem('userBirthDate', cleanDate);

            } catch (error) {
                console.error("Error al cargar perfil desde BD:", error);
                toast.error("No se pudieron sincronizar tus datos más recientes.");
            } finally {
                setIsFetching(false);
            }
        };

        loadProfile();
    }, []);

    // --- Funciones Auxiliares para la Edad ---
    const calculateAge = (dateString: string) => {
        if (!dateString) return null;
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'No registrada';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };
    // -----------------------------------------

    const handleEditClick = () => {
        setFormData({ name: user.name, birthDate: user.birthDate });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("El nombre no puede estar vacío");
            return;
        }

        setIsLoading(true);
        try {
            await api.put('/users/me', {
                name: formData.name,
                birthDate: formData.birthDate
            });

            setUser(prev => ({ ...prev, name: formData.name, birthDate: formData.birthDate }));
            localStorage.setItem('userName', formData.name);
            localStorage.setItem('userBirthDate', formData.birthDate);

            setIsEditing(false);
            window.dispatchEvent(new Event('storage'));
            toast.success("¡Perfil actualizado con éxito!");

        } catch (error) {
            console.error("Error al actualizar el perfil", error);
            toast.error("No se pudo actualizar el perfil. Revisa tu conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    const age = calculateAge(user.birthDate);

    if (isFetching) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="mt-4 text-slate-500 font-medium">Sincronizando perfil...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Mi Perfil</h1>

                {!isEditing ? (
                    <button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar Perfil
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors font-semibold disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 dark:bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 h-32 relative">
                    <div className="absolute top-4 right-4 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">
                        {user.role}
                    </div>

                    <div className="absolute -bottom-12 left-8 flex items-end gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/30 dark:shadow-none transform transition-transform hover:scale-105 z-10">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {age !== null && (
                            <div className="mb-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm animate-in slide-in-from-left-2">
                                🎂 {age} años
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-20 p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
                                Nombre Completo
                            </label>
                            <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-400 dark:border-blue-500 ring-4 ring-blue-50 dark:ring-blue-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                                <User className={`w-5 h-5 ${isEditing ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent outline-none text-slate-800 dark:text-white font-semibold placeholder-slate-300 dark:placeholder-slate-500"
                                        placeholder="Ingresa tu nombre completo"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{user.name}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
                                Fecha de Nacimiento
                            </label>
                            <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-400 dark:border-blue-500 ring-4 ring-blue-50 dark:ring-blue-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                                <Cake className={`w-5 h-5 ${isEditing ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full bg-transparent outline-none text-slate-800 dark:text-white font-semibold cursor-text"
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                ) : (
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold">
                                        {formatDate(user.birthDate)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    Correo Electrónico
                                </label>
                                {isEditing && <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> No editable</span>}
                            </div>
                            <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 opacity-80 cursor-not-allowed">
                                <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                <span className="text-slate-600 dark:text-slate-400 font-medium w-full truncate">{user.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-start sm:items-center gap-4 transition-all">
                        <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400 mb-0.5">Cuenta Verificada y Segura</p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium leading-relaxed">Tu acceso está protegido mediante autenticación con cifrado JWT en el servidor. Tus datos están seguros.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};