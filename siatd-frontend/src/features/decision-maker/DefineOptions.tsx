// src/features/decision-maker/DefineOptions.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { api } from '../../api/axios';
import { ListTodo, Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';

export const DefineOptions = () => {
    const { currentDecision, addOption } = useDecisionStore();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirección de seguridad
    if (!currentDecision) {
        return (
            <div className="text-center mt-20 transition-colors duration-200">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">No hay una decisión activa</h2>
                <button onClick={() => navigate('/new-decision')} className="mt-4 text-blue-600 dark:text-blue-400 underline">Volver al inicio</button>
            </div>
        );
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);

        try {
            const response = await api.post(`/decisions/${currentDecision.id}/options`, {
                name
            });

            // Guardamos la opción real con su ID de base de datos
            addOption(response.data);
            setName('');
        } catch (error) {
            console.error("Error al guardar la opción:", error);
            alert("Error al conectar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6 transition-colors duration-200">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <ListTodo className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    Definir Alternativas
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    ¿Cuáles son las opciones que estás considerando para: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentDecision.title}</span>?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulario */}
                <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-fit transition-colors">
                    <form onSubmit={handleAdd} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nueva Opción</label>
                            <input
                                type="text"
                                placeholder="Ej: Trabajar en Google, Emprender..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none disabled:bg-gray-50 dark:disabled:bg-slate-800 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Agregar Opción</>}
                        </button>
                    </form>
                </div>

                {/* Lista */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">Alternativas Agregadas</h3>

                    {currentDecision.options.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-500 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                            Agrega las opciones que deseas evaluar.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {currentDecision.options.map((o) => (
                                <li key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 transition-colors">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{o.name}</span>
                                    <button className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => navigate('/evaluation-matrix')}
                            disabled={currentDecision.options.length < 2}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Siguiente: Evaluar Opciones <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};