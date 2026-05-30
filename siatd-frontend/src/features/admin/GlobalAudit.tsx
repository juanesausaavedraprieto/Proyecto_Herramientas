import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Activity, Search, Eye, Loader2, X, FileText, Calendar, User } from 'lucide-react';

export const GlobalAudit = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Filtrado dinámico por título de decisión o correo de usuario
    const filteredRecords = records.filter(record =>
        record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="mt-4 text-slate-500 font-medium">Sincronizando bitácora de auditoría...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 relative">

            {/* Cabecera */}
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><Activity className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Auditoría Global</h1>
                    <p className="text-slate-500 mt-1">Monitoreo y control analítico de problemas evaluados e inferencias de IA.</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                <div className="p-5 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por usuario o dilema..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabla de Datos Reales */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 font-bold">Usuario Solicitante</th>
                                <th className="p-4 font-bold">Dilema / Pregunta</th>
                                <th className="p-4 font-bold">Estado del Proceso</th>
                                <th className="p-4 font-bold">Alternativa Recomendada</th>
                                <th className="p-4 font-bold text-center">Inspeccionar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-400 font-medium">
                                        No se registran decisiones que coincidan con los criterios de búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                // Aplicamos un .reverse() para ver las más recientes primero
                                filteredRecords.slice().reverse().map((record) => {
                                    const isCompleted = !!record.recommendedOption;
                                    return (
                                        <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-700">{record.user?.name || 'Usuario'}</div>
                                                <div className="text-xs text-slate-400">{record.user?.email}</div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800">{record.title}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {isCompleted ? 'Resuelto' : 'En proceso'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-black text-indigo-600">
                                                {record.recommendedOption?.name || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setSelectedDecision(record)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
                        {/* Cabecera Modal */}
                        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
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
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dilema original</h4>
                                <p className="text-xl font-black text-slate-800">{selectedDecision.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><User className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Evaluado por</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedDecision.user?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Calendar className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha de registro</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            {selectedDecision.createdAt ? new Date(selectedDecision.createdAt).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dictamen de la IA (Gemini 2.5 Flash)</h4>
                                {selectedDecision.recommendedOption ? (
                                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
                                        <p className="text-sm font-bold text-indigo-900 mb-2">
                                            Opción recomendada por el motor: <span className="underline">{selectedDecision.recommendedOption.name}</span>
                                        </p>
                                        <p className="text-slate-700 text-sm leading-relaxed italic">
                                            "{selectedDecision.justification}"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-5 text-sm font-medium">
                                        Este dilema se encuentra guardado en estado de borrador. El usuario aún no ha calificado la matriz de criterios para procesar la recomendación final.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pie Modal */}
                        <div className="bg-slate-50 p-4 border-t border-slate-100 text-right">
                            <button
                                onClick={() => setSelectedDecision(null)}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-6 rounded-xl text-sm transition-colors"
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