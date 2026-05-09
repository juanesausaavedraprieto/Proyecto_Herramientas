import { Sliders } from 'lucide-react';

interface SensitivityPanelProps {
    criteria: { id: string; name: string; weight: number }[];
    onWeightChange: (id: string, newWeight: number) => void;
}

export const SensitivityPanel = ({ criteria, onWeightChange }: SensitivityPanelProps) => {
    return (
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400">
                    <Sliders className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Análisis de Sensibilidad</h3>
                    <p className="text-sm text-slate-400">Ajusta los pesos para ver cómo cambia el resultado en tiempo real.</p>
                </div>
            </div>

            <div className="space-y-6">
                {criteria.map((c) => (
                    <div key={c.id} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-200">{c.name}</span>
                            <span className="text-blue-400">{(c.weight * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={c.weight}
                            onChange={(e) => onWeightChange(c.id, parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};