package com.example.siatd_backend.controller;

import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
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

    public DecisionController(DecisionService decisionService) {
        this.decisionService = decisionService;
    }

    // Endpoint para guardar una nueva decisión
    @PostMapping
    public ResponseEntity<Decision> createDecision(@RequestBody Decision decision) {
        Decision savedDecision = decisionService.createDecision(decision);
        return new ResponseEntity<>(savedDecision, HttpStatus.CREATED);
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
