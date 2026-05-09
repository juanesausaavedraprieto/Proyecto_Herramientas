import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, Legend
} from 'recharts';

interface RadarProps {
    // La data debe venir estructurada así: 
    // [{ subject: 'Costo', optionA: 80, optionB: 60 }, { subject: 'Tiempo', optionA: 90, optionB: 40 }]
    data: any[];
    optionKeys: string[]; // Nombres de las opciones para pintar las capas
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const RadarEvaluationChart = ({ data, optionKeys }: RadarProps) => {
    if (!data || data.length === 0) return <p className="text-center text-slate-400">Sin datos para el radar</p>;

    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    {optionKeys.map((key, index) => (
                        <Radar
                            key={key}
                            name={key}
                            dataKey={key}
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.3}
                        />
                    ))}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};