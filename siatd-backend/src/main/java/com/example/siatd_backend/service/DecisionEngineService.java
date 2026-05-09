package com.example.siatd_backend.service;

import com.example.siatd_backend.dto.MatrixRequest;
import com.example.siatd_backend.dto.RecommendationResponse;
import com.example.siatd_backend.exception.ResourceNotFoundException;
import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.Option;
import com.example.siatd_backend.repository.DecisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DecisionEngineService {

    private final DecisionRepository decisionRepository;

    public RecommendationResponse calculateBestOption(UUID decisionId, MatrixRequest matrixRequest) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Decisión no encontrada"));

        List<Option> options = decision.getOptions();
        List<Criterion> criteria = decision.getCriteria();
        Map<UUID, Map<UUID, Double>> scores = matrixRequest.getScores();

        if (options.isEmpty() || criteria.isEmpty()) {
            throw new IllegalStateException("Faltan opciones o criterios para calcular.");
        }

        // ==========================================
        // ALGORITMO TOPSIS (Nivel Experto)
        // ==========================================

        // PASO 1: Calcular los divisores para normalizar la matriz (Raíz cuadrada de la suma de los cuadrados)
        Map<UUID, Double> criteriaDivisors = new HashMap<>();
        for (Criterion c : criteria) {
            double sumSquares = 0.0;
            for (Option o : options) {
                double score = scores.getOrDefault(o.getId(), new HashMap<>()).getOrDefault(c.getId(), 0.0);
                sumSquares += Math.pow(score, 2);
            }
            criteriaDivisors.put(c.getId(), Math.sqrt(sumSquares));
        }

        // PASO 2 & 3: Normalizar y Ponderar la Matriz (Multiplicar por el peso del criterio)
        // Y PASO 4: Encontrar las Soluciones Ideales (Positiva V+ y Negativa V-)
        Map<UUID, Double> idealPositive = new HashMap<>();
        Map<UUID, Double> idealNegative = new HashMap<>();

        // Inicializamos con valores extremos
        for (Criterion c : criteria) {
            idealPositive.put(c.getId(), c.getIsPositive() ? Double.MIN_VALUE : Double.MAX_VALUE);
            idealNegative.put(c.getId(), c.getIsPositive() ? Double.MAX_VALUE : Double.MIN_VALUE);
        }

        Map<UUID, Map<UUID, Double>> weightedNormalizedMatrix = new HashMap<>();

        for (Option o : options) {
            Map<UUID, Double> optionScores = new HashMap<>();
            for (Criterion c : criteria) {
                double rawScore = scores.getOrDefault(o.getId(), new HashMap<>()).getOrDefault(c.getId(), 0.0);
                double divisor = criteriaDivisors.get(c.getId());
                
                // Si el divisor es 0, evitamos división por cero
                double normalizedScore = (divisor == 0) ? 0 : (rawScore / divisor);
                double weightedScore = normalizedScore * c.getWeight();
                
                optionScores.put(c.getId(), weightedScore);

                // Actualizar Ideales
                if (c.getIsPositive()) {
                    if (weightedScore > idealPositive.get(c.getId())) idealPositive.put(c.getId(), weightedScore);
                    if (weightedScore < idealNegative.get(c.getId())) idealNegative.put(c.getId(), weightedScore);
                } else { // Si es un costo (ej. Precio, Tiempo), lo ideal es lo MÍNIMO
                    if (weightedScore < idealPositive.get(c.getId())) idealPositive.put(c.getId(), weightedScore);
                    if (weightedScore > idealNegative.get(c.getId())) idealNegative.put(c.getId(), weightedScore);
                }
            }
            weightedNormalizedMatrix.put(o.getId(), optionScores);
        }

        // PASO 5: Calcular Distancias Euclidianas y Proximidad (C_i)
        Map<String, Double> finalScores = new HashMap<>();
        Option bestOption = null;
        double maxProximity = -1.0;

        for (Option o : options) {
            double distancePositive = 0.0;
            double distanceNegative = 0.0;

            for (Criterion c : criteria) {
                double value = weightedNormalizedMatrix.get(o.getId()).get(c.getId());
                distancePositive += Math.pow(value - idealPositive.get(c.getId()), 2);
                distanceNegative += Math.pow(value - idealNegative.get(c.getId()), 2);
            }

            distancePositive = Math.sqrt(distancePositive);
            distanceNegative = Math.sqrt(distanceNegative);

            // Proximidad a la solución ideal (Mientras más cerca a 1, mejor)
            double proximity = 0.0;
            if ((distancePositive + distanceNegative) != 0) {
                proximity = distanceNegative / (distancePositive + distanceNegative);
            }

            // Guardamos el score en formato Porcentaje (0 a 100) para que el Frontend lo grafique fácil
            double finalScorePercentage = proximity * 100.0;
            // Redondeamos a 2 decimales
            finalScorePercentage = Math.round(finalScorePercentage * 100.0) / 100.0;

            finalScores.put(o.getName(), finalScorePercentage);

            if (proximity > maxProximity) {
                maxProximity = proximity;
                bestOption = o;
            }
        }

        // PASO 6: Generar Respuesta
        RecommendationResponse response = new RecommendationResponse();
        response.setRecommendedOption(bestOption);
        response.setFinalScores(finalScores);
        
        if (bestOption != null) {
            response.setJustification(
                "Basado en el algoritmo TOPSIS de distancia euclidiana, la opción '" + bestOption.getName() + 
                "' es matemáticamente la alternativa óptima, con un índice de proximidad del " + 
                Math.round(maxProximity * 100.0) + "%, logrando el mejor equilibrio entre beneficios esperados y costos."
            );
        } else {
            response.setJustification("No se pudo determinar una opción óptima.");
        }

        return response;
    }
}