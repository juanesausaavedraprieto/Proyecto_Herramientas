// src/types/index.ts

export type DecisionStatus = 'DRAFT' | 'ANALYZING' | 'COMPLETED';

// 1. 🚨 NUEVO: Definimos la estructura del Usuario que manda el backend
export interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
}

export interface Criterion {
    id: string;
    name: string;      // Ej: "Tiempo requerido", "Costo", "Impacto"
    weight: number;    // Peso del 0.1 al 1.0
    isPositive: boolean; // true = más es mejor (Ej: Impacto), false = menos es mejor (Ej: Costo)
}

export interface Option {
    id: string;
    name: string;      // Ej: "Estudiar Angular", "Dormir"
    scores: Record<string, number>; // Diccionario: { criterionId: valor }
}

export interface Decision {
    id?: string;
    title: string;
    criteria: Criterion[];
    options: Option[];
    user?: User | null;
    stressLevel?: number;
    urgencyScore?: number;
    evaluationMatrix?: Record<string, Record<string, number>>;
    recommendedOption?: any;
    justification?: string;
    finalScores?: Record<string, number>;
    feedbackScore?: number;
    feedbackNotes?: string;
}