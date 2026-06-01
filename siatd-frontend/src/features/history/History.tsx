import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import type { Decision } from '../../types';
import { Calendar, ChevronRight, Search, Trash2, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const History = () => {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id?: string; count?: number }>({ show: false });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/decisions');
                setDecisions(response.data);
            } catch (error) {
                console.error('Error al cargar historial', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filtered = decisions.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleDeleteOne = (id: string | undefined) => {
        if (!id) return;
        setDeleteConfirm({ show: true, id, count: 1 });
    };

    const handleDeleteMultiple = () => {
        if (selected.size === 0) return;
        setDeleteConfirm({ show: true, count: selected.size });
    };

    const confirmDelete = () => {
        if (deleteConfirm.id) {
            // Eliminar una sola decisión
            const updatedDecisions = decisions.filter(d => d.id !== deleteConfirm.id);
            setDecisions(updatedDecisions);
            
            const allDecisions = JSON.parse(localStorage.getItem('mock_decisions') || '[]');
            const filtered = allDecisions.filter((d: any) => d.id !== deleteConfirm.id);
            localStorage.setItem('mock_decisions', JSON.stringify(filtered));
        } else {
            // Eliminar seleccionadas
            const updatedDecisions = decisions.filter(d => !selected.has(d.id));
            setDecisions(updatedDecisions);
            
            const allDecisions = JSON.parse(localStorage.getItem('mock_decisions') || '[]');
            const filtered = allDecisions.filter((d: any) => !selected.has(d.id));
            localStorage.setItem('mock_decisions', JSON.stringify(filtered));
            
            setSelected(new Set());
            setEditMode(false);
        }
        
        setDeleteConfirm({ show: false });
    };

    const handleSelectOne = (id: string | undefined) => {
        if (!id) return;
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const handleSelectAll = () => {
        if (selected.size === filtered.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map(d => d.id).filter(Boolean) as string[]));
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-8 p-4">
            {/* Encabezado */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Historial de Decisiones</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Revisa tus análisis pasados y el progreso de tus dilemas.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar decisión..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Barra de control - Modo edición */}
            {editMode && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={selected.size === filtered.length && filtered.length > 0}
                            onChange={handleSelectAll}
                            className="w-5 h-5 cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            {selected.size === 0 ? 'Seleccionar todos' : `${selected.size} seleccionado(s)`}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {selected.size > 0 && (
                            <button
                                onClick={handleDeleteMultiple}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar ({selected.size})
                            </button>
                        )}
                        <button
                            onClick={() => { setEditMode(false); setSelected(new Set()); }}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Botón Editar */}
            {!editMode && filtered.length > 0 && (
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar
                    </button>
                </div>
            )}

            {/* Modal de confirmación */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                Eliminar decisión{deleteConfirm.count && deleteConfirm.count > 1 ? 'es' : ''}
                            </h2>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {deleteConfirm.count === 1
                                ? '¿Estás seguro de que quieres eliminar esta decisión? No se puede deshacer.'
                                : `¿Estás seguro de que quieres eliminar ${deleteConfirm.count} decisiones? No se puede deshacer.`}
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false })}
                                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Listado */}
            {loading ? (
                <div className="flex justify-center p-20 animate-pulse text-slate-400">Cargando tu historia...</div>
            ) : (
                <div className="grid gap-4">
                    {filtered.slice().reverse().map((d) => {
                        const isCompleted = d.status === 'COMPLETED' || !!d.recommendedOption;
                        const isSelected = selected.has(d.id);

                        return (
                            <div
                                key={d.id}
                                className={`group bg-white dark:bg-slate-800 p-5 rounded-2xl border transition-all flex items-center justify-between ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                        : 'border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700'
                                }`}
                            >
                                {/* Checkbox (solo en modo edición) */}
                                {editMode && (
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleSelectOne(d.id)}
                                        className="w-5 h-5 mr-3 cursor-pointer accent-blue-600"
                                    />
                                )}

                                {/* Contenido clickeable */}
                                <div
                                    className="flex-1 flex items-center gap-5 cursor-pointer"
                                    onClick={() => !editMode && navigate(isCompleted ? `/results/${d.id}` : `/continue/${d.id}`)}
                                >
                                    <div className={`p-3 rounded-xl flex-shrink-0 ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{d.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                            <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</span>
                                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></span>
                                            <span>{d.criteria?.length || 0} Criterios</span>
                                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></span>
                                            <span>{d.options?.length || 0} Opciones</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Badge y acciones */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full whitespace-nowrap ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'}`}>
                                        {isCompleted ? 'Finalizado' : 'Borrador'}
                                    </span>

                                    {/* Botón de eliminar (visible en hover o en modo edición) */}
                                    {!editMode && (
                                        <button
                                            onClick={() => handleDeleteOne(d.id)}
                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Eliminar decisión"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}

                                    {/* Chevron (solo cuando no estamos en edición) */}
                                    {!editMode && !isSelected && (
                                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && !loading && (
                        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                            No se encontraron decisiones.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};