// src/features/auth/Login.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Lock, Mail, ArrowRight } from 'lucide-react';

// 1. Definimos el esquema de validación estricto
const loginSchema = z.object({
    email: z.string().min(1, 'El correo es obligatorio').email('Formato de correo inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Extraemos el tipo de TypeScript a partir del esquema
type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await api.post('/auth/login', {
                email: data.email,
                password: data.password
            });

            // 1. Extraemos el token del JSON que manda Spring Boot
            const token = response.data.token;

            if (token) {
                // 2. LO GUARDAMOS (Esto es lo que te falta)
                localStorage.setItem('token', token);
                console.log("✅ Token guardado correctamente");

                // 3. Redirigimos al Dashboard
                navigate('/');
            }
        } catch (err) {
            console.error("Error en login:", err);
            alert("Credenciales inválidas. Usa cliente@siatd.com / Cliente123*");
        }
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
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
                                    type="password"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 mt-6"
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