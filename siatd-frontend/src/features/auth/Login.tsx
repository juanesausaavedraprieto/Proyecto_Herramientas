// src/features/auth/Login.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axios';
import { Link } from 'react-router-dom';
import { Brain, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// Definimos el esquema de validación estricto
const loginSchema = z.object({
    email: z.string().min(1, 'El correo es obligatorio').email('Formato de correo inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await api.post('/auth/login', {
                email: data.email,
                password: data.password
            });

            console.log("📦 Datos recibidos del server:", response.data);

            const { token, name, email, role } = response.data;

            // Verificamos si el backend respondió OK pero no mandó token
            if (!token) {
                toast.error("Credenciales incorrectas. Verifica tu correo y contraseña.");
                return;
            }

            // 1. 🚨 LIMPIAMOS BASURA DE SESIONES ANTERIORES
            localStorage.clear();

            // 2. Guardar datos reales del usuario
            localStorage.setItem('token', token);
            localStorage.setItem('userName', name || 'Usuario');
            localStorage.setItem('userEmail', email || data.email);
            localStorage.setItem('userRole', role || 'USER');

            console.log("✅ Datos de sesión guardados correctamente");

            toast.success("¡Bienvenido! Iniciando sesión...");

            // 3. 🚨 EL HARD RESET: Redirigimos destruyendo la memoria anterior
            setTimeout(() => {
                if (role === 'ADMIN') {
                    window.location.replace('/admin');
                } else {
                    window.location.replace('/');
                }
            }, 800);

        } catch (err: any) {
            console.error("❌ Error atrapado en login:", err);

            // 1. Error de Red (Servidor caído o CORS)
            if (err.code === 'ERR_NETWORK') {
                toast.error("Error de conexión. Verifica que el servidor esté encendido.");
                return;
            }

            // 2. Error HTTP (401, 403, 404, etc.)
            if (err.response) {
                const status = err.response.status;
                const backendData = err.response.data;

                if (status === 401 || status === 403) {
                    toast.error("Correo o contraseña incorrectos.");
                } else if (typeof backendData === 'string') {
                    toast.error(backendData); // Si Spring Boot mandó un texto plano
                } else if (backendData?.message || backendData?.error) {
                    toast.error(backendData.message || backendData.error); // Si mandó JSON
                } else {
                    toast.error("Ocurrió un error al intentar iniciar sesión.");
                }
            } else {
                toast.error("Error desconocido al validar tus datos.");
            }
        }
    };

    // Opcional: Si quieres que avise también cuando el formulario tiene errores de validación
    const onError = () => {
        toast.warning("Por favor, completa los campos correctamente.");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 text-center bg-slate-800 text-white">
                    <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Bienvenido a SIATD</h2>
                    <p className="text-slate-300 mt-2 text-sm">Ingresa a tu cuenta para continuar evaluando decisiones.</p>
                </div>

                <div className="p-8">
                    {/* Le pasamos onError a handleSubmit */}
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl border outline-none transition-all ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 mt-6 shadow-lg shadow-blue-200"
                        >
                            {isSubmitting ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
                            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        ¿No tienes una cuenta? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};