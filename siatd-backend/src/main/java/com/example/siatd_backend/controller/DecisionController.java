package com.example.siatd_backend.controller;

import com.example.siatd_backend.dto.MatrixRequest;
import com.example.siatd_backend.dto.RecommendationResponse;
import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.Option;
import com.example.siatd_backend.model.User;
import com.example.siatd_backend.repository.UserRepository;
import com.example.siatd_backend.service.DecisionEngineService;
import com.example.siatd_backend.service.DecisionService;
import com.example.siatd_backend.service.GeminiAiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/decisions")
@CrossOrigin(origins = "http://localhost:5173")
public class DecisionController {

    private final DecisionService decisionService;
    private final GeminiAiService geminiAiService; // 🚨 El servicio de IA está inyectado
    private final DecisionEngineService decisionEngineService;
    private final UserRepository userRepository;

    public DecisionController(
            DecisionService decisionService,
            DecisionEngineService decisionEngineService,
            UserRepository userRepository,
            GeminiAiService geminiAiService) {
        this.decisionService = decisionService;
        this.decisionEngineService = decisionEngineService;
        this.userRepository = userRepository;
        this.geminiAiService = geminiAiService;
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
    public ResponseEntity<Option> addOption(
            @PathVariable UUID decisionId,
            @RequestBody Option option) {

        Option savedOption = decisionService.addOption(decisionId, option);
        return new ResponseEntity<>(savedOption, HttpStatus.CREATED);
    }

    @PostMapping("/{decisionId}/calculate")
    public ResponseEntity<RecommendationResponse> calculateDecision(
            @PathVariable UUID decisionId,
            @RequestBody MatrixRequest matrixRequest) {

        // 1. Ejecutar TOPSIS
        RecommendationResponse result
                = decisionEngineService.calculateBestOption(
                        decisionId,
                        matrixRequest
                );

        // 2. Obtener la decisión
        Decision decision = decisionService.getDecisionById(decisionId)
                .orElseThrow(()
                        -> new RuntimeException("Decisión no encontrada"));

        // 3. Obtener nombres de criterios para darle contexto a Gemini
        List<String> criteriaNames = decision.getCriteria().stream()
                .map(Criterion::getName)
                .toList();

        // 4. Generar justificación clásica
        String justificacionIA
                = geminiAiService.generateDecisionJustification(
                        decision.getTitle(),
                        result.getRecommendedOption().getName(),
                        result.getFinalScores()
                );

        // 5. Generar recomendaciones estratégicas avanzadas
        String recomendacionesEstrategicas
                = geminiAiService.generateStrategicRecommendations(
                        decision.getTitle(),
                        result.getRecommendedOption().getName(),
                        result.getFinalScores(),
                        criteriaNames
                );

        // 6. Guardar información en la decisión
        decision.setJustification(justificacionIA);

        // NUEVO CAMPO
        decision.setRecommendations(recomendacionesEstrategicas);

        decision.setEvaluationMatrix(
                convertMapKeysToStrings(
                        matrixRequest.getScores()
                )
        );

        decision.setRecommendedOption(
                result.getRecommendedOption()
        );

        decision.setFinalScores(
                result.getFinalScores()
        );

        // 7. Guardar en base de datos
        decisionService.updateDecision(decision);

        // 8. Enviar al frontend
        result.setJustification(justificacionIA);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Decision> getDecisionById(@PathVariable UUID id) {
        return decisionService.getDecisionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{decisionId}/criteria")
    public ResponseEntity<Criterion> addCriterion(
            @PathVariable UUID decisionId,
            @RequestBody Criterion criterion) {

        Criterion savedCriterion = decisionService.addCriterion(decisionId, criterion);
        return new ResponseEntity<>(savedCriterion, HttpStatus.CREATED);
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
}
