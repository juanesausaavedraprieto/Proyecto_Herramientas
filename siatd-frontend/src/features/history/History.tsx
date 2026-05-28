import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import type { Decision } from '../../types';
import { Calendar, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const History = () => {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/decisions');
                setDecisions(response.data);
            } catch (error) {
                console.error('Error al cargar historial', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filtered = decisions.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto mt-8 p-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Historial de Decisiones</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Revisa tus análisis pasados y el progreso de tus dilemas.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar decisión..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20 animate-pulse text-slate-400">Cargando tu historia...</div>
            ) : (
                <div className="grid gap-4">
                    {filtered.slice().reverse().map((d) => {
                        const isCompleted = d.status === 'COMPLETED' || !!d.recommendedOption;
                        return (
                            <div
                                key={d.id}
                                onClick={() => navigate(isCompleted ? `/results/${d.id}` : `/continue/${d.id}`)}
                                className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-xl ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{d.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                            <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</span>
                                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></span>
                                            <span>{d.criteria?.length || 0} Criterios</span>
                                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></span>
                                            <span>{d.options?.length || 0} Opciones</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'}`}>
                                        {isCompleted ? 'Finalizado' : 'Borrador'}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && !loading && (
                        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                            No se encontraron decisiones.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};