import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Activity, Search, Eye, Loader2, X, FileText, Calendar, User, Filter } from 'lucide-react';

export const GlobalAudit = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para Filtros y Búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'COMPLETED', 'PENDING'
    const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'az', 'za'

    // Estado para controlar el modal de inspección detallada
    const [selectedDecision, setSelectedDecision] = useState<any>(null);

    const fetchAuditData = async () => {
        try {
            const response = await api.get('/admin/audit');
            setRecords(response.data);
        } catch (error) {
            console.error("Error al recuperar el historial de auditoría global", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditData();
    }, []);

    // 🚨 Motor de Filtrado y Ordenamiento Combinado
    const processedRecords = records
        .filter(record => {
            // 1. Filtro de Búsqueda (Por título, email o nombre de usuario)
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                record.title?.toLowerCase().includes(searchLower) ||
                record.user?.email?.toLowerCase().includes(searchLower) ||
                record.user?.name?.toLowerCase().includes(searchLower);

            // 2. Filtro de Estado
            const isCompleted = !!record.recommendedOption;
            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'COMPLETED' && isCompleted) ||
                (statusFilter === 'PENDING' && !isCompleted);

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            // 3. Ordenamiento
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();

            if (sortBy === 'date-desc') return dateB - dateA;
            if (sortBy === 'date-asc') return dateA - dateB;
            if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'za') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 transition-colors duration-200">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Sincronizando bitácora de auditoría...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 relative transition-colors duration-200">

            {/* Cabecera */}
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400 transition-colors">
                    <Activity className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Auditoría Global</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoreo y control analítico de problemas evaluados e inferencias de IA.</p>
                </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6 transition-colors">
                <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">

                    {/* Buscador */}
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por usuario, correo o dilema..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Controles de Filtro y Orden */}
                    <div className="flex w-full md:w-auto gap-3">
                        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-3 flex-1 md:flex-none transition-colors">
                            <Filter className="w-4 h-4 text-slate-400 mr-2" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none py-2.5 cursor-pointer w-full"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="COMPLETED">Solo Resueltos</option>
                                <option value="PENDING">En Proceso</option>
                            </select>
                        </div>

                        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-3 flex-1 md:flex-none transition-colors">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none py-2.5 cursor-pointer w-full"
                            >
                                <option value="date-desc">Más recientes</option>
                                <option value="date-asc">Más antiguos</option>
                                <option value="az">Dilema (A-Z)</option>
                                <option value="za">Dilema (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabla de Datos Reales */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                <th className="p-4 font-bold">Usuario Solicitante</th>
                                <th className="p-4 font-bold">Dilema / Pregunta</th>
                                <th className="p-4 font-bold">Estado del Proceso</th>
                                <th className="p-4 font-bold">Alternativa Recomendada</th>
                                <th className="p-4 font-bold text-center">Inspeccionar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-400 dark:text-slate-500 font-medium">
                                        No se registran decisiones que coincidan con los criterios de búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                processedRecords.map((record) => {
                                    const isCompleted = !!record.recommendedOption;
                                    return (
                                        <tr key={record.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4 flex items-center gap-3">
                                                {/* Avatar con la inicial */}
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shadow-sm">
                                                    {(record.user?.name || record.user?.email || 'U').charAt(0).toUpperCase()}
                                                </div>

                                                {/* Nombre y Correo */}
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                        {record.user?.name || 'Usuario sin nombre'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {record.user?.email || 'Sin correo'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800 dark:text-white">{record.title}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${isCompleted
                                                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                    }`}>
                                                    {isCompleted ? 'Resuelto' : 'En proceso'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-black text-indigo-600 dark:text-indigo-400">
                                                {record.recommendedOption?.name || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setSelectedDecision(record)}
                                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                                                    title="Inspeccionar Justificación"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🚨 MODAL DE INSPECCIÓN EXPERTA DE IA 🚨 */}
            {selectedDecision && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 transition-colors">

                        {/* Cabecera Modal */}
                        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 flex justify-between items-center transition-colors">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-indigo-400" />
                                <h3 className="font-black text-lg tracking-tight">Inspección de Análisis Experto</h3>
                            </div>
                            <button
                                onClick={() => setSelectedDecision(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Contenido Modal */}
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Dilema original</h4>
                                <p className="text-xl font-black text-slate-800 dark:text-white">{selectedDecision.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-700 py-4 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Evaluado por</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {selectedDecision.user?.name || 'Usuario Desconocido'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Fecha de registro</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {selectedDecision.createdAt ? new Date(selectedDecision.createdAt).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Dictamen de la IA (Gemini)</h4>
                                {selectedDecision.recommendedOption ? (
                                    <div className="bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 transition-colors">
                                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-400 mb-2">
                                            Opción recomendada por el motor: <span className="underline">{selectedDecision.recommendedOption.name}</span>
                                        </p>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                                            "{selectedDecision.justification}"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 rounded-2xl p-5 text-sm font-medium transition-colors">
                                        Este dilema se encuentra guardado en estado de borrador. El usuario aún no ha calificado la matriz de criterios para procesar la recomendación final.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pie Modal */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-700 text-right transition-colors">
                            <button
                                onClick={() => setSelectedDecision(null)}
                                className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-xl text-sm transition-colors"
                            >
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};