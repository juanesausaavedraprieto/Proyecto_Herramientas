import { Users, BrainCircuit, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Datos de prueba para el gráfico (luego lo conectarás a tu backend)
const activityData = [
    { name: 'Lun', decisiones: 12, usuarios: 3 },
    { name: 'Mar', decisiones: 19, usuarios: 5 },
    { name: 'Mié', decisiones: 15, usuarios: 2 },
    { name: 'Jue', decisiones: 22, usuarios: 8 },
    { name: 'Vie', decisiones: 28, usuarios: 4 },
    { name: 'Sáb', decisiones: 10, usuarios: 1 },
    { name: 'Dom', decisiones: 5, usuarios: 0 },
];

export const AdminDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

            {/* Cabecera */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Visión General del Sistema</h1>
                <p className="text-slate-500 mt-1">Monitoreo de actividad y rendimiento del motor TOPSIS.</p>
            </div>

            {/* Tarjetas de KPIs (Key Performance Indicators) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="bg-indigo-50 p-3 rounded-2xl">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" /> +12%
                        </span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800">142</h3>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Usuarios Activos</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="bg-blue-50 p-3 rounded-2xl">
                            <BrainCircuit className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800">856</h3>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Decisiones TOPSIS</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="bg-emerald-50 p-3 rounded-2xl">
                            <Activity className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800">99.8%</h3>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Uptime del Servidor</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl shadow-lg flex flex-col gap-4 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BrainCircuit className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2">Estado del Motor IA</p>
                        <h3 className="text-xl font-bold mb-1">Óptimo</h3>
                        <p className="text-xs text-slate-400">Sin cuellos de botella detectados en los últimos cálculos de matrices.</p>
                    </div>
                </div>
            </div>

            {/* Gráfico de Actividad */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Flujo de Decisiones Semanal</h3>
                    <p className="text-sm text-slate-500">Volumen de análisis procesados por el sistema.</p>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDecisiones" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="decisiones" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorDecisiones)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};