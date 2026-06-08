package com.example.siatd_backend.service;

import com.example.siatd_backend.exception.MatrixAnomalyException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class AnomalyDetectorService {

    public void inspectMatrix(Map<String, Map<String, Double>> matrix) {
        if (matrix == null || matrix.isEmpty()) {
            throw new MatrixAnomalyException("La matriz de evaluación está vacía.");
        }

        Set<Double> uniqueScores = new HashSet<>();
        int totalScores = 0;

        // Recorremos todos los puntajes que envió el usuario
        for (Map<String, Double> criteriaScores : matrix.values()) {
            for (Double score : criteriaScores.values()) {
                uniqueScores.add(score);
                totalScores++;
            }
        }

        // 🚨 REGLA 1: Anomalía de Apatía (Todo tiene el mismo puntaje)
        if (uniqueScores.size() == 1 && totalScores > 1) {
            Double scoreUtilizado = uniqueScores.iterator().next();
            throw new MatrixAnomalyException(
                "Anomalía de Apatía: Le has asignado exactamente '" + scoreUtilizado + "' a todos los criterios. " +
                "TOPSIS necesita varianza para funcionar. Por favor, evalúa a conciencia."
            );
        }

        // 🚨 REGLA 2: Anomalía de Polarización Extrema (Solo usó 1 y 10)
        if (uniqueScores.size() == 2 && uniqueScores.contains(1.0) && uniqueScores.contains(10.0)) {
            throw new MatrixAnomalyException(
                "Sesgo Detectado: Estás polarizando la evaluación usando únicamente los extremos (1 y 10). " +
                "Intenta utilizar matices intermedios para una predicción más realista."
            );
        }
        
        // 🚨 REGLA 3: Votación Incompleta o Sospechosa
        if (totalScores < 2) {
             throw new MatrixAnomalyException("Faltan datos en la matriz para realizar un análisis estructurado.");
        }
        
        // Si pasa todas las validaciones, el método termina silenciosamente y deja que TOPSIS continúe.
    }
}