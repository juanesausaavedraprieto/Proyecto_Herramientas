import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { Calculator, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../api/axios';

export const EvaluationMatrix = () => {
    const { currentDecision, updateScore, setRecommendation } = useDecisionStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    if (!currentDecision || currentDecision.criteria.length === 0 || currentDecision.options.length === 0) {
        return (
            <div className="text-center mt-20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Faltan datos para la matriz</h2>
                <button onClick={() => navigate('/new-decision')} className="mt-4 text-blue-600 dark:text-blue-400 underline">Volver al inicio</button>
            </div>
        );
    }

    const handleScoreChange = (optionId: string, criterionId: string, value: number) => {
        updateScore(optionId, criterionId, value);
    };

    const handleCalculate = async () => {
        if (!currentDecision) return;
        setIsLoading(true);
        try {
            const matrixPayload: Record<string, Record<string, number>> = {};
            currentDecision.options.forEach(option => {
                matrixPayload[option.id] = {};
                currentDecision.criteria.forEach(criterion => {
                    matrixPayload[option.id][criterion.id] = option.scores?.[criterion.id] || 5;
                });
            });
            const response = await api.post(`/decisions/${currentDecision.id}/calculate`, { scores: matrixPayload });
            setRecommendation(response.data);
            navigate('/results');
        } catch (error) {
            console.error('Error al calcular:', error);
            alert('Hubo un error al procesar el modelo matemático.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Calculator className="w-7 h-7 text-emerald-600" /> Matriz de Evaluación
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Califica del 1 al 10 qué tan buena es cada opción respecto a cada criterio.</p>
                </div>
                <button onClick={handleCalculate} disabled={isLoading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calcular Mejor Decisión'}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700 w-1/4">
                                    Opciones \ Criterios
                                </th>
                                {currentDecision.criteria.map((c) => (
                                    <th key={c.id} className="p-4 font-medium text-slate-600 dark:text-slate-400 text-center border-r border-gray-200 dark:border-slate-700 min-w-[150px]">
                                        <div className="flex flex-col items-center">
                                            <span>{c.name}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-1">
                                                Peso: {c.weight * 10}/10 | {c.isPositive ? '📈' : '📉'}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentDecision.options.map((option) => (
                                <tr key={option.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-800 dark:text-white border-r border-gray-200 dark:border-slate-700">
                                        {option.name}
                                    </td>
                                    {currentDecision.criteria.map((criterion) => {
                                        const score = option.scores?.[criterion.id] || 5;
                                        return (
                                            <td key={criterion.id} className="p-4 border-r border-gray-200 dark:border-slate-700 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={score}
                                                    onChange={(e) => handleScoreChange(option.id, criterion.id, Number(e.target.value))}
                                                    className="w-20 px-2 py-2 text-center rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};