import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { api } from '../../api/axios';
import { Loader2 } from 'lucide-react';

export const ContinueDecision = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAndResume = async () => {
            if (!id) {
                navigate('/');
                return;
            }

            try {
                // 1. Obtenemos la decisión parcial desde el backend
                const response = await api.get(`/decisions/${id}`);
                const decision = response.data;

                // 2. Cargamos los datos en el estado global (Zustand)
                // 🚨 CORRECCIÓN: Metemos criteria y options DENTRO de currentDecision también
                useDecisionStore.setState({
                    currentDecision: {
                        id: decision.id,
                        title: decision.title,
                        stressLevel: decision.stressLevel || 1,
                        urgencyScore: decision.urgencyScore || 1,
                        criteria: decision.criteria || [], // <-- AQUÍ
                        options: decision.options || []    // <-- Y AQUÍ
                    },
                    criteria: decision.criteria || [],
                    options: decision.options || []
                });

                // 3. Enrutamiento Inteligente (Router)
                if (!decision.criteria || decision.criteria.length === 0) {
                    // Falta definir criterios
                    navigate('/define-criteria');
                } else if (!decision.options || decision.options.length === 0) {
                    // Faltan opciones
                    navigate('/define-options');
                } else if (decision.evaluationMatrix && Object.keys(decision.evaluationMatrix).length > 0) {
                    // 🚨 NUEVA REGLA: Si la matriz ya tiene datos guardados, ¡la decisión está terminada!
                    navigate(`/results/${decision.id}`);
                } else {
                    // Si tiene opciones y criterios pero la matriz está vacía, a calificar
                    navigate('/evaluation-matrix');
                }

            } catch (error) {
                console.error('Error al reanudar la decisión:', error);
                alert('Hubo un error al cargar el progreso de esta decisión.');
                navigate('/');
            }
        };

        fetchAndResume();
    }, [id, navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-500">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-6" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recuperando tu progreso...</h2>
            <p className="text-slate-500 mt-2 font-medium">Preparando el entorno de análisis experto</p>
        </div>
    );
};