package com.example.siatd_backend.controller;

import com.example.siatd_backend.dto.MatrixRequest;
import com.example.siatd_backend.dto.RecommendationResponse;
import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.Option;
import com.example.siatd_backend.service.DecisionEngineService;
import com.example.siatd_backend.service.DecisionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/decisions")
@CrossOrigin(origins = "http://localhost:5173") // Permite peticiones desde tu frontend Vite
public class DecisionController {

    private final DecisionService decisionService;
    private final DecisionEngineService decisionEngineService;

    public DecisionController(DecisionService decisionService, DecisionEngineService decisionEngineService) {
        this.decisionService = decisionService;
        this.decisionEngineService = decisionEngineService;
    }

    // Endpoint para guardar una nueva decisión
    @PostMapping
    public ResponseEntity<Decision> createDecision(@RequestBody Decision decision) {
        Decision savedDecision = decisionService.createDecision(decision);
        return new ResponseEntity<>(savedDecision, HttpStatus.CREATED);
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

        RecommendationResponse result = decisionEngineService.calculateBestOption(decisionId, matrixRequest);
        return ResponseEntity.ok(result);
    }

    // Endpoint para obtener todas las decisiones (para el Historial)
    @GetMapping
    public ResponseEntity<List<Decision>> getAllDecisions() {
        return ResponseEntity.ok(decisionService.getAllDecisions());
    }

    // Endpoint para obtener una decisión específica
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
}
