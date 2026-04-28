import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/axios'; // 👈 Verifica esta ruta
import { Brain, User, Mail, Lock, Calendar, ArrowRight, Loader2 } from 'lucide-react';

// 1. Esquema de validación profesional con Zod
const registerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Formato de correo electrónico inválido'),
    birthDate: z.string().refine((date) => {
        const birth = new Date(date);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const monthDiff = now.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 15;
    }, 'Debes tener al menos 15 años para usar SIATD'),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
        .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
        .regex(/[0-9]/, 'Debe incluir al menos un número')
        .regex(/[@$!%*?&]/, 'Debe incluir un carácter especial (@$!%*?&)'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            const response = await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
                birthDate: data.birthDate
            });

            // ⚠️ GUARDAR EL TOKEN ES LA CLAVE
            const token = response.data.token;
            if (token) {
                localStorage.setItem('token', token);
                console.log("✅ Usuario registrado y token guardado");
                navigate('/'); // Al Dashboard
            }
        } catch (error: any) {
            console.error("Error en el registro:", error);
            alert(error.response?.data?.message || "Error al registrar usuario. Intenta con otro correo.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 text-center bg-slate-800 text-white">
                    <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Crear Cuenta</h2>
                    <p className="text-slate-300 text-sm">Únete al Sistema Inteligente de Toma de Decisiones.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input {...register('name')} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. Juan Saavedra" />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input {...register('email')} type="email" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" placeholder="usuario@correo.com" />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Nacimiento</label>
                        <div className="relative mt-1">
                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input {...register('birthDate')} type="date" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input {...register('password')} type="password" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 leading-tight">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmar</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input {...register('confirmPassword')} type="password" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="md:col-span-2 w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 mt-4"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Crear Cuenta y Entrar'}
                        {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <div className="p-6 bg-slate-50 text-center border-t border-gray-100">
                    <p className="text-sm text-slate-500">
                        ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};