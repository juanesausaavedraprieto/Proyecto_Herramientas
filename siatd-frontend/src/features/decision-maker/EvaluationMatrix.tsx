// src/features/decision-maker/EvaluationMatrix.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { Calculator, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../api/axios';
import { toast } from 'sonner'; // 👈 Importamos Sonner

export const EvaluationMatrix = () => {
    const { currentDecision, updateScore, setRecommendation } = useDecisionStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false); // 👈 Estado exclusivo para la IA

    if (!currentDecision || currentDecision.criteria.length === 0 || currentDecision.options.length === 0) {
        return (
            <div className="text-center mt-20 transition-colors duration-200">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Faltan datos para la matriz</h2>
                <button onClick={() => navigate('/new-decision')} className="mt-4 text-blue-600 dark:text-blue-400 underline">Volver al inicio</button>
            </div>
        );
    }

    // Manejar el cambio de un puntaje manual en la matriz
    const handleScoreChange = (optionId: string, criterionId: string, value: number) => {
        // Validación de seguridad para que no pongan más de 10 o menos de 1
        const safeValue = Math.max(1, Math.min(10, value));
        updateScore(optionId, criterionId, safeValue);
    };

    // 🪄 NUEVO: Función súper robusta y tolerante a errores ortográficos de la IA
    const handleAiAutocomplete = async () => {
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

            // 🛠️ Función destructora de tildes, mayúsculas y espacios
            const normalizeText = (text: string) => {
                if (!text) return "";
                return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            };

            let matchCount = 0;

            // 👁️ Imprimimos en consola lo que dijo la IA por si quieres curiosear (F12)
            console.log("Respuesta cruda de la IA:", aiEvaluations);

            aiEvaluations.forEach((evalData: any) => {
                // 1. Atrapamos variaciones de llaves que la IA pueda inventar
                const rawOpcion = evalData.opcion || evalData.Opcion || evalData.Option || evalData["opción"];
                const rawCriterio = evalData.criterio || evalData.Criterio || evalData.Criterion || evalData["criterio"];
                const rawPuntaje = evalData.puntaje || evalData.Puntaje || evalData.score || evalData.value;

                if (!rawOpcion || !rawCriterio || rawPuntaje === undefined) return;

                // 2. Normalizamos la respuesta de la IA
                const normalizedOpcion = normalizeText(String(rawOpcion));
                const normalizedCriterio = normalizeText(String(rawCriterio));

                // 3. Normalizamos lo que tú escribiste en la app y comparamos
                const matchedOption = currentDecision.options.find(
                    o => normalizeText(o.name) === normalizedOpcion
                );
                const matchedCriterion = currentDecision.criteria.find(
                    c => normalizeText(c.name) === normalizedCriterio
                );

                if (matchedOption && matchedCriterion) {
                    // Nos aseguramos de que el puntaje sea un número válido
                    updateScore(matchedOption.id, matchedCriterion.id, Number(rawPuntaje));
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                toast.success(`¡Matriz autocompletada con éxito! (${matchCount} valores)`);
            } else {
                toast.warning("La IA respondió, pero no coincidieron los nombres. Abre la consola (F12) para ver qué devolvió.");
            }

        } catch (error) {
            console.error("Error en autocompletado de IA:", error);
            toast.error("La IA falló al generar la matriz. Intenta de nuevo.");
        } finally {
            setIsAiLoading(false);
        }
    };
    // Enviar los puntajes finales al backend para que calcule el ganador
    const handleCalculate = async () => {
        if (!currentDecision) return;
        setIsLoading(true);

        try {
            // 1. Armar el objeto para Spring Boot
            const matrixPayload: Record<string, Record<string, number>> = {};

            currentDecision.options.forEach(option => {
                matrixPayload[option.id] = {};
                currentDecision.criteria.forEach(criterion => {
                    matrixPayload[option.id][criterion.id] = option.scores?.[criterion.id] || 5;
                });
            });

            // 2. Enviar a la API
            const response = await api.post(`/decisions/${currentDecision.id}/calculate`, {
                scores: matrixPayload
            });

            // 3. Guardar el resultado y avanzar
            setRecommendation(response.data);
            navigate('/results');
            toast.success("¡Análisis TOPSIS completado!"); // 👈 Usamos toast

        } catch (error) {
            console.error("Error al calcular:", error);
            toast.error("Hubo un error al procesar el modelo matemático."); // 👈 Usamos toast
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

                {/* 🪄 Botones de Acción Agrupados */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleAiAutocomplete}
                        disabled={isLoading || isAiLoading}
                        className="flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex-1 md:flex-none border border-indigo-200 dark:border-indigo-500/30"
                        title="Dejar que la Inteligencia Artificial puntúe por ti"
                    >
                        {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        <span className="hidden sm:inline">{isAiLoading ? 'Analizando...' : 'Auto-Evaluar con IA'}</span>
                        <span className="sm:hidden">IA</span>
                    </button>

                    <button
                        onClick={handleCalculate}
                        disabled={isLoading || isAiLoading}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex-1 md:flex-none shadow-lg shadow-emerald-200 dark:shadow-none"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calcular Mejor Decisión'}
                        <ArrowRight className="w-5 h-5 hidden sm:inline" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
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