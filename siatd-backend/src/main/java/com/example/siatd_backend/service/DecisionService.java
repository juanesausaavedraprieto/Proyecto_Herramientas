package com.example.siatd_backend.service;

import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.Option;
import com.example.siatd_backend.repository.CriterionRepository;
import com.example.siatd_backend.repository.DecisionRepository;
import com.example.siatd_backend.repository.OptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DecisionService {

    private final DecisionRepository decisionRepository;
    private final CriterionRepository criterionRepository; // Agregamos este repositorio
    private final OptionRepository optionRepository; // 1. Nuevo repositorio

    // 2. Actualizamos el constructor
    public DecisionService(DecisionRepository decisionRepository,
            CriterionRepository criterionRepository,
            OptionRepository optionRepository) {
        this.decisionRepository = decisionRepository;
        this.criterionRepository = criterionRepository;
        this.optionRepository = optionRepository;
    }

    @Transactional
    public Decision createDecision(Decision decision) {
        if (decision.getCriteria() != null) {
            decision.getCriteria().forEach(c -> c.setDecision(decision));
        }
        if (decision.getOptions() != null) {
            decision.getOptions().forEach(o -> o.setDecision(decision));
        }
        return decisionRepository.save(decision);
    }

    // --- NUEVO MÉTODO ---
    @Transactional
    public Criterion addCriterion(UUID decisionId, Criterion criterion) {
        // 1. Buscamos la decisión en la BD
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

        // 2. Vinculamos el criterio a la decisión
        criterion.setDecision(decision);

        // 3. Guardamos el criterio (gracias a @ManyToOne esto actualizará la llave foránea)
        return criterionRepository.save(criterion);
    }

    // 3. NUEVO MÉTODO PARA OPCIONES
    @Transactional
    public Option addOption(UUID decisionId, Option option) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new RuntimeException("Decisión no encontrada"));

        option.setDecision(decision);
        return optionRepository.save(option);
    }

    public List<Decision> getAllDecisions() {
        return decisionRepository.findAll();
    }

    public Optional<Decision> getDecisionById(UUID id) {
        return decisionRepository.findById(id);
    }
}
