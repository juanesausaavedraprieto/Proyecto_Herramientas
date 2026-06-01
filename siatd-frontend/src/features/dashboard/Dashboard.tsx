import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import type { Decision } from '../../types';
import { LayoutDashboard, Clock, CheckCircle2, ArrowRight, PlusCircle, Trash2 } from 'lucide-react';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDecisions = async () => {
        try {
            const response = await api.get('/decisions');
            setDecisions(response.data);
        } catch (error) {
            console.error('Error cargando el historial:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchDecisions();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Evita que se dispare el click de la fila
        if (confirm("¿Estás seguro de eliminar esta decisión permanentemente?")) {
            try {
                await api.delete(`/decisions/${id}`);
                setDecisions(decisions.filter(d => d.id !== id));
            } catch (error) {
                console.error("Error al eliminar la decisión", error);
            }
        }
    };

    const completedDecisions = decisions.filter(d => d.status === 'COMPLETED' || !!d.recommendedOption);
    const draftDecisions = decisions.filter(d => d.status !== 'COMPLETED' && !d.recommendedOption);

    return (
        <div className="max-w-6xl mx-auto mt-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <LayoutDashboard className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        Panel de Control
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Resumen de tus análisis y procesos activos.</p>
                </div>
                <button
                    onClick={() => navigate('/new-decision')}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm"
                >
                    <PlusCircle className="w-5 h-5" /> Nueva Decisión
                </button>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
                    <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl"><LayoutDashboard className="w-8 h-8 text-blue-600 dark:text-blue-400" /></div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Creadas</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{decisions.length}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl"><CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /></div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Completadas</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{completedDecisions.length}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
                    <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl"><Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" /></div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pendientes</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{draftDecisions.length}</h3>
                    </div>
                </div>
            </div>

            {/* Tabla del Historial */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Actividad Reciente</h3>
                </div>

                {isLoading ? (
                    <div className="p-10 text-center text-slate-400 animate-pulse">Cargando tu historial...</div>
                ) : decisions.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                        No tienes decisiones guardadas aún. ¡Comienza una nueva!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-sm border-b border-gray-100 dark:border-slate-700">
                                    <th className="p-4 font-medium">Dilema / Pregunta</th>
                                    <th className="p-4 font-medium">Estado</th>
                                    <th className="p-4 font-medium">Opciones</th>
                                    <th className="p-4 font-medium text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {decisions.slice().reverse().map((decision) => {
                                    const isCompleted = decision.status === 'COMPLETED' || !!decision.recommendedOption;
                                    return (
                                        <tr key={decision.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{decision.title}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                                    {isCompleted ? 'Resuelto' : 'En proceso'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{decision.options?.length || 0} alternativas</td>
                                            <td className="p-4 text-right flex justify-end items-center gap-3">
                                                <button
                                                    onClick={(e) => handleDelete(decision.id!, e)}
                                                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2"
                                                    title="Eliminar decisión"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(isCompleted ? `/results/${decision.id}` : `/continue/${decision.id}`)}
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    {isCompleted ? 'Ver Análisis' : 'Continuar'} <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};