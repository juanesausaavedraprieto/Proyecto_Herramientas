package com.example.siatd_backend.dto;

import com.example.siatd_backend.model.Option;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
public class RecommendationResponse {
    private Option recommendedOption;
    private Map<String, Double> finalScores; // Nombre de la opción -> Puntaje final (0 a 100%)
    private String justification;
}