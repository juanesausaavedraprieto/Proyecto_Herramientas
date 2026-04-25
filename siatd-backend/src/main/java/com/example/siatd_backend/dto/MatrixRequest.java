package com.example.siatd_backend.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class MatrixRequest {
    // Mapa: ID de la Opción -> (Mapa: ID del Criterio -> Puntaje)
    private Map<UUID, Map<UUID, Double>> scores;
}
