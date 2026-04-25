// src/features/decision-maker/Results.tsx
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { Trophy, ArrowLeft, CheckCircle2, BarChart3 } from 'lucide-react';

export const Results = () => {
    const { currentDecision, recommendation } = useDecisionStore();
    const navigate = useNavigate();

    if (!currentDecision || !recommendation) {
        return (
            <div className="text-center mt-20">
                <h2 className="text-xl font-bold text-slate-800">No hay resultados disponibles</h2>
                <button onClick={() => navigate('/new-decision')} className="mt-4 text-blue-600 underline">Volver al inicio</button>
            </div>
        );
    }

    // Ordenar las opciones de mayor a menor puntaje para el gráfico
    const sortedScores = Object.entries(recommendation.finalScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    return (
        <div className="max-w-4xl mx-auto mt-6">
            {/* Tarjeta del Ganador */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg mb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300 drop-shadow-md" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-100 mb-2">Decisión Recomendada</h2>
                <h1 className="text-4xl font-extrabold mb-4">{recommendation.recommendedOption.name}</h1>
                <p className="text-emerald-50 max-w-2xl mx-auto text-lg leading-relaxed bg-black/10 p-4 rounded-xl backdrop-blur-sm">
                    "{recommendation.justification}"
                </p>
            </div>

            {/* Desglose de Puntajes */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    Análisis Multicriterio (MCDM)
                </h3>

                <div className="space-y-6">
                    {sortedScores.map(([optionName, score], index) => {
                        const isWinner = index === 0;
                        return (
                            <div key={optionName}>
                                <div className="flex justify-between items-end mb-2">
                                    <span className={`font-semibold ${isWinner ? 'text-emerald-700 text-lg flex items-center gap-2' : 'text-slate-600'}`}>
                                        {optionName} {isWinner && <CheckCircle2 className="w-5 h-5" />}
                                    </span>
                                    <span className="font-bold text-slate-800">{score}%</span>
                                </div>
                                {/* Barra de progreso */}
                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? 'bg-emerald-500' : 'bg-blue-400'}`}
                                        style={{ width: `${score}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between">
                    <button
                        onClick={() => navigate('/evaluation-matrix')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" /> Ajustar Matriz
                    </button>
                    <button
                        onClick={() => navigate('/new-decision')}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
                    >
                        Nueva Decisión
                    </button>
                </div>
            </div>
        </div>
    );
};