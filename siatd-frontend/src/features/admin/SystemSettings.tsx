import { useState, useEffect } from 'react';
import { Settings, Brain, Sliders, Save, Database, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../../api/axios';

export const SystemSettings = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Estado que guarda la configuración real
    const [settings, setSettings] = useState({
        topsisThreshold: 85,
        strictNormalization: true,
        aiSystemPrompt: "",
        aiModel: "Gemini 2.5 Flash"
    });

    // 1. Cargar datos al entrar a la pantalla
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings');
                setSettings(response.data);
            } catch (error) {
                console.error("Error al cargar configuraciones", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // 2. Manejador genérico para inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 3. Enviar a PostgreSQL
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/admin/settings', settings);
            alert("✅ Configuración del motor actualizada en el servidor.");
        } catch (error) {
            console.error("Error al guardar", error);
            alert("❌ Hubo un error al guardar la configuración.");
        } finally {
            setIsSaving(false);
        }
    };

    // 4. Funciones de la Zona de Peligro (Ejemplos reales)
    const handlePurgeDrafts = async () => {
        if (confirm("⚠️ ¿Estás seguro de eliminar todos los borradores? Esta acción no se puede deshacer.")) {
            try {
                // Aquí llamarías a un endpoint: await api.delete('/admin/decisions/drafts');
                alert("Borradores purgados exitosamente de la base de datos.");
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="mt-4 text-slate-500 font-medium">Cargando hiperparámetros...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 mb-20">
            <div className="flex justify-between items-end mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-3 rounded-2xl text-white"><Settings className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configuración del Sistema</h1>
                        <p className="text-slate-500 mt-1">Ajusta los hiperparámetros del motor de inferencia y reglas de IA.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-70"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                            <Sliders className="w-5 h-5 text-indigo-500" /> Parámetros TOPSIS
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                                    <span>Umbral de Confianza Mínimo</span>
                                    <span className="text-indigo-600">{settings.topsisThreshold}%</span>
                                </label>
                                <input
                                    type="range"
                                    name="topsisThreshold"
                                    min="50" max="100"
                                    value={settings.topsisThreshold}
                                    onChange={handleChange}
                                    className="w-full accent-indigo-600"
                                />
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-700">Normalización Vectorial Estricta</h4>
                                    <p className="text-xs text-slate-500">Aplica raíz cuadrada sumatoria en matrices.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="strictNormalization"
                                        checked={settings.strictNormalization}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl shadow-xl text-white">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-200">
                            <Brain className="w-5 h-5" /> Reglas de Inteligencia Artificial
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Prompt Maestro del Sistema</label>
                                <textarea
                                    name="aiSystemPrompt"
                                    value={settings.aiSystemPrompt}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 outline-none focus:border-indigo-500 h-32 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Modelo de Procesamiento</label>
                                <select
                                    name="aiModel"
                                    value={settings.aiModel}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-300 outline-none"
                                >
                                    <option value="Gemini 2.5 Flash">Gemini 2.5 Flash (Activo)</option>
                                    <option value="Gemini Pro">Gemini Pro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Database className="w-5 h-5 text-slate-400" /> Mantenimiento
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 transition-colors">
                                Exportar Logs de Decisiones (CSV)
                            </button>
                        </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                        <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-5 h-5 text-red-600" /> Zona de Peligro
                        </h3>
                        <p className="text-xs text-red-600 mb-4">Estas acciones afectarán a todos los usuarios del sistema de forma irreversible.</p>
                        <button
                            onClick={handlePurgeDrafts}
                            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 transition-colors"
                        >
                            Purgar Decisiones Borrador
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};