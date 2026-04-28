// src/features/dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import type { Decision } from '../../types';
import { LayoutDashboard, Clock, CheckCircle2, ArrowRight, PlusCircle } from 'lucide-react';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar las decisiones al montar el componente
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login'); // Redirige si no hay token
            return;
        }

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

        fetchDecisions();
    }, []);

    const completedDecisions = decisions.filter(d => d.status === 'COMPLETED');
    const draftDecisions = decisions.filter(d => d.status === 'DRAFT');

    return (
        <div className="max-w-6xl mx-auto mt-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <LayoutDashboard className="w-7 h-7 text-blue-600" />
                        Panel de Control
                    </h2>
                    <p className="text-slate-500 mt-1">Resumen de tus análisis y procesos activos.</p>
                </div>
                <button
                    onClick={() => navigate('/new-decision')}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
                >
                    <PlusCircle className="w-5 h-5" /> Nueva Decisión
                </button>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl"><LayoutDashboard className="w-8 h-8 text-blue-600" /></div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Creadas</p>
                        <h3 className="text-2xl font-bold text-slate-800">{decisions.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-emerald-50 p-4 rounded-xl"><CheckCircle2 className="w-8 h-8 text-emerald-600" /></div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Completadas</p>
                        <h3 className="text-2xl font-bold text-slate-800">{completedDecisions.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-amber-50 p-4 rounded-xl"><Clock className="w-8 h-8 text-amber-600" /></div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Borradores / Pendientes</p>
                        <h3 className="text-2xl font-bold text-slate-800">{draftDecisions.length}</h3>
                    </div>
                </div>
            </div>

            {/* Tabla del Historial */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-slate-50/50">
                    <h3 className="text-lg font-semibold text-slate-800">Actividad Reciente</h3>
                </div>

                {isLoading ? (
                    <div className="p-10 text-center text-slate-400 animate-pulse">Cargando tu historial...</div>
                ) : decisions.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No tienes decisiones guardadas aún. ¡Comienza una nueva!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-gray-100">
                                    <th className="p-4 font-medium">Dilema / Pregunta</th>
                                    <th className="p-4 font-medium">Estado</th>
                                    <th className="p-4 font-medium">Opciones</th>
                                    <th className="p-4 font-medium text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {decisions.slice().reverse().map((decision) => (
                                    <tr key={decision.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">{decision.title}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${decision.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {decision.status === 'COMPLETED' ? 'Resuelto' : 'En proceso'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">{decision.options?.length || 0} alternativas</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => navigate(decision.status === 'COMPLETED' ? `/results/${decision.id}` : `/continue/${decision.id}`)}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                {decision.status === 'COMPLETED' ? 'Ver Análisis' : 'Continuar'} <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};