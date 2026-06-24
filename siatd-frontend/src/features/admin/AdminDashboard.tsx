import { useEffect, useState } from 'react';
import { Users, BrainCircuit, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../api/axios';
import { useTranslation } from 'react-i18next';

export const AdminDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error al cargar métricas del sistema", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 transition-colors duration-200">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('admin.loadingSettings')}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 transition-colors duration-200">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('admin.dashboardTitle')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.dashboardSub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="bg-indigo-50 dark:bg-indigo-500/20 p-3 rounded-2xl">
                            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats?.totalUsers || 0}</h3>
                        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('admin.registeredUsers')}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="bg-blue-50 dark:bg-blue-500/20 p-3 rounded-2xl">
                            <BrainCircuit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats?.totalDecisions || 0}</h3>
                        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('admin.decisionsProcessed')}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="bg-emerald-50 dark:bg-emerald-500/20 p-3 rounded-2xl">
                            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-emerald-800 dark:text-emerald-400">{stats?.serverStatus || "OK"}</h3>
                        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('admin.serverStatus')}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-6 rounded-3xl shadow-lg flex flex-col gap-4 text-white relative overflow-hidden transition-colors">
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-indigo-300 dark:text-indigo-400 uppercase tracking-wider mb-2">{t('admin.mathEngine')}</p>
                        <h3 className="text-xl font-bold mb-1">{t('admin.mathEngineDesc')}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{t('admin.mathEngineSub')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm mb-8 transition-colors">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('admin.activityHistory')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.activitySub')}</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.activity || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDecisiones" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f1f5f9"
                                className="dark:stroke-slate-700"
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                }}
                                itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="decisiones"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorDecisiones)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
