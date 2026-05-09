import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import {
    Trophy, ArrowLeft, PieChart, Loader2, Download, FileText, AlertTriangle, Activity, Sliders
} from 'lucide-react';
import { ScoreChart } from './components/ScoreChart';
import { RadarEvaluationChart } from './components/RadarEvaluationChart'; // 👈 NUEVO
import { SensitivityPanel } from './components/SensitivityPanel'; // 👈 NUEVO
import { api } from '../../api/axios';

import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export const Results = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentDecision, recommendation } = useDecisionStore();

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Estado para el Análisis de Sensibilidad (Pesos dinámicos)
    const [localWeights, setLocalWeights] = useState<any[]>([]);

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
                        recommendedOptionName: resData.recommendedOption?.name || "Sin recomendación",
                        justification: resData.justification || "Análisis recuperado del historial.",
                        finalScores: resData.finalScores || {},
                        stressLevel: resData.stressLevel || 1,
                        urgencyScore: resData.urgencyScore || 1,
                        criteria: resData.criteria || [],     // 👈 Necesario para el Radar/Sliders
                        options: resData.options || [],       // 👈 Necesario para el Radar
                        matrix: resData.evaluationMatrix || {}// 👈 Necesario para el Radar
                    });

                    if (resData.criteria) {
                        setLocalWeights(resData.criteria.map((c: any) => ({ id: c.id, name: c.name, weight: c.weight })));
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
                    finalScores: recommendation.finalScores,
                    stressLevel: decision.stressLevel || 1,
                    urgencyScore: decision.urgencyScore || 1,
                    criteria: decision.criteria || [],
                    options: decision.options || [],
                    matrix: {} // Si es nueva y no fuimos al backend, la matriz puede venir del store
                });
                if (decision.criteria) {
                    setLocalWeights(decision.criteria.map((c: any) => ({ id: c.id, name: c.name, weight: c.weight })));
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
                backgroundColor: '#ffffff',
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
            alert("No se pudo exportar el documento. Revisa la consola.");
        } finally {
            setIsExporting(false);
        }
    };

    // --- PROCESAMIENTO DE DATOS PARA GRÁFICOS ---
    const chartData = data?.finalScores ? Object.entries(data.finalScores).map(([name, score]) => ({
        optionName: name,
        score: score as number
    })) : [];

    // Generamos la data del Radar cruzando los criterios con las opciones y la matriz
    const radarData = data?.criteria?.map((c: any) => {
        const row: any = { subject: c.name };
        data?.options?.forEach((opt: any) => {
            // Buscamos el puntaje exacto de esa opción en ese criterio
            const rawScore = data?.matrix?.[opt.id]?.[c.id] || 0;
            // Lo multiplicamos por 10 (ej. si el puntaje era 1 a 10, lo pasamos a escala 100 para el gráfico)
            row[opt.name] = rawScore * 10;
        });
        return row;
    }) || [];

    const optionNames = data?.options?.map((o: any) => o.name) || [];

    // Manejador del Slider
    const handleWeightChange = (criterionId: string, newWeight: number) => {
        setLocalWeights(prev => prev.map(w => w.id === criterionId ? { ...w, weight: newWeight } : w));
        // 💡 Aquí a futuro podemos hacer que recalcule chartData en tiempo real
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="mt-4 text-slate-500 font-medium">Sincronizando análisis experto...</p>
        </div>
    );

    if (!data) return (
        <div className="text-center p-10">
            <h2 className="text-xl font-bold text-slate-800">No se encontró la decisión</h2>
            <button onClick={() => navigate('/dashboard')} className="text-blue-500 underline mt-2">Ir al Dashboard</button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto mt-6 px-4 mb-20 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{data.title}</h2>
                    <p className="text-slate-500 text-sm">Resumen detallado del análisis mediante TOPSIS</p>
                </div>
                <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50">
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Generando...' : 'Exportar Informe PDF'}
                </button>
            </div>

            {/* --- ÁREA DE REPORTE --- */}
            <div id="report-area" style={{ backgroundColor: '#ffffff', color: '#1e293b' }} className="space-y-6 p-8 rounded-[2.5rem] border border-[#f1f5f9] shadow-sm">

                <div className="grid grid-cols-2 gap-4">
                    <div style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }} className="border p-4 rounded-2xl flex items-center gap-4">
                        <div style={{ backgroundColor: '#f97316' }} className="p-2 rounded-lg"><Activity color="#ffffff" className="w-5 h-5" /></div>
                        <div>
                            <p style={{ color: '#c2410c' }} className="text-[10px] font-bold uppercase tracking-widest">Nivel de Estrés</p>
                            <p style={{ color: '#7c2d12' }} className="text-lg font-black">{data.stressLevel} / 5</p>
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#fef2f2', borderColor: '#fee2e2' }} className="border p-4 rounded-2xl flex items-center gap-4">
                        <div style={{ backgroundColor: '#dc2626' }} className="p-2 rounded-lg"><AlertTriangle color="#ffffff" className="w-5 h-5" /></div>
                        <div>
                            <p style={{ color: '#b91c1c' }} className="text-[10px] font-bold uppercase tracking-widest">Urgencia</p>
                            <p style={{ color: '#7f1d1d' }} className="text-lg font-black">{data.urgencyScore} / 5</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)', backgroundColor: '#2563eb' }} className="rounded-[2rem] p-10 text-white shadow-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><FileText color="#ffffff" className="w-32 h-32" /></div>
                    <Trophy color="#fde047" className="w-16 h-16 mx-auto mb-4" />
                    <span className="text-[#dbeafe] uppercase tracking-[0.2em] text-xs font-bold mb-2 block">Opción Ganadora</span>
                    <h1 className="text-5xl font-black mb-6 text-white">{data.recommendedOptionName}</h1>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} className="backdrop-blur-md p-6 rounded-2xl inline-block max-w-2xl border border-white/10">
                        <p className="text-lg leading-relaxed italic text-white">"{data.justification}"</p>
                    </div>
                </div>

                {/* --- NUEVA SECCIÓN DE GRÁFICOS (Layout Grid) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {/* Gráfico de Barras */}
                    <div style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }} className="p-6 rounded-3xl shadow-sm border">
                        <h3 style={{ color: '#1e293b' }} className="text-xl font-bold mb-6 flex items-center gap-3">
                            <PieChart color="#3b82f6" className="w-6 h-6" /> Puntajes Finales (TOPSIS)
                        </h3>
                        <div className="h-[350px] w-full">
                            <ScoreChart data={chartData} />
                        </div>
                    </div>

                    {/* Gráfico de Radar Multidimensional */}
                    <div style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }} className="p-6 rounded-3xl shadow-sm border">
                        <h3 style={{ color: '#1e293b' }} className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Activity color="#8b5cf6" className="w-6 h-6" /> Perfil Multidimensional
                        </h3>
                        <div className="h-[350px] w-full">
                            <RadarEvaluationChart data={radarData} optionKeys={optionNames} />
                        </div>
                    </div>
                </div>

                {/* Panel de Análisis de Sensibilidad */}
                {localWeights.length > 0 && (
                    <div className="mt-8 border-t border-dashed border-slate-200 pt-8">
                        <SensitivityPanel criteria={localWeights} onWeightChange={handleWeightChange} />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
                <button onClick={() => navigate(isHistoryView ? '/history' : '/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
                    <ArrowLeft className="w-5 h-5" /> {isHistoryView ? 'Volver al Historial' : 'Ir al Dashboard'}
                </button>
                <button onClick={() => navigate('/new-decision')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100">
                    Nueva Decisión
                </button>
            </div>
        </div>
    );
};