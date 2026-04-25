// src/store/useDecisionStore.ts
import { create } from 'zustand';
import type { Decision, Criterion, Option } from '../types';

export interface Recommendation {
    recommendedOption: Option;
    finalScores: Record<string, number>;
    justification: string;
}

interface DecisionState {
    currentDecision: Decision | null;
    recommendation: Recommendation | null;
    // Acción que recibe la decisión desde el backend
    setDecision: (decision: Decision) => void;
    setRecommendation: (rec: Recommendation) => void;
    // Actualizado: ahora reciben el objeto completo (incluyendo el ID de PostgreSQL)
    addCriterion: (criterion: Criterion) => void;
    addOption: (option: Option) => void;
    updateScore: (optionId: string, criterionId: string, score: number) => void;
}

export const useDecisionStore = create<DecisionState>((set) => ({
    currentDecision: null,
    recommendation: null,

    setDecision: (decision) => set({ currentDecision: decision }),

    setRecommendation: (rec) => set({ recommendation: rec }),

    addCriterion: (criterion) => set((state) => {
        if (!state.currentDecision) return state;
        // Ya no usamos crypto.randomUUID(). Confiamos en el ID que viene de PostgreSQL
        return {
            currentDecision: {
                ...state.currentDecision,
                criteria: [...state.currentDecision.criteria, criterion as Criterion]
            }
        };
    }),

    addOption: (option) => set((state) => {
        if (!state.currentDecision) return state;
        // Ya no usamos crypto.randomUUID().
        return {
            currentDecision: {
                ...state.currentDecision,
                options: [...state.currentDecision.options, option as Option]
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