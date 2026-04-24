// src/types/index.ts

export type DecisionStatus = 'DRAFT' | 'ANALYZING' | 'COMPLETED';

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
    id: string;
    title: string;
    status: DecisionStatus;
    criteria: Criterion[];
    options: Option[];
    recommendedOptionId?: string; // Se llena cuando el motor calcula la mejor opción
}