// src/features/admin/UserFeedbackAudit.tsx
import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { MessageSquare, Search, Filter, Star, Trash2, Calendar, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';

export const UserFeedbackAudit = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔍 Estados de control de Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [starFilter, setStatusFilter] = useState('ALL'); // 'ALL', '5', '4', '3', '2', '1', 'LOW' (1 y 2 estrellas)
    const [sortBy, setSortBy] = useState('date-desc');

    const fetchFeedbackData = async () => {
        try {
            const response = await api.get('/admin/users-feedback');
            setRecords(response.data);
        } catch (error) {
            console.error("Error al recuperar bitácora de feedback", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbackData();
    }, []);

    const handleClearFeedback = async (id: string) => {
        if (confirm("¿Estás seguro de remover este feedback de la bitácora? Esto borrará la calificación del usuario pero mantendrá el dilema intacto.")) {
            try {
                await api.put(`/admin/users-feedback/${id}/clear`);
                setRecords(records.filter(r => r.id !== id));
                toast.success("Feedback eliminado correctamente.");
            } catch (error) {
                toast.error("No se pudo eliminar el registro.");
            }
        }
    };

    // 📊 Motor de filtrado reactivo local
    const processedRecords = records
        .filter(record => {
            // 1. Filtro por texto
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                record.dilemaTitle?.toLowerCase().includes(searchLower) ||
                record.user?.name?.toLowerCase().includes(searchLower) ||
                record.user?.email?.toLowerCase().includes(searchLower) ||
                record.notes?.toLowerCase().includes(searchLower);

            // 2. Filtro por Estrellas
            const score = record.score;
            let matchesStars = true;
            if (starFilter === '5') matchesStars = score === 5;
            else if (starFilter === '4') matchesStars = score === 4;
            else if (starFilter === '3') matchesStars = score === 3;
            else if (starFilter === '2') matchesStars = score === 2;
            else if (starFilter === '1') matchesStars = score === 1;
            else if (starFilter === 'LOW') matchesStars = score <= 2; // Críticas duras

            return matchesSearch && matchesStars;
        })
        .sort((a, b) => {
            // 3. Ordenamiento
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();

            if (sortBy === 'date-desc') return dateB - dateA;
            if (sortBy === 'date-asc') return dateA - dateB;
            if (sortBy === 'stars-desc') return b.score - a.score;
            if (sortBy === 'stars-asc') return a.score - b.score;
            return 0;
        });

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-4 text-slate-500 font-medium">Extrayendo bitácora de satisfacción gerencial...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 transition-colors duration-200">
            {/* Cabecera */}
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-100 dark:bg-amber-500/20 p-3 rounded-2xl text-amber-600 dark:text-amber-400">
                    <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Feedback Retrospectivo</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoreo de satisfacción e impacto de las decisiones recomendadas por el motor.</p>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por usuario, dilema o comentario..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex items-center bg-transparent border border-slate-200 dark:border-slate-600 rounded-xl px-3 flex-1 md:flex-none">
                        <Filter className="w-4 h-4 text-slate-400 mr-2" />
                        <select
                            value={starFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none py-2.5 cursor-pointer"
                        >
                            <option value="ALL">Todas las estrellas</option>
                            <option value="5">⭐⭐⭐⭐⭐ Excelentes</option>
                            <option value="4">⭐⭐⭐⭐ Buenas</option>
                            <option value="3">⭐⭐⭐ Regulares</option>
                            <option value="LOW">⚠️ Críticas (1-2★)</option>
                        </select>
                    </div>

                    <div className="relative flex items-center bg-transparent border border-slate-200 dark:border-slate-600 rounded-xl px-3 flex-1 md:flex-none">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none py-2.5 cursor-pointer"
                        >
                            <option value="date-desc">Más recientes</option>
                            <option value="date-asc">Más antiguos</option>
                            <option value="stars-desc">Mayor puntaje</option>
                            <option value="stars-asc">Menor puntaje</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Listado en Tarjetas o Filas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processedRecords.length === 0 ? (
                    <div className="col-span-2 text-center p-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-400 font-medium">No se registran valoraciones retrospectivas con los criterios seleccionados.</p>
                    </div>
                ) : (
                    processedRecords.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between relative group hover:border-amber-200 dark:hover:border-amber-900 transition-all duration-300">

                            {/* Botón de Moderación Flotante */}
                            <button
                                onClick={() => handleClearFeedback(item.id)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                title="Eliminar este feedback de las métricas"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= item.score ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                                        />
                                    ))}
                                    <span className="text-[10px] text-slate-400 font-bold ml-2 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="font-black text-slate-800 dark:text-white text-lg leading-snug mb-1">
                                    "{item.dilemaTitle}"
                                </h3>
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-1">
                                        <Award className="w-3.5 h-3.5" /> Alternativa Ganadora: {item.winnerOption}
                                    </p>

                                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 italic text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-pre-wrap">
                                        {item.notes ? `"${item.notes}"` : 'El usuario no dejó comentarios adicionales.'}
                                    </div>
                            </div>

                            {/* Info del Usuario */}
                            <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center justify-center">
                                    {item.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{item.user?.name}</p>
                                    <p className="text-slate-400">{item.user?.email}</p>
                                </div>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};