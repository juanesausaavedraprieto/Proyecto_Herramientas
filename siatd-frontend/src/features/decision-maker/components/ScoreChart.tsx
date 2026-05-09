import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ScoreChartProps {
    data: { optionName: string; score: number }[];
}

export const ScoreChart = ({ data }: ScoreChartProps) => {
    // 1. Validación de seguridad con estilos inline (evitamos bg-slate-50 y bordes de Tailwind)
    if (!data || data.length === 0) {
        return (
            <div style={{
                width: '100%',
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc', // slate-50
                borderRadius: '16px',
                border: '2px dashed #cbd5e1' // slate-300
            }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>
                    No hay datos suficientes para graficar
                </p>
            </div>
        );
    }

    const maxScore = Math.max(...data.map(d => d.score));

    return (
        /* 
           Forzamos altura fija en lugar de h-full para ayudar a html2canvas 
           a calcular las dimensiones correctamente durante la captura.
        */
        <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }} // Más margen abajo para nombres largos
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9" // Hexadecimal puro
                    />
                    <XAxis
                        dataKey="optionName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                        interval={0}
                        // Rotamos las etiquetas si son nombres largos para que no se solapen en el PDF
                        angle={-20}
                        textAnchor="end"
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            color: '#1e293b'
                        }}
                        itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                    />
                    <Bar
                        dataKey="score"
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                // Usamos Hexadecimales vibrantes fijos
                                fill={entry.score === maxScore ? '#4f46e5' : '#94a3b8'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};