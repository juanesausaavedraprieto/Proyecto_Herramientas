package com.example.siatd_backend.service;

import com.example.siatd_backend.dto.MatrixRequest;
import com.example.siatd_backend.dto.RecommendationResponse;
import com.example.siatd_backend.exception.ResourceNotFoundException;
import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.DecisionStatus;
import com.example.siatd_backend.model.Option;
import com.example.siatd_backend.repository.DecisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class DecisionEngineService {

    private final DecisionRepository decisionRepository;

    public DecisionEngineService(DecisionRepository decisionRepository) {
        this.decisionRepository = decisionRepository;
    }

    @Transactional
    public RecommendationResponse calculateBestOption(UUID decisionId, MatrixRequest matrix) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new ResourceNotFoundException("La decisión con el ID especificado no existe en la base de datos."));

        Map<Option, Double> finalScores = new HashMap<>();

        // 1. Encontrar valores máximos y mínimos por cada criterio (para normalizar)
        Map<UUID, Double> maxValues = new HashMap<>();
        Map<UUID, Double> minValues = new HashMap<>();

        for (Criterion c : decision.getCriteria()) {
            double max = Double.MIN_VALUE;
            double min = Double.MAX_VALUE;

            for (Option o : decision.getOptions()) {
                // Sacamos el mapa de la opción de forma segura
                Map<UUID, Double> optionScores = matrix.getScores().get(o.getId());

                // Si el mapa es null (no vino en el JSON), usamos 0.0 por defecto
                double val = (optionScores != null) ? optionScores.getOrDefault(c.getId(), 0.0) : 0.0;

                if (val > max) {
                    max = val;
                }
                if (val < min) {
                    min = val;
                }
            }
            // Evitar división por cero si todos los puntajes son iguales
            if (max == min) {
                max += 0.01;
            }

            maxValues.put(c.getId(), max);
            minValues.put(c.getId(), min);
        }

        // 2. Calcular utilidad para cada opción
        Option bestOption = null;
        double highestScore = -1.0;

        for (Option option : decision.getOptions()) {
            double totalUtility = 0.0;

            for (Criterion c : decision.getCriteria()) {
                // Lectura segura
                Map<UUID, Double> optScores = matrix.getScores().get(option.getId());
                double rawValue = (optScores != null) ? optScores.getOrDefault(c.getId(), 0.0) : 0.0;

                double max = maxValues.get(c.getId());
                double min = minValues.get(c.getId());

                double normalizedValue;
                if (c.getIsPositive()) {
                    normalizedValue = (rawValue - min) / (max - min); // Beneficio
                } else {
                    normalizedValue = (max - rawValue) / (max - min); // Costo
                }

                totalUtility += normalizedValue * c.getWeight();
            }

            // Convertimos la utilidad a un porcentaje del 0 al 100 para que sea legible
            double percentageScore = Math.round((totalUtility / getTotalWeight(decision)) * 10000.0) / 100.0;
            finalScores.put(option, percentageScore);

            if (percentageScore > highestScore) {
                highestScore = percentageScore;
                bestOption = option;
            }
        }

        // 3. Actualizar la decisión en la BD
        decision.setStatus(DecisionStatus.COMPLETED);
        decisionRepository.save(decision);

        // 4. Preparar respuesta y justificación simple
        Map<String, Double> formattedScores = new HashMap<>();
        finalScores.forEach((opt, score) -> formattedScores.put(opt.getName(), score));

        String justification = String.format("Se recomienda '%s' con un puntaje de %s%% porque maximiza los beneficios y minimiza los costos según tus criterios ingresados.",
                bestOption.getName(), highestScore);

        return new RecommendationResponse(bestOption, formattedScores, justification);
    }

    private double getTotalWeight(Decision decision) {
        return decision.getCriteria().stream().mapToDouble(Criterion::getWeight).sum();
    }
}
