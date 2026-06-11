// src/features/decision-maker/components/SensitivityPanel.tsx
import { Sliders, RefreshCcw } from 'lucide-react';

interface SensitivityProps {
    criteria: any[];
    onWeightChange: (id: string, weight: number) => void;
    onReset: () => void; // 🚨 NUEVO: Propiedad para resetear los pesos
}

export const SensitivityPanel = ({ criteria, onWeightChange, onReset }: SensitivityProps) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-xl">
                        <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Análisis de Sensibilidad</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ajusta los pesos para ver cómo cambia el resultado en tiempo real.</p>
                    </div>
                </div>

                {/* 🚨 NUEVO: El botón para volver a la realidad */}
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
                >
                    <RefreshCcw className="w-3.5 h-3.5" /> Restaurar Pesos
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {criteria.map((c) => (
                    <div key={c.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate pr-4">
                                {c.name}
                            </label>
                            <span className="text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full shadow-sm">
                                {c.weight * 10}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={c.weight * 10}
                            onChange={(e) => onWeightChange(c.id, Number(e.target.value) / 10)}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};