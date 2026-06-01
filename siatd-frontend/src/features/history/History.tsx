import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import type { Decision } from '../../types';
import { Calendar, ChevronRight, Search, Trash2, Filter, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const History = () => {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'az', 'za'
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchHistory();
    }, []);

    // 🔴 Borrar una decisión
    const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("¿Estás seguro de eliminar esta decisión?")) {
            try {
                await api.delete(`/decisions/${id}`);
                setDecisions(decisions.filter(d => d.id !== id));
            } catch (error) {
                console.error("Error al eliminar", error);
            }
        }
    };

    // 🔴 Vaciar todo el historial
    const handleClearHistory = async () => {
        if (confirm("⚠️ ADVERTENCIA: ¿Estás seguro de que deseas vaciar TODO tu historial? Esta acción no se puede deshacer.")) {
            try {
                await api.delete('/decisions/clear-history');
                setDecisions([]);
            } catch (error) {
                console.error("Error al vaciar historial", error);
                alert("Hubo un error al vaciar el historial.");
            }
        }
    };

    // Aplicar Ordenamiento y Búsqueda
    const filteredAndSortedDecisions = [...decisions]
        .filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();

            if (sortBy === 'date-desc') return dateB - dateA;
            if (sortBy === 'date-asc') return dateA - dateB;
            if (sortBy === 'az') return a.title.localeCompare(b.title);
            if (sortBy === 'za') return b.title.localeCompare(a.title);
            return 0;
        });

    return (
        <div className="max-w-5xl mx-auto mt-8 p-4 transition-colors duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Historial de Decisiones</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Revisa tus análisis pasados y el progreso de tus dilemas.</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {/* Buscador */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar decisión..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>

                    {/* Selector de Orden */}
                    <div className="relative flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 transition-colors">
                        <Filter className="w-4 h-4 text-slate-400 mr-2" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none py-2 cursor-pointer"
                        >
                            <option value="date-desc">Más recientes primero</option>
                            <option value="date-asc">Más antiguas primero</option>
                            <option value="az">Alfabético (A-Z)</option>
                            <option value="za">Alfabético (Z-A)</option>
                        </select>
                    </div>

                    {/* Botón Vaciar Historial */}
                    {decisions.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-red-100 dark:border-red-500/20"
                        >
                            <AlertOctagon className="w-4 h-4" /> Vaciar Historial
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20 animate-pulse text-slate-400">Cargando tu historia...</div>
            ) : filteredAndSortedDecisions.length === 0 ? (
                <div className="text-center p-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No hay decisiones que coincidan con tu búsqueda.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredAndSortedDecisions.map((d) => {
                        const isCompleted = d.status === 'COMPLETED' || !!d.recommendedOption;

                        return (
                            <div
                                key={d.id}
                                onClick={() => navigate(isCompleted ? `/results/${d.id}` : `/continue/${d.id}`)}
                                className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-xl transition-colors ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{d.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                            <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Sin fecha'}</span>
                                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></span>
                                            <span>{d.criteria?.length || 0} Criterios</span>
                                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></span>
                                            <span>{d.options?.length || 0} Opciones</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                                        {isCompleted ? 'Finalizado' : 'Borrador'}
                                    </span>

                                    {/* Botón de eliminar individual */}
                                    <button
                                        onClick={(e) => handleDeleteSingle(d.id!, e)}
                                        className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Eliminar permanentemente"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};