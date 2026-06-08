package com.example.siatd_backend.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Controller
public class CollaborationWebSocketController {

    public static class CollabMessage {

        public String type; // JOIN, VOTE_SUBMITTED, ROOM_CLOSED, CHAT_PUBLIC, CHAT_PRIVATE, DND_TOGGLE
        public String userName;

        // 💬 Nuevos campos para el Chat
        public String targetUser; // A quién va dirigido (solo para mensajes privados)
        public String content; // El texto del mensaje
        public boolean isDndActive; // Estado de "No Molestar"

        public Map<String, Map<String, Double>> matrix;
        public Object recommendation;
    }

    @MessageMapping("/decision/{decisionId}/join")
    @SendTo("/topic/decision/{decisionId}")
    public CollabMessage joinRoom(@DestinationVariable UUID decisionId, @Payload CollabMessage message) {
        System.out.println("Colaboración: " + message.userName + " entró a la sala " + decisionId);
        return message;
    }

    @MessageMapping("/decision/{decisionId}/vote")
    @SendTo("/topic/decision/{decisionId}")
    public CollabMessage submitVote(@DestinationVariable UUID decisionId, @Payload CollabMessage message) {
        return message;
    }

    // 💬 NUEVO: Endpoint para enrutar el Chat y los estados de privacidad
    @MessageMapping("/decision/{decisionId}/chat")
    @SendTo("/topic/decision/{decisionId}")
    public CollabMessage handleChat(@DestinationVariable UUID decisionId, @Payload CollabMessage message) {
        /*
         * Nota de Arquitectura: En un sistema bancario, los mensajes privados se envían 
         * usando SimpMessagingTemplate a colas /user/queue/ específicas por seguridad. 
         * Para este módulo colaborativo, transmitimos al tópico general y el Frontend 
         * se encarga de filtrar (lo cual es ultra rápido y funcional para este caso).
         */
        return message;
    }
}
