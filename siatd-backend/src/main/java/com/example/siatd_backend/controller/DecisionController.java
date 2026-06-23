package com.example.siatd_backend.controller;

import com.example.siatd_backend.dto.MatrixRequest;
import com.example.siatd_backend.dto.RecommendationResponse;
import com.example.siatd_backend.exception.MatrixAnomalyException;
import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.Option;
import com.example.siatd_backend.model.User;
import com.example.siatd_backend.repository.UserRepository;
import com.example.siatd_backend.service.AnomalyDetectorService;
import com.example.siatd_backend.service.DecisionEngineService;
import com.example.siatd_backend.service.DecisionService;
import com.example.siatd_backend.service.GeminiAiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/decisions")
@CrossOrigin(origins = "http://localhost:5173")
public class DecisionController {

    private final DecisionService decisionService;
    private final GeminiAiService geminiAiService;
    private final AnomalyDetectorService anomalyDetectorService;
    private final DecisionEngineService decisionEngineService;
    private final UserRepository userRepository;

    public DecisionController(
            DecisionService decisionService,
            DecisionEngineService decisionEngineService,
            UserRepository userRepository,
            GeminiAiService geminiAiService,
            AnomalyDetectorService anomalyDetectorService) {
        this.decisionService = decisionService;
        this.decisionEngineService = decisionEngineService;
        this.userRepository = userRepository;
        this.geminiAiService = geminiAiService;
        this.anomalyDetectorService = anomalyDetectorService;
    }

    @GetMapping
    public ResponseEntity<List<Decision>> getAllDecisions(Principal principal) {
        try {
            String email = principal.getName();
            List<Decision> userDecisions = decisionService.getAllDecisionsForUser(email);
            return ResponseEntity.ok(userDecisions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<Decision> createDecision(@RequestBody Decision decision, Principal principal) {
        try {
            String email = principal.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            decision.setUser(user);
            Decision savedDecision = decisionService.createDecision(decision);
            return new ResponseEntity<>(savedDecision, HttpStatus.CREATED);

        } catch (Exception e) {
            System.err.println("Error al crear decisión: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{decisionId}/options")
    public ResponseEntity<Option> addOption(@PathVariable UUID decisionId, @RequestBody Option option) {
        Option savedOption = decisionService.addOption(decisionId, option);
        return new ResponseEntity<>(savedOption, HttpStatus.CREATED);
    }

    @PostMapping("/{decisionId}/criteria")
    public ResponseEntity<Criterion> addCriterion(@PathVariable UUID decisionId, @RequestBody Criterion criterion) {
        Criterion savedCriterion = decisionService.addCriterion(decisionId, criterion);
        return new ResponseEntity<>(savedCriterion, HttpStatus.CREATED);
    }

    @PostMapping("/{decisionId}/auto-evaluate")
    public ResponseEntity<?> autoEvaluateMatrix(@PathVariable UUID decisionId) {
        try {
            Decision decision = decisionService.getDecisionById(decisionId)
                    .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

            String aiJsonString = geminiAiService.autoEvaluateMatrix(decision);
            ObjectMapper mapper = new ObjectMapper();

            java.util.List<java.util.Map<String, Object>> evaluationList = mapper.readValue(
                    aiJsonString,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {
            }
            );

            return ResponseEntity.ok(evaluationList);

        } catch (Exception e) {
            System.err.println("Error en autoevaluación: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "La IA no pudo procesar la matriz correctamente."));
        }
    }

    @PostMapping("/{decisionId}/calculate")
    public ResponseEntity<?> calculateDecision(
            @PathVariable UUID decisionId,
            @RequestBody MatrixRequest matrixRequest) {

        try {
            // 1. Transformamos los UUIDs a Strings usando tu propio método para que el Guardia lo entienda
            Map<String, Map<String, Double>> stringMatrix = convertMapKeysToStrings(matrixRequest.getScores());

            // 2. EL GUARDIA DE SEGURIDAD: Inspecciona la matriz
            anomalyDetectorService.inspectMatrix(stringMatrix);

            // 3. Si no hay anomalías, procesamos TOPSIS de manera normal
            RecommendationResponse result = decisionEngineService.calculateBestOption(decisionId, matrixRequest);

            Decision decision = decisionService.getDecisionById(decisionId)
                    .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

            List<String> criteriaNames = decision.getCriteria().stream().map(Criterion::getName).toList();

            // 4. Generamos los textos con Gemini
            String justificacionIA = geminiAiService.generateDecisionJustification(
                    decision.getTitle(), result.getRecommendedOption().getName(), result.getFinalScores());

            // ⏳ EL FIX: Pausamos el hilo por 2 segundos para evitar el Error 429 (Too Many Requests) de Google
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            String recomendacionesEstrategicas = geminiAiService.generateStrategicRecommendations(
                    decision.getTitle(), result.getRecommendedOption().getName(), result.getFinalScores(), criteriaNames);

            // 5. Guardamos en Base de Datos
            decision.setJustification(justificacionIA);
            decision.setRecommendations(recomendacionesEstrategicas);
            decision.setEvaluationMatrix(stringMatrix);
            decision.setRecommendedOption(result.getRecommendedOption());
            decision.setFinalScores(result.getFinalScores());

            decisionService.updateDecision(decision);

            result.setJustification(justificacionIA);

            // 🚨 EL FIX: Le pasamos las recomendaciones al DTO para que React las vea INSTANTÁNEAMENTE
            result.setRecommendations(recomendacionesEstrategicas);

            return ResponseEntity.ok(result);

        } catch (MatrixAnomalyException e) {
            // 🛑 Si el guardia detecta una anomalía, detenemos todo y devolvemos 400 Bad Request
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error grave en el cálculo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error interno al procesar la matriz."));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Decision> getDecisionById(@PathVariable UUID id) {
        return decisionService.getDecisionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private java.util.Map<String, java.util.Map<String, Double>> convertMapKeysToStrings(
            java.util.Map<UUID, java.util.Map<UUID, Double>> originalMap) {
        java.util.Map<String, java.util.Map<String, Double>> newMap = new java.util.HashMap<>();
        if (originalMap == null) {
            return newMap;
        }

        for (java.util.Map.Entry<UUID, java.util.Map<UUID, Double>> entry : originalMap.entrySet()) {
            java.util.Map<String, Double> innerMap = new java.util.HashMap<>();
            for (java.util.Map.Entry<UUID, Double> innerEntry : entry.getValue().entrySet()) {
                innerMap.put(innerEntry.getKey().toString(), innerEntry.getValue());
            }
            newMap.put(entry.getKey().toString(), innerMap);
        }
        return newMap;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDecision(@PathVariable UUID id) {
        decisionService.deleteDecision(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear-history")
    public ResponseEntity<Void> clearHistory(Principal principal) {
        String email = principal.getName();
        decisionService.deleteAllDecisionsForUser(email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{decisionId}/risks")
    public ResponseEntity<?> getEarlyRisks(@PathVariable UUID decisionId) {
        try {
            Decision decision = decisionService.getDecisionById(decisionId)
                    .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

            List<String> optionNames = decision.getOptions().stream().map(Option::getName).toList();

            // Llamamos a la IA
            String aiJsonString = geminiAiService.analyzeEarlyRisks(decision.getTitle(), optionNames);

            // Limpiamos el texto por si Gemini añade marcadores Markdown (```json ... ```)
            String cleanJson = aiJsonString.replace("```json", "").replace("```", "").trim();

            ObjectMapper mapper = new ObjectMapper();
            java.util.List<java.util.Map<String, String>> risksList = mapper.readValue(
                    cleanJson,
                    new com.fasterxml.jackson.core.type.TypeReference<>() {
            }
            );

            return ResponseEntity.ok(risksList);

        } catch (Exception e) {
            System.err.println("Error generando riesgos tempranos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "La IA no pudo procesar los riesgos preventivos."));
        }
    }

    // 🚨 NUEVO ENDPOINT: Para reintentar la IA si se atora con el texto por defecto
    @PostMapping("/{decisionId}/regenerate-recommendations")
    public ResponseEntity<?> regenerateRecommendations(@PathVariable UUID decisionId) {
        try {
            Decision decision = decisionService.getDecisionById(decisionId)
                    .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

            List<String> criteriaNames = decision.getCriteria().stream().map(Criterion::getName).toList();

            // Reintentamos la llamada a Gemini
            String nuevasRecomendaciones = geminiAiService.generateStrategicRecommendations(
                    decision.getTitle(), decision.getRecommendedOption().getName(), decision.getFinalScores(), criteriaNames);

            // Guardamos en la base de datos el nuevo resultado
            decision.setRecommendations(nuevasRecomendaciones);
            decisionService.updateDecision(decision);

            // Devolvemos el nuevo texto
            return ResponseEntity.ok(java.util.Map.of("recommendations", nuevasRecomendaciones));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "No se pudo regenerar. Intenta más tarde."));
        }
    }

    // 🚨 NUEVO ENDPOINT: Para regenerar la Justificación Principal (El cuadro azul)
    @PostMapping("/{decisionId}/regenerate-justification")
    public ResponseEntity<?> regenerateJustification(@PathVariable UUID decisionId) {
        try {
            Decision decision = decisionService.getDecisionById(decisionId)
                    .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

            // Volvemos a pedirle a Gemini la justificación
            String nuevaJustificacion = geminiAiService.generateDecisionJustification(
                    decision.getTitle(),
                    decision.getRecommendedOption().getName(),
                    decision.getFinalScores()
            );

            // Guardamos y actualizamos la base de datos
            decision.setJustification(nuevaJustificacion);
            decisionService.updateDecision(decision);

            return ResponseEntity.ok(java.util.Map.of("justification", nuevaJustificacion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "No se pudo regenerar. Intenta más tarde."));
        }
    }

    // 🚨 NUEVO: Obtener decisiones que requieren feedback (Para el Frontend)
    @GetMapping("/pending-feedback")
    public ResponseEntity<List<Decision>> getPendingFeedback(Principal principal) {
        String email = principal.getName();
        // 🛠️ TRUCO DE PRUEBA: Cambia "minusDays(30)" por "minusMinutes(1)" para probarlo de inmediato
        LocalDateTime threshold = LocalDateTime.now().minusDays(5);
        List<Decision> pending = decisionService.getDecisionRepository().findPendingFeedback(email, threshold);
        return ResponseEntity.ok(pending);
    }

    // 🚨 NUEVO: Guardar la calificación de estrellas
    @PostMapping("/{decisionId}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable UUID decisionId,
            @RequestBody Map<String, Object> payload) {
        try {
            Decision decision = decisionService.getDecisionById(decisionId)
                    .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

            Integer score = (Integer) payload.get("score");
            String notes = (String) payload.get("notes");

            decision.setFeedbackScore(score);
            decision.setFeedbackNotes(notes);
            decisionService.updateDecision(decision);

            return ResponseEntity.ok(Map.of("message", "Feedback guardado con éxito. ¡Gracias!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo guardar el feedback."));
        }
    }
}
