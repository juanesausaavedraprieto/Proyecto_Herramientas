import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { api } from '../../api/axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Users, Loader2, Sparkles, CheckCircle2, Share2, Crown, Trophy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
    userName: string;
    hasVoted: boolean;
    matrix?: Record<string, Record<string, number>>;
}

export const CollaborationRoom = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentDecision, setRecommendation } = useDecisionStore();

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [myVoteSubmitted, setMyVoteSubmitted] = useState(false);

    const stompClientRef = useRef<Client | null>(null);
    const currentUserName = localStorage.getItem('userName') || 'Usuario';
    const currentUserEmail = localStorage.getItem('userEmail') || '';

    // Validar si el usuario actual es el creador de la decisión (Anfitrión)
    const isHost = currentDecision?.user?.email === currentUserEmail || currentDecision?.user === null;

    useEffect(() => {
        if (!id) return;

        // 1. Configurar conexión segura WebSocket utilizando SockJS y STOMP
        const socket = new SockJS('http://localhost:8080/ws-collab');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log("📡 [WebSocket Debug] " + str),
            reconnectDelay: 5000, // Reconexión automática si se cae la red
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        client.onConnect = () => {
            setIsConnected(true);
            stompClientRef.current = client;

            // 2. Suscribirse al canal en tiempo real de esta decisión específica
            client.subscribe(`/topic/decision/${id}`, (payload) => {
                const message = JSON.parse(payload.body);

                if (message.type === 'JOIN') {
                    setParticipants(prev => {
                        if (prev.some(p => p.userName === message.userName)) return prev;
                        toast.info(`¡${message.userName} se ha unido a la sala deliberativa!`);
                        return [...prev, { userName: message.userName, hasVoted: false }];
                    });
                }

                if (message.type === 'VOTE_SUBMITTED') {
                    setParticipants(prev => prev.map(p =>
                        p.userName === message.userName
                            ? { ...p, hasVoted: true, matrix: message.matrix }
                            : p
                    ));
                    toast.success(`¡${message.userName} ha enviado sus calificaciones! 🗳️`);
                }

                if (message.type === 'ROOM_CLOSED') {
                    toast.success("El anfitrión ha cerrado las votaciones. Procesando matriz...");
                    if (message.recommendation) {
                        setRecommendation(message.recommendation);
                        navigate('/results');
                    }
                }
            });

            // 3. Notificar a la sala que acabamos de entrar
            client.publish({
                destination: `/app/decision/${id}/join`,
                body: JSON.stringify({ type: 'JOIN', userName: currentUserName })
            });
        };

        client.onDisconnect = () => {
            setIsConnected(false);
            toast.error("Se perdió la conexión con la sala en tiempo real.");
        };

        client.activate();

        // Limpieza estricta al desmontar el componente
        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [id]);

    // 🔗 Función para copiar el enlace al portapapeles
    const handleCopyLink = () => {
        const inviteUrl = `${window.location.origin}/collab/${id}`;
        navigator.clipboard.writeText(inviteUrl);
        toast.success("¡Enlace de invitación copiado! Envíalo a tu equipo o junta directiva.");
    };

    // 🗳️ Simular el envío de la votación del usuario actual (puedes conectarlo a un miniformulario rápido)
    const handleSubmitMyVotes = () => {
        if (!stompClientRef.current || !isConnected) return;

        // Generamos una matriz simulada con valores lógicos para la prueba
        const simulatedMatrix: Record<string, Record<string, number>> = {};
        currentDecision?.options.forEach(o => {
            simulatedMatrix[o.id] = {};
            currentDecision?.criteria.forEach(c => {
                simulatedMatrix[o.id][c.id] = Math.floor(Math.random() * 10) + 1; // Valores del 1 al 10
            });
        });

        stompClientRef.current.publish({
            destination: `/app/decision/${id}/vote`,
            body: JSON.stringify({
                type: 'VOTE_SUBMITTED',
                userName: currentUserName,
                matrix: simulatedMatrix
            })
        });

        setMyVoteSubmitted(true);
    };

    // 👑 Función exclusiva del Anfitrión: Promediar matrices y ejecutar TOPSIS
    const handleProcessCollaborativeDecision = async () => {
        const voters = participants.filter(p => p.hasVoted);
        if (voters.length === 0) {
            toast.warning("Al menos un usuario debe enviar sus votos antes de calcular.");
            return;
        }

        setIsCalculating(true);
        const toastId = toast.loading("Calculando promedio ponderado y ejecutando TOPSIS...");

        try {
            // Algoritmo matemático para promediar las matrices en caliente en el Frontend
            const aggregatedScores: Record<string, Record<string, number>> = {};

            currentDecision?.options.forEach(opt => {
                aggregatedScores[opt.id] = {};
                currentDecision.criteria.forEach(crit => {
                    let sum = 0;
                    voters.forEach(v => {
                        sum += v.matrix?.[opt.id]?.[crit.id] || 5; // 5 por defecto si falta
                    });
                    aggregatedScores[opt.id][crit.id] = sum / voters.length; // Promedio matemático
                });
            });

            // Enviamos la matriz consolidada al endpoint clásico de TOPSIS
            const response = await api.post(`/decisions/${id}/calculate`, {
                scores: aggregatedScores
            });

            // Notificamos a todos a través del socket que el cálculo terminó y les inyectamos el resultado
            if (stompClientRef.current) {
                stompClientRef.current.publish({
                    destination: `/app/decision/${id}/vote`,
                    body: JSON.stringify({
                        type: 'ROOM_CLOSED',
                        userName: currentUserName,
                        recommendation: response.data
                    })
                });
            }

        } catch (error) {
            console.error("Error en consolidación colaborativa:", error);
            toast.error("Error al procesar el modelo matemático grupal.", { id: toastId });
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6 px-4 transition-colors duration-200">
            {/* Encabezado de la Sala */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 transition-colors">
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Sala de Deliberación Grupal</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Dilema: <span className="font-bold text-indigo-600 dark:text-indigo-400">"{currentDecision?.title}"</span>
                    </p>
                </div>

                <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm py-2.5 px-4 rounded-xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-600"
                >
                    <Share2 className="w-4 h-4" /> Invitar Equipo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna Izquierda: Panel de Control del Votante */}
                <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm h-fit transition-colors">
                    <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
                        Tu Panel de Control
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        Evalúa mentalmente las opciones frente a los criterios y envía tus ponderaciones. El sistema promediará tus valores con los de tu equipo.
                    </p>

                    <button
                        onClick={handleSubmitMyVotes}
                        disabled={myVoteSubmitted || !isConnected}
                        className={`w-full flex justify-center items-center gap-2 font-bold py-3 px-4 rounded-xl transition-all ${myVoteSubmitted
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                            }`}
                    >
                        {myVoteSubmitted ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        {myVoteSubmitted ? 'Votos Enviados' : 'Enviar Mis Calificaciones'}
                    </button>
                </div>

                {/* Columna Derecha: Estado de la Mesa Directiva */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" /> Miembros en la Mesa
                        </h3>

                        <ul className="space-y-3">
                            {/* Mostramos siempre al usuario actual en la cabecera */}
                            <li className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 transition-colors animate-in fade-in duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                                        {currentUserName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        {currentUserName} (Tú)
                                        {isHost && <Crown className="w-4 h-4 text-amber-500" title="Anfitrión" />}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${myVoteSubmitted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                    {myVoteSubmitted ? 'Listo' : 'Pensando'}
                                </span>
                            </li>

                            {/* Listado dinámico vía WebSockets */}
                            {participants.filter(p => p.userName !== currentUserName).map((p, idx) => (
                                <li key={`participant-${idx}`} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 transition-colors animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                                            {p.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{p.userName}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${p.hasVoted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                        {p.hasVoted ? 'Listo' : 'Pensando'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Botón Maestro del Anfitrión */}
                    {isHost && (
                        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={handleProcessCollaborativeDecision}
                                disabled={isCalculating || participants.filter(p => p.hasVoted).length === 0}
                                className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-40"
                            >
                                {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5 text-amber-300" />}
                                Consolidar Votos y Calcular con TOPSIS
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};