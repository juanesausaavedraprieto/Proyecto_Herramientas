// src/features/decision-maker/EvaluationMatrix.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { Calculator, ArrowRight, AlertCircle, Loader2, Sparkles, Users, ShieldAlert, AlertTriangle } from 'lucide-react';
import { api } from '../../api/axios';
import { toast } from 'sonner';
import { useNotificationStore } from '../../store/useNotificationStore';

export const EvaluationMatrix = () => {
    const { currentDecision, updateScore, setRecommendation } = useDecisionStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // 🚨 ESTADOS PARA EL PANEL DE RIESGOS
    const [earlyRisks, setEarlyRisks] = useState<any[]>([]);
    const [isRisksLoading, setIsRisksLoading] = useState(false);
    const [showRisksPanel, setShowRisksPanel] = useState(false);

    const addNotification = useNotificationStore((state) => state.addNotification);

    if (!currentDecision || currentDecision.criteria.length === 0 || currentDecision.options.length === 0) {
        return (
            <div className="text-center mt-20 transition-colors duration-200">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Faltan datos para la matriz</h2>
                <button onClick={() => navigate('/new-decision')} className="mt-4 text-blue-600 dark:text-blue-400 underline">Volver al inicio</button>
            </div>
        );
    }

    const handleScoreChange = (optionId: string, criterionId: string, value: number) => {
        const safeValue = Math.max(1, Math.min(10, value));
        updateScore(optionId, criterionId, safeValue);
    };

    // 🛡️ NUEVO: Función para pedir los riesgos a Gemini
    const handleFetchRisks = async () => {
        if (!currentDecision) return;

        // Si ya los tenemos, solo abrimos/cerramos el panel
        if (earlyRisks.length > 0) {
            setShowRisksPanel(!showRisksPanel);
            return;
        }

        setIsRisksLoading(true);
        toast.info("Consultando matriz de riesgos preventivos...");

        try {
            const response = await api.get(`/decisions/${currentDecision.id}/risks`);
            setEarlyRisks(response.data);
            setShowRisksPanel(true);
            toast.success("Riesgos identificados con éxito.");
        } catch (error) {
            console.error("Error al obtener riesgos:", error);
            toast.error("No se pudo cargar el análisis de riesgos.");
        } finally {
            setIsRisksLoading(false);
        }
    };

    const handleAiAutocomplete = async () => {
        // ... (Tu código intacto de handleAiAutocomplete)
        if (!currentDecision) return;
        setIsAiLoading(true);
        toast.info("La IA está analizando tu dilema...", { duration: 3000 });

        try {
            const response = await api.post(`/decisions/${currentDecision.id}/auto-evaluate`);
            let rawData = response.data;
            let aiEvaluations: any = [];

            if (typeof rawData === 'string') {
                const cleanString = rawData.replace(/```json/gi, '').replace(/```/g, '').trim();
                aiEvaluations = JSON.parse(cleanString);
            } else {
                aiEvaluations = rawData;
            }

            if (!Array.isArray(aiEvaluations)) {
                const hiddenArray = Object.values(aiEvaluations).find(val => Array.isArray(val));
                if (hiddenArray) {
                    aiEvaluations = hiddenArray;
                } else {
                    aiEvaluations = [aiEvaluations];
                }
            }

            if (!Array.isArray(aiEvaluations) || aiEvaluations.length === 0) {
                throw new Error("El formato devuelto no contiene evaluaciones.");
            }

            const normalizeText = (text: string) => {
                if (!text) return "";
                return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            };

            let matchCount = 0;

            aiEvaluations.forEach((evalData: any) => {
                const rawOpcion = evalData.opcion || evalData.Opcion || evalData.Option || evalData["opción"];
                const rawCriterio = evalData.criterio || evalData.Criterio || evalData.Criterion || evalData["criterio"];
                const rawPuntaje = evalData.puntaje || evalData.Puntaje || evalData.score || evalData.value;

                if (!rawOpcion || !rawCriterio || rawPuntaje === undefined) return;

                const normalizedOpcion = normalizeText(String(rawOpcion));
                const normalizedCriterio = normalizeText(String(rawCriterio));

                const matchedOption = currentDecision.options.find(
                    o => normalizeText(o.name) === normalizedOpcion
                );
                const matchedCriterion = currentDecision.criteria.find(
                    c => normalizeText(c.name) === normalizedCriterio
                );

                if (matchedOption && matchedCriterion) {
                    updateScore(matchedOption.id, matchedCriterion.id, Number(rawPuntaje));
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                toast.success(`¡Matriz autocompletada con éxito! (${matchCount} valores)`);
            } else {
                toast.warning("La IA respondió, pero no coincidieron los nombres.");
            }

        } catch (error) {
            toast.error("La IA falló al generar la matriz. Intenta de nuevo.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleCalculate = async () => {
        // ... (Tu código intacto de handleCalculate)
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

            const response = await api.post(`/decisions/${currentDecision.id}/calculate`, {
                scores: matrixPayload
            });

            setRecommendation(response.data);
            navigate('/results');
            toast.success("¡Análisis TOPSIS completado!");

        } catch (error: any) {
            const errorMessage = error.response?.data?.message;
            if (errorMessage) {
                toast.error(errorMessage, { duration: 6000 });
                addNotification(errorMessage);
            } else {
                toast.error("Ocurrió un error inesperado al procesar la matriz.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-6 transition-colors duration-200">
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Calculator className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                        Matriz de Evaluación
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Califica del 1 al 10 qué tan buena es cada opción respecto a cada criterio.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* 🛡️ NUEVO BOTÓN: Consultar Riesgos */}
                    <button
                        onClick={handleFetchRisks}
                        disabled={isRisksLoading}
                        className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 border border-amber-200 dark:border-amber-500/30"
                        title="Identificar puntos ciegos antes de evaluar"
                    >
                        {isRisksLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                        <span className="hidden sm:inline">Evaluar Riesgos</span>
                    </button>

                    <button
                        onClick={handleAiAutocomplete}
                        disabled={isLoading || isAiLoading}
                        className="flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 border border-indigo-200 dark:border-indigo-500/30"
                    >
                        {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        <span className="hidden sm:inline">Auto-Evaluar</span>
                    </button>

                    <button
                        onClick={handleCalculate}
                        disabled={isLoading || isAiLoading}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calcular Mejor Decisión'}
                        <ArrowRight className="w-5 h-5 hidden sm:inline" />
                    </button>

                    <button
                        onClick={() => navigate(`/collab/${currentDecision.id}`)}
                        className="flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 font-bold py-3 px-4 rounded-lg transition-colors"
                        title="Ir a Sala Colaborativa"
                    >
                        <Users className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* 🛡️ EL PANEL DE RIESGOS DESPLEGABLE */}
            {showRisksPanel && (
                <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-300 shadow-sm">
                    <h3 className="text-amber-800 dark:text-amber-400 font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Consideraciones Previas (Puntos Ciegos)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {earlyRisks.map((riskItem, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-500 block mb-1">
                                    Opción: {riskItem.opcion}
                                </span>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    "{riskItem.riesgo}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {/* ... (Tu tabla intacta) ... */}
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700">
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700 w-1/4">
                                    Opciones \ Criterios
                                </th>
                                {currentDecision.criteria.map((c) => (
                                    <th key={c.id} className="p-4 font-medium text-slate-600 dark:text-slate-300 text-center border-r border-gray-200 dark:border-slate-700 min-w-[150px]">
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
                                <tr key={option.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                        {option.name}
                                    </td>
                                    {currentDecision.criteria.map((criterion) => {
                                        const score = option.scores?.[criterion.id] || 5;

                                        return (
                                            <td key={criterion.id} className="p-4 border-r border-gray-200 dark:border-slate-700 text-center relative group">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={score}
                                                    onChange={(e) => handleScoreChange(option.id, criterion.id, Number(e.target.value))}
                                                    className={`w-20 px-2 py-2 text-center rounded-lg border outline-none font-semibold transition-all duration-300 ${isAiLoading
                                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-400 animate-pulse'
                                                        : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500'
                                                        }`}
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