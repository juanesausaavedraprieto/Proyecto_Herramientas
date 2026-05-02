import { useState, useEffect } from 'react';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';

export const Profile = () => {
    const [user, setUser] = useState({
        name: localStorage.getItem('userName') || 'Usuario',
        email: 'juan@correo.com', // Esto lo podrías traer de un endpoint /auth/me
        role: 'ESTUDIANTE'
    });

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Mi Perfil</h1>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-800 h-32 relative">
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-blue-600 border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </div>

                <div className="pt-16 p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Nombre Completo</label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <User className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-700 font-medium">{user.name}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Correo Electrónico</label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-700">{user.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Cuenta Verificada</p>
                            <p className="text-xs text-blue-700">Tu acceso está protegido mediante cifrado JWT.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};