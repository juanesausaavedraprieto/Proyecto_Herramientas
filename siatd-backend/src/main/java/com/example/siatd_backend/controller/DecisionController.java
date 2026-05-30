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

    // 🚨 EL MÉTODO CORREGIDO QUE CONECTA TOPSIS CON GEMINI 🚨
    @PostMapping("/{decisionId}/calculate")
    public ResponseEntity<RecommendationResponse> calculateDecision(
            @PathVariable UUID decisionId,
            @RequestBody MatrixRequest matrixRequest) {

        // 1. Calculamos la mejor opción con el Motor TOPSIS (Matemática pura)
        RecommendationResponse result = decisionEngineService.calculateBestOption(decisionId, matrixRequest);

        // 2. Buscamos la decisión en la Base de Datos
        Decision decision = decisionService.getDecisionById(decisionId)
                .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

        // 3. 🚨 LLAMAMOS A LA INTELIGENCIA ARTIFICIAL DE GOOGLE 🚨
        // Le pasamos el título del dilema, quién ganó, y los porcentajes
        String justificacionIA = geminiAiService.generateDecisionJustification(
                decision.getTitle(),
                result.getRecommendedOption().getName(),
                result.getFinalScores()
        );
        
        // 4. Reemplazamos la justificación estática de TOPSIS por la respuesta humana de Gemini
        result.setJustification(justificacionIA);

        // 5. Guardamos TODO en la Base de Datos
        decision.setEvaluationMatrix(convertMapKeysToStrings(matrixRequest.getScores()));
        decision.setRecommendedOption(result.getRecommendedOption());
        decision.setJustification(justificacionIA); // Guardamos la IA en PostgreSQL
        decision.setFinalScores(result.getFinalScores());

        decisionService.updateDecision(decision);

        // 6. Retornamos la respuesta al Frontend
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