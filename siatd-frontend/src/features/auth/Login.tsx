import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axios';
import { Link } from 'react-router-dom';
import { Brain, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
    email: z.string().min(1, 'El correo es obligatorio').email('Formato de correo inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
    const { t } = useTranslation();
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

            const { token, name, email, role } = response.data;

            if (!token) {
                toast.error("Credenciales incorrectas. Verifica tu correo y contraseña.");
                return;
            }

            localStorage.clear();

            localStorage.setItem('token', token);
            localStorage.setItem('userName', name || 'Usuario');
            localStorage.setItem('userEmail', email || data.email);
            localStorage.setItem('userRole', role || 'USER');

            toast.success("¡Bienvenido! Iniciando sesión...");

            setTimeout(() => {
                if (role === 'ADMIN') {
                    window.location.replace('/admin');
                } else {
                    window.location.replace('/');
                }
            }, 800);

        } catch (err: any) {
            console.error("Error atrapado en login:", err);

            if (err.code === 'ERR_NETWORK') {
                toast.error(t('auth.login.errors.network'));
                return;
            }

            if (err.response) {
                const status = err.response.status;
                const backendData = err.response.data;

                if (status === 401 || status === 403) {
                    toast.error(t('auth.login.errors.invalidCredentials'));
                } else if (typeof backendData === 'string') {
                    toast.error(backendData);
                } else if (backendData?.message || backendData?.error) {
                    toast.error(backendData.message || backendData.error);
                } else {
                    toast.error(t('auth.login.errors.generic'));
                }
            } else {
                toast.error(t('auth.login.errors.unknown'));
            }
        }
    };

    const onError = () => {
        toast.warning(t('auth.login.errors.validation'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 text-center bg-slate-800 text-white">
                    <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">{t('auth.login.title')}</h2>
                    <p className="text-slate-300 mt-2 text-sm">{t('auth.login.subtitle')}</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.login.email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder={t('auth.login.emailPlaceholder')}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.login.password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl border outline-none transition-all ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder={t('auth.login.passwordPlaceholder')}
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
                            {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
                            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        {t('auth.login.noAccount')} <Link to="/register" className="text-blue-600 font-semibold hover:underline">{t('auth.login.register')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
