// src/store/useDecisionStore.ts
import { create } from 'zustand';
import type { Decision, Criterion, Option } from '../types';

interface DecisionState {
    currentDecision: Decision | null;

    // Acción que recibe la decisión desde el backend
    setDecision: (decision: Decision) => void;

    addCriterion: (criterion: Omit<Criterion, 'id'>) => void;
    addOption: (option: Omit<Option, 'id'>) => void;
    updateScore: (optionId: string, criterionId: string, score: number) => void;
}

export const useDecisionStore = create<DecisionState>((set) => ({
    currentDecision: null,

    setDecision: (decision) => set({ currentDecision: decision }),

    addCriterion: (criterion) => set((state) => {
        if (!state.currentDecision) return state;
        return {
            currentDecision: {
                ...state.currentDecision,
                criteria: [
                    ...state.currentDecision.criteria,
                    { ...criterion, id: crypto.randomUUID() }
                ]
            }
        };
    }),

    addOption: (option) => set((state) => {
        if (!state.currentDecision) return state;
        return {
            currentDecision: {
                ...state.currentDecision,
                options: [
                    ...state.currentDecision.options,
                    { ...option, id: crypto.randomUUID() }
                ]
            }
        };
    }),

    updateScore: (optionId, criterionId, score) => set((state) => {
        if (!state.currentDecision) return state;

        // Buscamos la opción a actualizar
        const updatedOptions = state.currentDecision.options.map((opt) => {
            if (opt.id === optionId) {
                // NOTA: Asegúrate de que esta lógica coincida con la estructura exacta 
                // de cómo guardas los scores en tus tipos (ej. un array de scores o un objeto)
                const existingScores = (opt as any).scores || {};
                return {
                    ...opt,
                    scores: { ...existingScores, [criterionId]: score }
                };
            }
            return opt;
        });

        return {
            currentDecision: {
                ...state.currentDecision,
                options: updatedOptions as Option[]
            }
        };
    })
}));