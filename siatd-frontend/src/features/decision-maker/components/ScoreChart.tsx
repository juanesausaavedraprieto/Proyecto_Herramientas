import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ScoreChartProps {
    data: { optionName: string; score: number }[];
}

export const ScoreChart = ({ data }: ScoreChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis
                    dataKey="optionName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                />
                <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dx={-10}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Puntaje TOPSIS']}
                />
                <Bar dataKey="score" fill="url(#colorScore)" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};