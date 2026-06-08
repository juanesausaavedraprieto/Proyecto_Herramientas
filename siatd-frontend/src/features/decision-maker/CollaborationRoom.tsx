// src/features/decision-maker/CollaborationRoom.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDecisionStore } from '../../store/useDecisionStore';
import { api } from '../../api/axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Users, Loader2, Sparkles, CheckCircle2, Share2, Crown, Trophy, MessageSquare, Send, BellOff, Lock, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
    userName: string;
    hasVoted: boolean;
    dndActive?: boolean;
    matrix?: Record<string, Record<string, number>>;
}

interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    type: 'PUBLIC' | 'PRIVATE' | 'SYSTEM';
    targetUser?: string;
    timestamp: Date;
}

export const CollaborationRoom = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentDecision, setDecision, setRecommendation } = useDecisionStore();

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [myVoteSubmitted, setMyVoteSubmitted] = useState(false);

    // Matriz local para que el usuario vote
    const [localScores, setLocalScores] = useState<Record<string, Record<string, number>>>({});
    const [isAiLoading, setIsAiLoading] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatTarget, setChatTarget] = useState('ALL');
    const [myDndActive, setMyDndActive] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const stompClientRef = useRef<Client | null>(null);
    const currentUserName = localStorage.getItem('userName') || 'Usuario Invitado';
    const currentUserEmail = localStorage.getItem('userEmail') || '';

    const isHost = currentDecision?.user?.email === currentUserEmail || currentDecision?.user === null;

    // 1. Cargar el dilema si el usuario es un invitado que acaba de entrar por URL
    useEffect(() => {
        if (!currentDecision && id) {
            api.get(`/decisions/${id}`)
                .then(res => setDecision(res.data))
                .catch(() => toast.error("Error al cargar la información del dilema."));
        }
    }, [id, currentDecision, setDecision]);

    // Inicializar matriz local en 5
    useEffect(() => {
        if (currentDecision) {
            const initialScores: Record<string, Record<string, number>> = {};
            currentDecision.options.forEach(opt => {
                initialScores[opt.id] = {};
                currentDecision.criteria.forEach(crit => {
                    initialScores[opt.id][crit.id] = 5;
                });
            });
            setLocalScores(initialScores);
        }
    }, [currentDecision]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!id) return;

        const socket = new SockJS('http://localhost:8080/ws-collab');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        // 🛠️ Función auxiliar para generar IDs únicos y evitar el warning de React
        const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

        client.onConnect = () => {
            setIsConnected(true);
            stompClientRef.current = client;

            client.subscribe(`/topic/decision/${id}`, (payload) => {
                const message = JSON.parse(payload.body);

                if (message.type === 'JOIN') {
                    setParticipants(prev => {
                        if (prev.some(p => p.userName === message.userName)) return prev;
                        setMessages(m => [...m, { id: generateId(), sender: 'Sistema', content: `${message.userName} se unió.`, type: 'SYSTEM', timestamp: new Date() }]);
                        return [...prev, { userName: message.userName, hasVoted: false, dndActive: message.isDndActive }];
                    });
                }

                if (message.type === 'VOTE_SUBMITTED') {
                    setParticipants(prev => prev.map(p => p.userName === message.userName ? { ...p, hasVoted: true, matrix: message.matrix } : p));
                    toast.success(`¡${message.userName} envió sus calificaciones!`);
                }

                if (message.type === 'ROOM_CLOSED') {
                    toast.success("El anfitrión ha consolidado los resultados.");
                    if (message.recommendation) {
                        setRecommendation(message.recommendation);
                        navigate('/results');
                    }
                }

                if (message.type === 'DND_TOGGLE') {
                    setParticipants(prev => prev.map(p => p.userName === message.userName ? { ...p, dndActive: message.isDndActive } : p));
                }

                if (message.type === 'CHAT_PUBLIC') {
                    setMessages(m => [...m, { id: generateId(), sender: message.userName, content: message.content, type: 'PUBLIC', timestamp: new Date() }]);
                }

                if (message.type === 'CHAT_PRIVATE') {
                    if (message.targetUser === currentUserName && !myDndActive) {
                        setMessages(m => [...m, { id: generateId(), sender: message.userName, content: message.content, type: 'PRIVATE', targetUser: message.targetUser, timestamp: new Date() }]);
                        toast("💬 Nuevo mensaje privado", { description: `De: ${message.userName}` });
                    } else if (message.userName === currentUserName) {
                        setMessages(m => [...m, { id: generateId(), sender: message.userName, content: message.content, type: 'PRIVATE', targetUser: message.targetUser, timestamp: new Date() }]);
                    }
                }
            });

            client.publish({
                destination: `/app/decision/${id}/join`,
                body: JSON.stringify({ type: 'JOIN', userName: currentUserName, isDndActive: myDndActive })
            });
        };

        client.activate();
        return () => { if (client.active) client.deactivate(); };
    }, [id, myDndActive, currentUserName, navigate, setRecommendation]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/collab/${id}`);
        toast.success("Enlace de invitación copiado.");
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !isConnected || !stompClientRef.current) return;

        if (chatTarget !== 'ALL') {
            const targetPerson = participants.find(p => p.userName === chatTarget);
            if (targetPerson?.dndActive) {
                toast.error(`${chatTarget} no acepta mensajes privados en este momento.`);
                return;
            }
        }

        stompClientRef.current.publish({
            destination: `/app/decision/${id}/chat`,
            body: JSON.stringify({
                type: chatTarget === 'ALL' ? 'CHAT_PUBLIC' : 'CHAT_PRIVATE',
                userName: currentUserName,
                targetUser: chatTarget,
                content: chatInput.trim()
            })
        });
        setChatInput('');
    };

    const toggleDnd = () => {
        const newState = !myDndActive;
        setMyDndActive(newState);
        if (stompClientRef.current && isConnected) {
            stompClientRef.current.publish({
                destination: `/app/decision/${id}/chat`,
                body: JSON.stringify({ type: 'DND_TOGGLE', userName: currentUserName, isDndActive: newState })
            });
        }
        toast.info(newState ? "Privacidad activada." : "Disponible para mensajes privados.");
    };

    // 🎯 Manejar cambios en la matriz visual
    const handleScoreChange = (optionId: string, criterionId: string, value: number) => {
        const safeValue = Math.max(1, Math.min(10, value));
        setLocalScores(prev => ({
            ...prev,
            [optionId]: {
                ...prev[optionId],
                [criterionId]: safeValue
            }
        }));
    };

    // 🪄 Ayuda de IA individual para el invitado
    const handleAiHelp = async () => {
        if (!currentDecision) return;
        setIsAiLoading(true);
        toast.info("La IA está analizando para ayudarte a votar...", { duration: 3000 });
        try {
            const response = await api.post(`/decisions/${currentDecision.id}/auto-evaluate`);
            const aiEvaluations: any = response.data;
            // Parseo seguro (omito lógica compleja por brevedad, asumo que ya lo limpiamos en backend)
            let parsedData = typeof aiEvaluations === 'string' ? JSON.parse(aiEvaluations) : aiEvaluations;
            if (!Array.isArray(parsedData)) {
                const hidden = Object.values(parsedData).find(v => Array.isArray(v));
                parsedData = hidden || [parsedData];
            }

            const newScores = { ...localScores };
            parsedData.forEach((evalData: any) => {
                const opt = currentDecision.options.find(o => o.name.toLowerCase() === evalData.opcion?.toLowerCase());
                const crit = currentDecision.criteria.find(c => c.name.toLowerCase() === evalData.criterio?.toLowerCase());
                if (opt && crit) newScores[opt.id][crit.id] = Number(evalData.puntaje);
            });
            setLocalScores(newScores);
            toast.success("¡Matriz llenada por IA! Revisa antes de enviar.");
        } catch (e) {
            toast.error("La IA falló. Intenta llenarlo manualmente.");
        } finally {
            setIsAiLoading(false);
        }
    };

    // 🗳️ Enviar Voto Real
    const handleSubmitMyVotes = () => {
        if (!stompClientRef.current || !isConnected) return;
        stompClientRef.current.publish({
            destination: `/app/decision/${id}/vote`,
            body: JSON.stringify({ type: 'VOTE_SUBMITTED', userName: currentUserName, matrix: localScores })
        });
        setMyVoteSubmitted(true);
    };

    // 👑 Promediar y Calcular TOPSIS (Solo Anfitrión)
    const handleProcessCollaborativeDecision = async () => {
        const voters = participants.filter(p => p.hasVoted);
        if (voters.length === 0) { toast.warning("Faltan votos."); return; }
        setIsCalculating(true);
        try {
            const aggregatedScores: Record<string, Record<string, number>> = {};
            currentDecision?.options.forEach(opt => {
                aggregatedScores[opt.id] = {};
                currentDecision.criteria.forEach(crit => {
                    let sum = 0; voters.forEach(v => { sum += v.matrix?.[opt.id]?.[crit.id] || 5; });
                    aggregatedScores[opt.id][crit.id] = sum / voters.length;
                });
            });
            const response = await api.post(`/decisions/${id}/calculate`, { scores: aggregatedScores });
            stompClientRef.current?.publish({
                destination: `/app/decision/${id}/vote`,
                body: JSON.stringify({ type: 'ROOM_CLOSED', userName: currentUserName, recommendation: response.data })
            });
        } catch (error) { toast.error("Error al procesar el modelo matemático."); } finally { setIsCalculating(false); }
    };

    if (!currentDecision) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

    return (
        <div className="max-w-7xl mx-auto mt-6 px-4 transition-colors duration-200">
            {/* Encabezado */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 transition-colors">
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Sala de Deliberación</h2>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">Dilema: <span className="font-bold text-indigo-600">"{currentDecision.title}"</span></p>
                </div>
                <div className="flex gap-3">
                    <button onClick={toggleDnd} className={`flex items-center gap-2 font-bold text-sm py-2 px-4 rounded-xl transition-all border ${myDndActive ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        <BellOff className="w-4 h-4" /> {myDndActive ? 'Mensajes Bloqueados' : 'Recibiendo Mensajes'}
                    </button>
                    <button onClick={handleCopyLink} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 font-bold text-sm py-2 px-4 rounded-xl">
                        <Share2 className="w-4 h-4" /> Invitar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* 1. Panel Central: Matriz de Evaluación */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm h-fit overflow-x-auto">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Calculator className="w-5 h-5 text-indigo-500" /> Tu Evaluación</h3>
                            <button onClick={handleAiHelp} disabled={isAiLoading || myVoteSubmitted} className="text-xs bg-indigo-100 text-indigo-600 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50">
                                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Ayuda IA
                            </button>
                        </div>

                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    <th className="p-2 font-semibold text-slate-600 dark:text-slate-300">Opción \ Criterio</th>
                                    {currentDecision.criteria.map(c => (
                                        <th key={c.id} className="p-2 text-center font-medium text-slate-500">{c.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentDecision.options.map(o => (
                                    <tr key={o.id} className="border-t border-slate-50 dark:border-slate-700/50">
                                        <td className="p-2 font-medium text-slate-700 dark:text-slate-200">{o.name}</td>
                                        {currentDecision.criteria.map(c => (
                                            <td key={c.id} className="p-2 text-center">
                                                <input
                                                    type="number" min="1" max="10"
                                                    value={localScores[o.id]?.[c.id] || 5}
                                                    onChange={(e) => handleScoreChange(o.id, c.id, Number(e.target.value))}
                                                    disabled={myVoteSubmitted}
                                                    className="w-16 text-center border border-slate-200 dark:border-slate-600 rounded-lg p-1 bg-slate-50 dark:bg-slate-900 disabled:opacity-50"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button onClick={handleSubmitMyVotes} disabled={myVoteSubmitted || !isConnected} className="w-full mt-6 flex justify-center items-center gap-2 font-bold py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50">
                            {myVoteSubmitted ? <CheckCircle2 className="w-5 h-5" /> : 'Enviar Mis Calificaciones'}
                        </button>
                    </div>

                    {isHost && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                            <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">Panel del Anfitrión</h3>
                            <button onClick={handleProcessCollaborativeDecision} disabled={isCalculating || participants.filter(p => p.hasVoted).length === 0} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2">
                                {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5 text-amber-300" />}
                                Consolidar Votos y Calcular
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. Miembros y Chat (Columna Lateral) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-3 mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Mesa Directiva</h3>
                        <ul className="space-y-2">
                            <li className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                                <span className="font-bold text-sm flex items-center gap-1">{currentUserName} (Tú) {isHost && <Crown className="w-3 h-3 text-amber-500" />}</span>
                                <span className={`text-[10px] uppercase font-bold ${myVoteSubmitted ? 'text-emerald-600' : 'text-amber-500'}`}>{myVoteSubmitted ? 'Listo' : 'Pensando'}</span>
                            </li>
                            {participants.filter(p => p.userName !== currentUserName).map((p, idx) => (
                                <li key={idx} className="flex justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <span className="font-medium text-sm flex items-center gap-2">{p.userName} {p.dndActive && <Lock className="w-3 h-3 text-rose-500" />}</span>
                                    <span className={`text-[10px] uppercase font-bold ${p.hasVoted ? 'text-emerald-600' : 'text-amber-500'}`}>{p.hasVoted ? 'Listo' : 'Pensando'}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Chat */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col flex-1 h-[400px]">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/20">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.type === 'SYSTEM' ? 'items-center' : msg.sender === currentUserName ? 'items-end' : 'items-start'}`}>
                                    {msg.type === 'SYSTEM' ? <span className="text-[10px] text-slate-400 font-bold uppercase">{msg.content}</span> : (
                                        <div className={`max-w-[80%] rounded-xl px-3 py-2 ${msg.type === 'PRIVATE' ? 'bg-purple-100 text-purple-800' : msg.sender === currentUserName ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                                            {msg.sender !== currentUserName && <span className="block text-[9px] font-bold opacity-70">{msg.sender}</span>}
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-3xl flex gap-2">
                            <select value={chatTarget} onChange={(e) => setChatTarget(e.target.value)} className="bg-slate-100 text-slate-700 text-xs font-bold rounded-lg px-2 outline-none w-24">
                                <option value="ALL">Todos</option>
                                {participants.filter(p => p.userName !== currentUserName).map(p => <option key={p.userName} value={p.userName} disabled={p.dndActive}>{p.userName}</option>)}
                            </select>
                            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Mensaje..." className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 outline-none" />
                            <button type="submit" disabled={!chatInput.trim()} className="bg-indigo-600 text-white p-2 rounded-lg"><Send className="w-4 h-4" /></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};