import { useEffect, useState } from 'react';
import { api } from '../../../api/axios';
import { Star, MessageSquare, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const PendingFeedbackBanner = () => {
    const { t } = useTranslation();
    const [pendingDecisions, setPendingDecisions] = useState<any[]>([]);
    const [activeDecision, setActiveDecision] = useState<any | null>(null);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [selectedStar, setSelectedStar] = useState(0);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await api.get('/decisions/pending-feedback');
                if (res.data.length > 0) {
                    setPendingDecisions(res.data);
                    setActiveDecision(res.data[0]);
                }
            } catch (error) {
                console.error("Error buscando feedback pendiente:", error);
            }
        };
        fetchPending();
    }, []);

    const handleSubmit = async () => {
        if (selectedStar === 0) {
            toast.error(t('feedback.banner.starRequired'));
            return;
        }

        try {
            await api.post(`/decisions/${activeDecision.id}/feedback`, {
                score: selectedStar,
                notes: notes
            });

            toast.success(t('feedback.banner.success'));

            const remaining = pendingDecisions.filter(d => d.id !== activeDecision.id);
            setPendingDecisions(remaining);

            if (remaining.length > 0) {
                setActiveDecision(remaining[0]);
                setSelectedStar(0);
                setNotes('');
            } else {
                setActiveDecision(null);
            }

        } catch (error) {
            toast.error(t('feedback.banner.error'));
        }
    };

    if (!activeDecision) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden mb-8 border border-indigo-500/30 animate-in slide-in-from-top-4">
            <div className="absolute -top-10 -right-10 opacity-10">
                <CheckCircle2 className="w-48 h-48 text-white" />
            </div>

            <button onClick={() => setActiveDecision(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="flex-1 text-white">
                    <span className="bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                        {t('feedback.banner.badge')}
                    </span>
                    <h3 className="text-2xl font-black mb-2">{t('feedback.banner.title')}</h3>
                    <p className="text-indigo-200 text-sm mb-4">
                        {t('feedback.banner.description')} <span className="text-white font-bold underline decoration-indigo-500">"{activeDecision.recommendedOption?.name}"</span> {t('feedback.banner.toResolve')} "{activeDecision.title}". {t('feedback.banner.help')}
                    </p>
                </div>

                <div className="flex-1 w-full bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <div className="flex gap-2 justify-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => setSelectedStar(star)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    className={`w-10 h-10 transition-colors ${star <= (hoveredStar || selectedStar)
                                            ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                                            : 'text-slate-500 fill-transparent'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('feedback.banner.placeholder')}
                            className="w-full bg-slate-900/50 text-white placeholder-slate-400 text-sm border border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-indigo-500 resize-none h-20"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {t('feedback.banner.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
};
