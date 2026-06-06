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

    // Clase interna para mapear los mensajes que viajan por el Socket
    public static class CollabMessage {
        public String type; // JOIN, VOTE_SUBMITTED, ROOM_CLOSED
        public String userName;
        public Map<String, Map<String, Double>> matrix; // Los puntajes que envía el invitado
    }

    /**
     * Cuando un usuario de React envía un mensaje a "/app/decision/{id}/join",
     * este método lo intercepta y lo retransmite a todos los suscritos en "/topic/decision/{id}"
     */
    @MessageMapping("/decision/{decisionId}/join")
    @SendTo("/topic/decision/{decisionId}")
    public CollabMessage joinRoom(@DestinationVariable UUID decisionId, @Payload CollabMessage message) {
        // Registramos en la consola del backend quién entró a qué sala
        System.out.println("Colaboración: " + message.userName + " entró a la sala " + decisionId);
        return message; // Retransmite el mensaje a todos en la sala
    }

    /**
     * Cuando un invitado termina su matriz y la envía
     */
    @MessageMapping("/decision/{decisionId}/vote")
    @SendTo("/topic/decision/{decisionId}")
    public CollabMessage submitVote(@DestinationVariable UUID decisionId, @Payload CollabMessage message) {
        System.out.println("Voto recibido de " + message.userName + " en sala " + decisionId);
        // Aquí retransmitimos que este usuario ya votó, para que el Admin vea una "Palomita Verde" en React
        return message; 
    }
}