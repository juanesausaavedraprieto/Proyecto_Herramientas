import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { api } from '../../api/axios';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ContinueDecision = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { setDecision } = useDecisionStore();

    useEffect(() => {
        const loadDecision = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/decisions/${id}`);
                const decision = response.data;

                setDecision(decision);

                if (decision.criteria?.length === 0) {
                    navigate('/define-criteria');
                } else if (decision.options?.length === 0) {
                    navigate('/define-options');
                } else if (!decision.evaluationMatrix || Object.keys(decision.evaluationMatrix).length === 0) {
                    navigate('/evaluation-matrix');
                } else {
                    navigate('/results');
                }
            } catch (error) {
                console.error("Error al cargar decisión:", error);
                navigate('/');
            }
        };

        loadDecision();
    }, [id, navigate, setDecision]);

    return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="mt-4 text-slate-500 font-medium">{t('decision.results.loading')}</p>
        </div>
    );
};
