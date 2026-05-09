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
    private final DecisionEngineService decisionEngineService;
    private final UserRepository userRepository;

    public DecisionController(
            DecisionService decisionService,
            DecisionEngineService decisionEngineService,
            UserRepository userRepository) {
        this.decisionService = decisionService;
        this.decisionEngineService = decisionEngineService;
        this.userRepository = userRepository;
    }

    /**
     * CORRECCIÓN CRÍTICA: Obtiene todas las decisiones del usuario autenticado.
     * Este es el método que el Dashboard llama (GET /api/decisions).
     */
    @GetMapping
    public ResponseEntity<List<Decision>> getAllDecisions(Principal principal) {
        try {
            // Extraemos el email del token JWT a través del objeto Principal
            String email = principal.getName();
            // Retornamos solo las decisiones que pertenecen a este email
            List<Decision> userDecisions = decisionService.getAllDecisionsForUser(email);
            return ResponseEntity.ok(userDecisions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Crea una nueva decisión vinculándola automáticamente al usuario logueado.
     */
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

    // En tu DecisionController.java
    @PostMapping("/{decisionId}/calculate")
    public ResponseEntity<RecommendationResponse> calculateDecision(
            @PathVariable UUID decisionId,
            @RequestBody MatrixRequest matrixRequest) {

        // 1. Calculamos la mejor opción con el Motor TOPSIS
        RecommendationResponse result = decisionEngineService.calculateBestOption(decisionId, matrixRequest);

        // 2. Buscamos la decisión en la Base de Datos
        Decision decision = decisionService.getDecisionById(decisionId)
                .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

        // 3. 🚨 GUARDAMOS ABSOLUTAMENTE TODO EN LA BASE DE DATOS 🚨
        decision.setEvaluationMatrix(convertMapKeysToStrings(matrixRequest.getScores()));
        decision.setRecommendedOption(result.getRecommendedOption());
        decision.setJustification(result.getJustification());
        decision.setFinalScores(result.getFinalScores());

        // 4. Actualizamos la BD
        decisionService.updateDecision(decision);

        // 5. Retornamos la respuesta al Frontend
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
}
