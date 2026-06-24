import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import {
    Trophy, ArrowLeft, PieChart, Loader2, Download, FileText,
    AlertTriangle, Activity, Sliders, ClipboardList, ShieldAlert,
    Sparkles, CheckCircle2, RefreshCw
} from 'lucide-react';
import { ScoreChart } from './components/ScoreChart';
import { RadarEvaluationChart } from './components/RadarEvaluationChart';
import { SensitivityPanel } from './components/SensitivityPanel';
import { api } from '../../api/axios';
import { calculateLocalTopsis } from '../../utils/topsisMath';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface RecommendationsProps {
    decisionId: string;
    rawRecommendations: string;
    onRegenerated: (newText: string) => void;
}

const StrategicRecommendations = ({ decisionId, rawRecommendations, onRegenerated }: RecommendationsProps) => {
    const { t } = useTranslation();
    const [isRegenerating, setIsRegenerating] = useState(false);

    const sections = rawRecommendations.split('###');

    const getSectionContent = (index: number) => {
        if (!sections[index]) return t('decision.results.processing');
        return sections[index].replace(/^\s*\d+\.\s*[^\n]*/g, '').trim();
    };

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        toast.info(t('decision.results.regenerating'), { duration: 3000 });

        try {
            const response = await api.post(`/decisions/${decisionId}/regenerate-recommendations`);
            const newText = response.data.recommendations;
            onRegenerated(newText);
            toast.success(t('decision.results.regenerateSuccess'));
        } catch (error) {
            toast.error(t('decision.results.regenerateError'));
        } finally {
            setIsRegenerating(false);
        }
    };

    const isFallback = rawRecommendations.includes("1. Proceder con el despliegue");

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm p-8 mt-8 animate-in fade-in duration-700 transition-colors">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">{t('decision.results.strategicConsulting')}</h3>
                </div>

                <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isFallback
                            ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 animate-pulse'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                        } disabled:opacity-50`}
                    title={t('decision.results.strategicConsulting')}
                >
                    <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? t('decision.results.regenerateLoading') : isFallback ? t('decision.results.retry') : t('decision.results.regenerate')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50/40 dark:bg-emerald-500/10 border border-emerald-100/60 dark:border-emerald-500/20 p-6 rounded-2xl flex flex-col gap-3 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        {t('decision.results.actionPlan')}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {getSectionContent(1)}
                    </div>
                </div>

                <div className="bg-amber-50/40 dark:bg-amber-500/10 border border-amber-100/60 dark:border-amber-500/20 p-6 rounded-2xl flex flex-col gap-3 transition-colors">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm uppercase tracking-wider">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        {t('decision.results.riskMitigation')}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {getSectionContent(2)}
                    </div>
                </div>

                <div className="bg-indigo-50/40 dark:bg-indigo-500/10 border border-indigo-100/60 dark:border-indigo-500/20 p-6 rounded-2xl flex flex-col gap-3 transition-colors">
                    <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
                        <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                        {t('decision.results.biasControl')}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {getSectionContent(3)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Results = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentDecision, recommendation } = useDecisionStore();

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [localWeights, setLocalWeights] = useState<any[]>([]);
    const [originalWeights, setOriginalWeights] = useState<any[]>([]);
    const [simulatedScores, setSimulatedScores] = useState<Record<string, number> | null>(null);
    const [isSimulationActive, setIsSimulationActive] = useState(false);

    const isHistoryView = !!id || location.pathname.includes('continue');

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                setIsLoading(true);
                try {
                    const response = await api.get(`/decisions/${id}`);
                    const resData = response.data;
                    setData({
                        title: resData.title,
                        recommendedOptionName: resData.recommendedOption?.name || t('decision.results.noRecommendation'),
                        justification: resData.justification || t('decision.results.analysisRecovered'),
                        recommendations: resData.recommendations || "",
                        finalScores: resData.finalScores || {},
                        stressLevel: resData.stressLevel || 1,
                        urgencyScore: resData.urgencyScore || 1,
                        criteria: resData.criteria || [],
                        options: resData.options || [],
                        matrix: resData.evaluationMatrix || {}
                    });

                    if (resData.criteria) {
                        const weights = resData.criteria.map((c: any) => ({ ...c }));
                        setLocalWeights(weights);
                        setOriginalWeights(JSON.parse(JSON.stringify(weights)));
                    }
                } catch (err) {
                    console.error("Error al cargar historial:", err);
                } finally {
                    setIsLoading(false);
                }
            } else if (currentDecision && recommendation) {
                const decision = currentDecision as any;
                setData({
                    title: decision.title,
                    recommendedOptionName: recommendation.recommendedOption.name,
                    justification: recommendation.justification,
                    recommendations: recommendation.recommendations || "",
                    finalScores: recommendation.finalScores,
                    stressLevel: decision.stressLevel || 1,
                    urgencyScore: decision.urgencyScore || 1,
                    criteria: decision.criteria || [],
                    options: decision.options || [],
                    matrix: {}
                });
                if (decision.criteria) {
                    const weights = decision.criteria.map((c: any) => ({ ...c }));
                    setLocalWeights(weights);
                    setOriginalWeights(JSON.parse(JSON.stringify(weights)));
                }
            }
        };
        loadData();
    }, [id, currentDecision, recommendation]);

    const handleExportPDF = async () => {
        const input = document.getElementById('report-area');
        if (!input || !data) return;

        setIsExporting(true);
        try {
            const dataUrl = await toPng(input, {
                pixelRatio: 2,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                cacheBust: true,
                style: { margin: '0' }
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (input.offsetHeight * pdfWidth) / input.offsetWidth;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SIATD_Reporte_${data.title.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error fatal al generar PDF:", error);
            alert(t('decision.results.exportError'));
        } finally {
            setIsExporting(false);
        }
    };

    const handleWeightChange = (criterionId: string, newWeight: number) => {
        setIsSimulationActive(true);
        const updatedWeights = localWeights.map(w => w.id === criterionId ? { ...w, weight: newWeight } : w);
        setLocalWeights(updatedWeights);

        if (data && data.matrix && data.options) {
            const newScores = calculateLocalTopsis(data.matrix, updatedWeights, data.options);
            setSimulatedScores(newScores);
        }
    };

    const handleResetSimulation = () => {
        setLocalWeights(JSON.parse(JSON.stringify(originalWeights)));
        setSimulatedScores(null);
        setIsSimulationActive(false);
    };

    const activeScores = isSimulationActive ? simulatedScores : data?.finalScores;

    const chartData = activeScores ? Object.entries(activeScores).map(([name, score]) => ({
        optionName: name,
        score: score as number
    })).sort((a, b) => b.score - a.score) : [];

    const radarData = data?.criteria?.map((c: any) => {
        const row: any = { subject: c.name };
        data?.options?.forEach((opt: any) => {
            const rawScore = data?.matrix?.[opt.id]?.[c.id] || 0;
            row[opt.name] = rawScore * 10;
        });
        return row;
    }) || [];

    const optionNames = data?.options?.map((o: any) => o.name) || [];

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="mt-4 text-slate-500 font-medium">{t('decision.results.loading')}</p>
        </div>
    );

    if (!data) return (
        <div className="text-center p-10">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('decision.results.notFound')}</h2>
            <button onClick={() => navigate('/')} className="text-blue-500 dark:text-blue-400 underline mt-2">{t('decision.results.dashboardLink')}</button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto mt-6 px-4 mb-20 animate-in fade-in duration-500 transition-colors">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{data.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t('decision.results.title')}</p>
                </div>
                <button
                    onClick={handleExportPDF}
                    disabled={isExporting || isSimulationActive}
                    className="flex items-center gap-2 bg-[#1e293b] dark:bg-slate-700 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all shadow-lg disabled:opacity-50"
                    title={isSimulationActive ? t('decision.results.exportDisabled') : t('decision.results.export')}
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? t('decision.results.generating') : t('decision.results.export')}
                </button>
            </div>

            <div id="report-area" className="space-y-6 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-colors">

                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-orange-100 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 p-4 rounded-2xl flex items-center gap-4 transition-colors">
                        <div className="bg-orange-500 p-2 rounded-lg"><Activity color="#ffffff" className="w-5 h-5" /></div>
                        <div>
                            <p className="text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest">{t('decision.results.stressLevel')}</p>
                            <p className="text-orange-900 dark:text-orange-300 text-lg font-black">{data.stressLevel} / 5</p>
                        </div>
                    </div>
                    <div className="border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl flex items-center gap-4 transition-colors">
                        <div className="bg-red-600 p-2 rounded-lg"><AlertTriangle color="#ffffff" className="w-5 h-5" /></div>
                        <div>
                            <p className="text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest">{t('decision.results.urgency')}</p>
                            <p className="text-red-900 dark:text-red-300 text-lg font-black">{data.urgencyScore} / 5</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)' }} className="rounded-[2rem] p-10 text-white shadow-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><FileText color="#ffffff" className="w-32 h-32" /></div>
                    <Trophy color="#fde047" className="w-16 h-16 mx-auto mb-4" />
                    <span className="text-[#dbeafe] uppercase tracking-[0.2em] text-xs font-bold mb-2 block">{t('decision.results.winner')}</span>
                    <h1 className="text-5xl font-black mb-6 text-white">{data.recommendedOptionName}</h1>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} className="backdrop-blur-md p-6 rounded-2xl inline-block max-w-2xl border border-white/10">
                        <p className="text-lg leading-relaxed italic text-white">"{data.justification}"</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                        <h3 className="text-slate-800 dark:text-white text-xl font-bold mb-6 flex items-center gap-3">
                            <PieChart color="#3b82f6" className="w-6 h-6" /> {t('decision.results.scores')}
                        </h3>
                        <div className="h-[350px] w-full">
                            <ScoreChart data={chartData} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                        <h3 className="text-slate-800 dark:text-white text-xl font-bold mb-6 flex items-center gap-3">
                            <Activity color="#8b5cf6" className="w-6 h-6" /> {t('decision.results.radar')}
                        </h3>
                        <div className="h-[350px] w-full">
                            <RadarEvaluationChart data={radarData} optionKeys={optionNames} />
                        </div>
                    </div>
                </div>

                {localWeights.length > 0 && data?.matrix && (
                    <div className="mt-8 border-t border-dashed border-slate-200 dark:border-slate-700 pt-8 transition-colors">
                        <SensitivityPanel
                            criteria={localWeights}
                            onWeightChange={handleWeightChange}
                            onReset={handleResetSimulation}
                        />
                        {isSimulationActive && (
                            <div className="mt-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 p-3 rounded-xl text-sm font-medium text-center animate-in fade-in">
                                {t('decision.results.simulationActive')}
                            </div>
                        )}
                    </div>
                )}

                {data?.recommendations && (
                    <StrategicRecommendations
                        decisionId={id || currentDecision?.id || ''}
                        rawRecommendations={data.recommendations}
                        onRegenerated={(newText) => setData({ ...data, recommendations: newText })}
                    />
                )}
            </div>

            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 transition-colors">
                <button onClick={() => navigate(isHistoryView ? '/history' : '/')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold transition-colors">
                    <ArrowLeft className="w-5 h-5" /> {isHistoryView ? t('decision.results.backToHistory') : t('decision.results.backToDashboard')}
                </button>
                <button onClick={() => navigate('/new-decision')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 dark:shadow-none transition-colors">
                    {t('decision.results.newDecision')}
                </button>
            </div>
        </div>
    );
};
