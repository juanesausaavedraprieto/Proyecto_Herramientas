package com.example.siatd_backend.service;

import com.example.siatd_backend.exception.ResourceNotFoundException;
import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.Option;
import com.example.siatd_backend.model.User;
import com.example.siatd_backend.repository.CriterionRepository;
import com.example.siatd_backend.repository.DecisionRepository;
import com.example.siatd_backend.repository.OptionRepository;
import com.example.siatd_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DecisionService {

    private final DecisionRepository decisionRepository;
    private final CriterionRepository criterionRepository;
    private final OptionRepository optionRepository;
    // 🚨 AÑADIDO: Necesitamos el repositorio de usuarios para vaciar el historial
    private final UserRepository userRepository;

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

    // 🚨 MÉTODO PARA ACTUALIZAR LA DECISIÓN (Guarda la Matriz JSON) 🚨
    @Transactional
    public Decision updateDecision(Decision decision) {
        return decisionRepository.save(decision);
    }

    @Transactional
    public Criterion addCriterion(UUID decisionId, Criterion criterion) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Decisión no encontrada con ID: " + decisionId));

        criterion.setDecision(decision);
        return criterionRepository.save(criterion);
    }

    @Transactional
    public Option addOption(UUID decisionId, Option option) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Decisión no encontrada con ID: " + decisionId));

        option.setDecision(decision);
        return optionRepository.save(option);
    }

    @Transactional(readOnly = true)
    public List<Decision> getAllDecisionsForUser(String email) {
        return decisionRepository.findByUser_Email(email);
    }

    @Transactional(readOnly = true)
    public Optional<Decision> getDecisionById(UUID id) {
        return decisionRepository.findById(id);
    }

    // 🚨 MÉTODO PARA ELIMINAR UNA DECISIÓN INDIVIDUAL 🚨
    @Transactional
    public void deleteDecision(UUID id) {
        if (!decisionRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: Decisión no encontrada.");
        }
        decisionRepository.deleteById(id);
    }

    // 🚨 NUEVO MÉTODO PARA VACIAR TODO EL HISTORIAL DEL USUARIO 🚨
    @Transactional
    public void deleteAllDecisionsForUser(String email) {
        // 1. Verificamos que el usuario realmente exista
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado para vaciar historial."));

        // 2. Buscamos todas las decisiones que le pertenecen a este usuario
        List<Decision> userDecisions = decisionRepository.findByUser_Email(email);

        // 3. Eliminamos la lista completa en bloque
        if (!userDecisions.isEmpty()) {
            decisionRepository.deleteAll(userDecisions);
        }
    }

}
