import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ScoreChartProps {
    data: { optionName: string; score: number }[];
}

export const ScoreChart = ({ data }: ScoreChartProps) => {
    // 1. Validación de seguridad para evitar errores si la data está vacía
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-80 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-400 text-sm">No hay datos suficientes para graficar</p>
            </div>
        );
    }

    // 2. Encontramos el puntaje máximo
    const maxScore = Math.max(...data.map(d => d.score));

    return (
        /* IMPORTANTE: El div padre DEBE tener h-full o una altura fija. 
           He quitado el p-6 del contenedor interno para que el ResponsiveContainer 
           tenga todo el espacio y no choque con los cálculos de padding.
        */
        <div className="w-full h-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                    />
                    <XAxis
                        dataKey="optionName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        interval={0} // Fuerza a mostrar todos los nombres
                        dy={10} // Espacio extra abajo
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        domain={[0, 100]} // Asumiendo que tus puntajes son porcentajes
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                        }}
                    />
                    <Bar
                        dataKey="score"
                        radius={[6, 6, 0, 0]}
                        barSize={50} // Ancho controlado de las barras
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                // He cambiado el azul por uno más vibrante que combina con el dashboard
                                fill={entry.score === maxScore ? '#6366f1' : '#cbd5e1'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};