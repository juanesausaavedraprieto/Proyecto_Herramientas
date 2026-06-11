export const calculateLocalTopsis = (
    matrix: Record<string, Record<string, number>>,
    criteria: { id: string; weight: number; isPositive: boolean }[],
    options: { id: string; name: string }[]
): Record<string, number> => {
    if (!matrix || !criteria.length || !options.length) return {};

    // 1. Calcular la suma de cuadrados por cada criterio (Para normalizar)
    const sumOfSquares: Record<string, number> = {};
    criteria.forEach(c => {
        let sum = 0;
        options.forEach(o => {
            const val = matrix[o.id]?.[c.id] || 0;
            sum += val * val;
        });
        sumOfSquares[c.id] = Math.sqrt(sum);
    });

    // 2. Matriz Normalizada Ponderada
    const weightedMatrix: Record<string, Record<string, number>> = {};
    options.forEach(o => {
        weightedMatrix[o.id] = {};
        criteria.forEach(c => {
            const val = matrix[o.id]?.[c.id] || 0;
            const denom = sumOfSquares[c.id] || 1; // Evitar división por cero
            weightedMatrix[o.id][c.id] = (val / denom) * c.weight;
        });
    });

    // 3. Encontrar Solución Ideal Positiva (V+) y Negativa (V-)
    const idealBest: Record<string, number> = {};
    const idealWorst: Record<string, number> = {};

    criteria.forEach(c => {
        let max = -Infinity;
        let min = Infinity;
        options.forEach(o => {
            const val = weightedMatrix[o.id][c.id];
            if (val > max) max = val;
            if (val < min) min = val;
        });
        idealBest[c.id] = c.isPositive ? max : min;
        idealWorst[c.id] = c.isPositive ? min : max;
    });

    // 4. Calcular distancias euclidianas y Coeficiente de Proximidad (C)
    const results: Record<string, number> = {};
    options.forEach(o => {
        let distBestSq = 0;
        let distWorstSq = 0;
        criteria.forEach(c => {
            const val = weightedMatrix[o.id][c.id];
            distBestSq += Math.pow(val - idealBest[c.id], 2);
            distWorstSq += Math.pow(val - idealWorst[c.id], 2);
        });
        const distBest = Math.sqrt(distBestSq);
        const distWorst = Math.sqrt(distWorstSq);

        const closeness = distWorst / (distBest + distWorst) || 0;
        
        // Escalar de 0 a 100 para la gráfica
        results[o.name] = Number((closeness * 100).toFixed(2));
    });

    return results;
};