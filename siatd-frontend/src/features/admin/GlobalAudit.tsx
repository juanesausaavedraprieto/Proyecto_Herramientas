import { useState } from 'react';
import { Activity, Search, Filter, Eye } from 'lucide-react';

// Datos simulados (luego lo conectas a un endpoint GET /api/admin/audit)
const mockAuditData = [
    { id: '1', user: 'juan@correo.com', title: '¿Qué framework frontend usar?', status: 'COMPLETED', winner: 'React', date: '2026-05-20' },
    { id: '2', user: 'maria@gmail.com', title: 'Selección de proveedor Cloud', status: 'DRAFT', winner: '-', date: '2026-05-22' },
    { id: '3', user: 'carlos@utp.edu.pe', title: 'Contratación de personal SR', status: 'COMPLETED', winner: 'Candidato A', date: '2026-05-24' },
];

export const GlobalAudit = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><Activity className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Auditoría Global</h1>
                    <p className="text-slate-500 mt-1">Monitoreo en tiempo real de las decisiones tomadas por los usuarios.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por usuario o decisión..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold">
                        <Filter className="w-4 h-4" /> Filtros Avanzados
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 font-bold">Usuario (Email)</th>
                                <th className="p-4 font-bold">Decisión Evaluada</th>
                                <th className="p-4 font-bold">Estado</th>
                                <th className="p-4 font-bold">Opción Ganadora</th>
                                <th className="p-4 font-bold text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockAuditData.map((record) => (
                                <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-600">{record.user}</td>
                                    <td className="p-4 font-bold text-slate-800">{record.title}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${record.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {record.status === 'COMPLETED' ? 'Finalizado' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-indigo-600">{record.winner}</td>
                                    <td className="p-4 text-center">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};