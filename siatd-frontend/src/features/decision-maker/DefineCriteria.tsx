import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { Scale, Plus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';
import { useTranslation } from 'react-i18next';

export const DefineCriteria = () => {
    const { t } = useTranslation();
    const { currentDecision, addCriterion } = useDecisionStore();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [weight, setWeight] = useState(5);
    const [isPositive, setIsPositive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    if (!currentDecision) {
        return (
            <div className="text-center mt-20 transition-colors duration-200">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('decision.criteria.noActive')}</h2>
                <button onClick={() => navigate('/new-decision')} className="mt-4 text-blue-600 dark:text-blue-400 underline">
                    {t('decision.criteria.goBack')}
                </button>
            </div>
        );
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !currentDecision) return;

        setIsLoading(true);

        try {
            const response = await api.post(`/decisions/${currentDecision.id}/criteria`, {
                name,
                weight: weight / 10,
                isPositive
            });

            addCriterion(response.data);

            setName('');
            setWeight(5);
            setIsPositive(true);
        } catch (error) {
            console.error("Error al guardar el criterio:", error);
            alert(t('decision.criteria.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6 transition-colors duration-200">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Scale className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    {t('decision.criteria.title')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    {t('decision.criteria.currentDecision')} <span className="font-semibold text-slate-700 dark:text-slate-300">{currentDecision.title}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-fit transition-colors">
                    <form onSubmit={handleAdd} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('decision.criteria.name')}</label>
                            <input
                                type="text"
                                placeholder={t('decision.criteria.namePlaceholder')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {t('decision.criteria.importance')} ({weight}/10)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={weight}
                                onChange={(e) => setWeight(Number(e.target.value))}
                                className="w-full accent-blue-600 dark:accent-blue-400"
                                disabled={isLoading}
                            />
                            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                                <span>{t('decision.criteria.low')}</span>
                                <span>{t('decision.criteria.high')}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('decision.criteria.impactType')}</label>
                            <select
                                value={isPositive ? 'true' : 'false'}
                                onChange={(e) => setIsPositive(e.target.value === 'true')}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                                disabled={isLoading}
                            >
                                <option value="true">{t('decision.criteria.benefit')}</option>
                                <option value="false">{t('decision.criteria.cost')}</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            {isLoading ? t('decision.criteria.saving') : t('decision.criteria.add')}
                        </button>
                    </form>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">{t('decision.criteria.selected')}</h3>

                    {currentDecision.criteria.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-500 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                            {t('decision.criteria.empty')}
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {currentDecision.criteria.map((c) => (
                                <li key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{c.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {t('decision.criteria.weight')}: {c.weight * 10}/10 | {c.isPositive ? t('decision.criteria.benefit') : t('decision.criteria.cost')}
                                        </p>
                                    </div>
                                    <button
                                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title={t('decision.criteria.deleteTitle')}
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
                            {t('decision.criteria.next')} <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    {currentDecision.criteria.length < 2 && (
                        <p className="text-xs text-right text-slate-400 dark:text-slate-500 mt-2">{t('decision.criteria.minCriteria')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
