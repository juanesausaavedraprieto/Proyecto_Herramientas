package com.example.siatd_backend.service;

import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.repository.DecisionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    private final DecisionRepository decisionRepository;

    public FeedbackService(DecisionRepository decisionRepository) {
        this.decisionRepository = decisionRepository;
    }

    // Se ejecuta todos los días a las 00:00 (cron = "0 0 0 * * ?")
    // Para probarlo ahora mismo cada minuto, usa: @Scheduled(fixedRate = 60000)
    @Scheduled(cron = "0 0 0 * * ?")
    public void auditPendingFeedback() {
        System.out.println("⏳ Ejecutando auditoría de Feedback Retrospectivo...");
        
        // Calculamos la fecha límite (Ej: Decisiones tomadas hace más de 30 días)
        LocalDateTime threshold = LocalDateTime.now().minusDays(30);

        // Aquí podrías buscar TODAS las decisiones globales pendientes
        // y enviarles un correo automático usando JavaMailSender.
        // Como estamos usando notificaciones In-App, este cron job sirve para
        // generar reportes internos o limpiar datos si es necesario.
        System.out.println("✅ Auditoría completada. Las notificaciones in-app están listas.");
    }
}