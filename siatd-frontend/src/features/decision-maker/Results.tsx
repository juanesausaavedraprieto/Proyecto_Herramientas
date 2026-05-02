import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import {
    Trophy,
    ArrowLeft,
    PieChart,
    Loader2,
    Download,
    FileText,
    AlertTriangle,
    Activity
} from 'lucide-react';
import { ScoreChart } from './components/ScoreChart';
import { api } from '../../api/axios';

// Librerías para exportación
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const Results = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentDecision, recommendation } = useDecisionStore();

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

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
                        urgencyScore: resData.urgencyScore || 1
                    });
                } catch (err) {
                    console.error("Error al cargar historial:", err);
                } finally {
                    setIsLoading(false);
                }
            } else if (currentDecision && recommendation) {
                // 🛠️ SOLUCIÓN AL ERROR DE TYPESCRIPT: Usamos "as any" para que no marque error
                const decision = currentDecision as any;

                setData({
                    title: decision.title,
                    recommendedOptionName: recommendation.recommendedOption.name,
                    justification: recommendation.justification,
                    finalScores: recommendation.finalScores,
                    stressLevel: decision.stressLevel || 1,
                    urgencyScore: decision.urgencyScore || 1
                });
            }
        };
        loadData();
    }, [id, currentDecision, recommendation]);

    const handleExportPDF = async () => {
        const input = document.getElementById('report-area');
        if (!input) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Informe_SIATD_${data.title.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error al generar PDF:", error);
        } finally {
            setIsExporting(false);
        }
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

    const chartData = Object.entries(data.finalScores).map(([name, score]) => ({
        optionName: name,
        score: score as number
    }));

    return (
        <div className="max-w-4xl mx-auto mt-6 px-4 mb-20 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{data.title}</h2>
                    <p className="text-slate-500 text-sm">Resumen detallado del análisis</p>
                </div>

                <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Generando...' : 'Exportar Informe PDF'}
                </button>
            </div>

            {/* --- ÁREA DE REPORTE --- */}
            <div id="report-area" className="space-y-6 bg-white p-2 rounded-3xl">

                {/* Indicadores de Contexto (NUEVO) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-4">
                        <div className="bg-orange-500 p-2 rounded-lg text-white">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Nivel de Estrés</p>
                            <p className="text-lg font-black text-orange-900">{data.stressLevel} / 5</p>
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
                        <div className="bg-red-600 p-2 rounded-lg text-white">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Urgencia</p>
                            <p className="text-lg font-black text-red-900">{data.urgencyScore} / 5</p>
                        </div>
                    </div>
                </div>

                {/* Tarjeta del Ganador */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 text-white shadow-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <FileText className="w-32 h-32" />
                    </div>

                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300 drop-shadow-lg" />
                    <span className="text-blue-100 uppercase tracking-[0.2em] text-xs font-bold mb-2 block">
                        Opción Ganadora
                    </span>
                    <h1 className="text-5xl font-black mb-6">{data.recommendedOptionName}</h1>

                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl inline-block max-w-2xl border border-white/10">
                        <p className="text-lg leading-relaxed italic text-blue-50">
                            "{data.justification}"
                        </p>
                    </div>
                </div>

                {/* Gráfico de Resultados */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <PieChart className="w-6 h-6 text-blue-500" />
                        Análisis Cuantitativo
                    </h3>
                    <div className="h-[400px] w-full">
                        <ScoreChart data={chartData} />
                    </div>
                </div>
            </div>

            {/* Botones de Navegación */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
                <button
                    onClick={() => navigate(isHistoryView ? '/history' : '/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {isHistoryView ? 'Volver al Historial' : 'Ir al Dashboard'}
                </button>

                <button
                    onClick={() => navigate('/new-decision')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100"
                >
                    Nueva Decisión
                </button>
            </div>
        </div>
    );
};