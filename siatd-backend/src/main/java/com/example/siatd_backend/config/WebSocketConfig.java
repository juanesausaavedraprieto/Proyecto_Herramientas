package com.example.siatd_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita un broker simple en memoria. React se suscribirá a "/topic/..."
        config.enableSimpleBroker("/topic");
        // Prefijo para los mensajes que React envíe hacia Spring Boot
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // El endpoint al que React se conectará inicialmente para abrir el túnel
        registry.addEndpoint("/ws-collab")
                .setAllowedOrigins("http://localhost:5173") // Tu puerto de React
                .withSockJS(); // Fallback por si el navegador bloquea WebSockets puros
    }
}