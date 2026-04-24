// src/features/decision-maker/DefineCriteria.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { Scale, Plus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';

export const DefineCriteria = () => {
    const { currentDecision, addCriterion } = useDecisionStore();
    const navigate = useNavigate();

    // Estados locales para el formulario
    const [name, setName] = useState('');
    const [weight, setWeight] = useState(5);
    const [isPositive, setIsPositive] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // Estado de carga agregado

    // Si el usuario recargó la página y se perdió la decisión, lo regresamos al inicio
    if (!currentDecision) {
        return (
            <div className="text-center mt-20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800">No hay una decisión activa</h2>
                <button onClick={() => navigate('/new-decision')} className="mt-4 text-blue-600 underline">
                    Volver al inicio
                </button>
            </div>
        );
    }

    // Nueva versión asíncrona de handleAdd
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !currentDecision) return;

        setIsLoading(true);

        try {
            // 1. Enviamos el criterio a Spring Boot
            const response = await api.post(`/decisions/${currentDecision.id}/criteria`, {
                name,
                weight: weight / 10, // Enviamos 0.1 a 1.0
                isPositive
            });

            // 2. Si es exitoso, actualizamos nuestro estado global con el criterio REAL (que trae el ID de Postgres)
            addCriterion(response.data);

            // 3. Limpiamos formulario
            setName('');
            setWeight(5);
            setIsPositive(true);
        } catch (error) {
            console.error("Error al guardar el criterio:", error);
            alert("Hubo un error al guardar el criterio. Revisa la consola.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Scale className="w-7 h-7 text-blue-600" />
                    Definir Criterios de Evaluación
                </h2>
                <p className="text-slate-500 mt-2">
                    Decisión actual: <span className="font-semibold text-slate-700">{currentDecision.title}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulario de ingreso */}
                <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <form onSubmit={handleAdd} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Criterio</label>
                            <input
                                type="text"
                                placeholder="Ej: Salario, Distancia, Estrés..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Importancia ({weight}/10)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={weight}
                                onChange={(e) => setWeight(Number(e.target.value))}
                                className="w-full accent-blue-600"
                                disabled={isLoading}
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Poco</span>
                                <span>Muy importante</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Impacto</label>
                            <select
                                value={isPositive ? 'true' : 'false'}
                                onChange={(e) => setIsPositive(e.target.value === 'true')}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={isLoading}
                            >
                                <option value="true">📈 Beneficio (Más es mejor)</option>
                                <option value="false">📉 Costo (Menos es mejor)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            {isLoading ? 'Guardando...' : 'Agregar Criterio'}
                        </button>
                    </form>
                </div>

                {/* Lista de criterios agregados */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Criterios Seleccionados</h3>

                    {currentDecision.criteria.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-xl">
                            Aún no has agregado ningún criterio.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {currentDecision.criteria.map((c) => (
                                <li key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <p className="font-medium text-slate-800">{c.name}</p>
                                        <p className="text-sm text-slate-500">
                                            Peso: {c.weight * 10}/10 | {c.isPositive ? 'Beneficio 📈' : 'Costo 📉'}
                                        </p>
                                    </div>
                                    <button
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar (Próximamente)"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => navigate('/define-options')}
                            disabled={currentDecision.criteria.length < 2 || isLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente: Definir Opciones <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    {currentDecision.criteria.length < 2 && (
                        <p className="text-xs text-right text-slate-400 mt-2">Agrega al menos 2 criterios para continuar</p>
                    )}
                </div>
            </div>
        </div>
    );
};