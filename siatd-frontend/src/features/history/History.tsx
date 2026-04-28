import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import type{ Decision } from '../../types';
import { Calendar, ChevronRight, Search, Filter, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const History = () => {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/decisions');
                setDecisions(response.data);
            } catch (error) {
                console.error("Error al cargar historial", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="max-w-5xl mx-auto mt-8 p-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Historial de Decisiones</h1>
                    <p className="text-slate-500 mt-2">Revisa tus análisis pasados y el progreso de tus dilemas.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Buscar decisión..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20 animate-pulse text-slate-400">Cargando tu historia...</div>
            ) : (
                <div className="grid gap-4">
                    {decisions.slice().reverse().map((d) => (
                        <div
                            key={d.id}
                            onClick={() => navigate(d.status === 'COMPLETED' ? `/results/${d.id}` : `/continue/${d.id}`)}
                            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`p-3 rounded-xl ${d.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{d.title}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                        <span>{new Date(d.createdAt!).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <span>{d.criteria.length} Criterios</span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <span>{d.options.length} Opciones</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${d.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {d.status === 'COMPLETED' ? 'Finalizado' : 'Borrador'}
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};