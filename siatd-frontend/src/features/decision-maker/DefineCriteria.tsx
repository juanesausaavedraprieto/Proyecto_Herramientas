import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { Scale, Plus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';

export const DefineCriteria = () => {
    const { currentDecision, addCriterion } = useDecisionStore();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [weight, setWeight] = useState(5);
    const [isPositive, setIsPositive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    if (!currentDecision) {
        return (
            <div className="text-center mt-20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">No hay una decisión activa</h2>
                <button onClick={() => navigate('/new-decision')} className="mt-4 text-blue-600 dark:text-blue-400 underline">Volver al inicio</button>
            </div>
        );
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !currentDecision) return;
        setIsLoading(true);
        try {
            const response = await api.post(`/decisions/${currentDecision.id}/criteria`, {
                name, weight: weight / 10, isPositive
            });
            addCriterion(response.data);
            setName(''); setWeight(5); setIsPositive(true);
        } catch (error) {
            console.error('Error al guardar criterio:', error);
            alert('Error al guardar el criterio.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50";

    return (
        <div className="max-w-4xl mx-auto mt-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Scale className="w-7 h-7 text-blue-600" /> Definir Criterios de Evaluación
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Decisión actual: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentDecision.title}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulario */}
                <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-fit">
                    <form onSubmit={handleAdd} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Criterio</label>
                            <input type="text" placeholder="Ej: Salario, Distancia..." value={name} onChange={(e) => setName(e.target.value)} className={inputClass} disabled={isLoading} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Importancia ({weight}/10)</label>
                            <input type="range" min="1" max="10" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-blue-600" disabled={isLoading} />
                            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>Poco</span><span>Muy importante</span></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Impacto</label>
                            <select value={isPositive ? 'true' : 'false'} onChange={(e) => setIsPositive(e.target.value === 'true')} className={inputClass} disabled={isLoading}>
                                <option value="true">📈 Beneficio (Más es mejor)</option>
                                <option value="false">📉 Costo (Menos es mejor)</option>
                            </select>
                        </div>
                        <button type="submit" disabled={!name.trim() || isLoading} className="w-full flex justify-center items-center gap-2 bg-slate-800 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                            <Plus className="w-5 h-5" /> {isLoading ? 'Guardando...' : 'Agregar Criterio'}
                        </button>
                    </form>
                </div>

                {/* Lista */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 border-b dark:border-slate-700 pb-2">Criterios Seleccionados</h3>
                    {currentDecision.criteria.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 border-2 border-dashed dark:border-slate-600 rounded-xl">
                            Aún no has agregado ningún criterio.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {currentDecision.criteria.map((c) => (
                                <li key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{c.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Peso: {c.weight * 10}/10 | {c.isPositive ? 'Beneficio 📈' : 'Costo 📉'}</p>
                                    </div>
                                    <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-8 flex justify-end">
                        <button onClick={() => navigate('/define-options')} disabled={currentDecision.criteria.length < 2 || isLoading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50">
                            Siguiente: Definir Opciones <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    {currentDecision.criteria.length < 2 && (
                        <p className="text-xs text-right text-slate-400 mt-2">Agrega al menos 2 criterios para continuar</p>
                    )}
                </div>
            </div>
        </div>
    );
};