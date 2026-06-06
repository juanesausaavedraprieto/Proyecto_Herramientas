import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { History, ShieldAlert, ArrowRight, Clock, Loader2 } from 'lucide-react';

export const SystemAuditLog = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                const response = await api.get('/admin/settings/audit');
                setLogs(response.data);
            } catch (error) {
                console.error("Error cargando auditoría del sistema", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuditLogs();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 transition-colors duration-200">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Extrayendo registros de seguridad...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-rose-100 dark:bg-rose-500/20 p-3 rounded-2xl text-rose-600 dark:text-rose-400 transition-colors">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Registro de Cambios del Motor</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Trazabilidad estricta sobre las modificaciones de hiperparámetros.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-8 transition-colors">
                {logs.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">El motor se encuentra en su configuración de fábrica. No se registran alteraciones.</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-3 space-y-8">
                        {logs.map((log) => (
                            <div key={log.id} className="relative pl-8 animate-in slide-in-from-left-2 duration-300">
                                {/* Punto en la línea de tiempo */}
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-rose-500 border-4 border-white dark:border-slate-800"></div>

                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(log.changedAt).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                                    <span className="text-rose-500 dark:text-rose-400 ml-2">({log.adminEmail})</span>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
                                        Modificación en: <span className="text-indigo-600 dark:text-indigo-400">{log.parameterName}</span>
                                    </h4>

                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 break-all transition-colors">
                                            <span className="block text-[10px] uppercase text-slate-400 mb-1">Valor Anterior</span>
                                            {log.oldValue || 'Vacío'}
                                        </div>

                                        <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />

                                        <div className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 break-all transition-colors">
                                            <span className="block text-[10px] uppercase text-indigo-400 dark:text-indigo-500 mb-1">Nuevo Valor</span>
                                            {log.newValue || 'Vacío'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};