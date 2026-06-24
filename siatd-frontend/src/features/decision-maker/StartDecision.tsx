import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { api } from '../../api/axios';
import { Target, Loader2, Activity, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const StartDecision = () => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [stressLevel, setStressLevel] = useState(3);
    const [urgencyScore, setUrgencyScore] = useState(3);
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
            const response = await api.post('/decisions', {
                title: title,
                status: 'DRAFT',
                stressLevel: stressLevel,
                urgencyScore: urgencyScore,
                criteria: [],
                options: []
            });

            setDecision(response.data);
            navigate('/define-criteria');

        } catch (err) {
            console.error("Error al crear decisión:", err);
            setError(t('decision.start.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 transition-colors duration-200 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 transition-colors duration-200">

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-4 rounded-2xl text-blue-600 dark:text-blue-400">
                        <Target className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('decision.start.title')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1">{t('decision.start.subtitle')}</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-2xl text-sm border border-red-100 dark:border-red-500/20 flex items-center gap-3 font-medium">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleStart} className="space-y-8">
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                            {t('decision.start.question')}
                        </label>
                        <input
                            id="title"
                            type="text"
                            placeholder={t('decision.start.questionPlaceholder')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all disabled:opacity-50 text-lg font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                <Activity className="w-4 h-4 text-orange-500" />
                                {t('decision.start.stress')}
                            </label>
                            <div className="flex justify-between gap-2">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={`stress-${num}`}
                                        type="button"
                                        onClick={() => setStressLevel(num)}
                                        className={`flex-1 h-12 rounded-xl font-black transition-all duration-300 ${stressLevel >= num
                                                ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-none scale-105'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest px-1">
                                <span>{t('decision.start.stressLow')}</span>
                                <span>{t('decision.start.stressHigh')}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                {t('decision.start.urgency')}
                            </label>
                            <div className="flex justify-between gap-2">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={`urgency-${num}`}
                                        type="button"
                                        onClick={() => setUrgencyScore(num)}
                                        className={`flex-1 h-12 rounded-xl font-black transition-all duration-300 ${urgencyScore >= num
                                                ? 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-none scale-105'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest px-1">
                                <span>{t('decision.start.urgencyLow')}</span>
                                <span>{t('decision.start.urgencyHigh')}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!title.trim() || isLoading}
                        className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200 dark:shadow-none mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                {t('decision.start.submitting')}
                            </>
                        ) : (
                            t('decision.start.submit')
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
