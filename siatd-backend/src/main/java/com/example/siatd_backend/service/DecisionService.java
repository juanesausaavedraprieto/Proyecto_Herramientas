package com.example.siatd_backend.service;

import com.example.siatd_backend.exception.ResourceNotFoundException;
import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.Option;
import com.example.siatd_backend.repository.CriterionRepository;
import com.example.siatd_backend.repository.DecisionRepository;
import com.example.siatd_backend.repository.OptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor // Genera el constructor con los parámetros final automáticamente
public class DecisionService {

    private final DecisionRepository decisionRepository;
    private final CriterionRepository criterionRepository;
    private final OptionRepository optionRepository;

    /**
     * Guarda una decisión completa (incluyendo criterios y opciones si vienen en el JSON).
     */
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

    /**
     * Agrega un criterio a una decisión existente.
     */
    @Transactional
    public Criterion addCriterion(UUID decisionId, Criterion criterion) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Decisión no encontrada con ID: " + decisionId));

        criterion.setDecision(decision);
        return criterionRepository.save(criterion);
    }

    /**
     * Agrega una opción a una decisión existente.
     */
    @Transactional
    public Option addOption(UUID decisionId, Option option) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Decisión no encontrada con ID: " + decisionId));

        option.setDecision(decision);
        return optionRepository.save(option);
    }

    /**
     * Recupera el historial filtrado por el email del usuario logueado.
     */
    @Transactional(readOnly = true)
    public List<Decision> getAllDecisionsForUser(String email) {
        // Importante: El método en el Repository debe ser findByUser_Email
        return decisionRepository.findByUser_Email(email);
    }

    /**
     * Busca una decisión específica por su ID.
     */
    @Transactional(readOnly = true)
    public Optional<Decision> getDecisionById(UUID id) {
        return decisionRepository.findById(id);
    }

    /**
     * Método opcional para eliminar (por si te lo piden en la ronda de preguntas).
     */
    @Transactional
    public void deleteDecision(UUID id) {
        if (!decisionRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: Decisión no encontrada.");
        }
        decisionRepository.deleteById(id);
    }
}