// src/features/decision-maker/StartDecision.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { api } from '../../api/axios';
import { Target, Loader2 } from 'lucide-react';

export const StartDecision = () => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setDecision = useDecisionStore((state) => state.setDecision);
    const navigate = useNavigate();

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // 1. Enviamos el JSON a Spring Boot
            const response = await api.post('/decisions', {
                title: title,
                status: 'DRAFT',
                criteria: [],
                options: []
            });

            // 2. Guardamos la respuesta (con el ID de PostgreSQL) en nuestro estado global
            setDecision(response.data);

            // 3. Avanzamos al siguiente paso
            navigate('/define-criteria');

        } catch (err) {
            console.error("Error al crear decisión:", err);
            setError('Hubo un problema al conectar con el servidor. Verifica que Spring Boot esté corriendo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Target className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Definir el Problema</h2>
                        <p className="text-slate-500">¿Qué decisión importante necesitas tomar hoy?</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleStart} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                            Pregunta o Dilema
                        </label>
                        <input
                            id="title"
                            type="text"
                            placeholder="Ej: ¿Qué oferta de trabajo debería aceptar?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!title.trim() || isLoading}
                        className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            'Comenzar Análisis Estructurado'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};