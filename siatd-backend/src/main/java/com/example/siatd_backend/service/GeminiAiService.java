package com.example.siatd_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GeminiAiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String generateDecisionJustification(String dilemmaTitle, String winnerName, Map<String, Double> allScores) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Actúa como un consultor estratégico experto en análisis de decisiones. ");
        promptBuilder.append("El usuario tenía el siguiente dilema: '").append(dilemmaTitle).append("'.\n");
        promptBuilder.append("El algoritmo matemático TOPSIS ha evaluado las opciones y ha determinado que la mejor alternativa es: **")
                .append(winnerName).append("**.\n\n");

        promptBuilder.append("Estos son los puntajes finales de todas las opciones evaluadas (escala 0 a 100%):\n");
        for (Map.Entry<String, Double> entry : allScores.entrySet()) {
            promptBuilder.append("- ").append(entry.getKey()).append(": ").append(String.format("%.2f", entry.getValue())).append("%\n");
        }

        promptBuilder.append("\nTu tarea: Redacta una justificación profesional, persuasiva y clara (máximo 3 párrafos cortos) ");
        promptBuilder.append("explicando por qué '").append(winnerName).append("' es la decisión más lógica basándote en que obtuvo el mayor puntaje matemático. ");
        promptBuilder.append("No menciones cómo funciona la fórmula TOPSIS, enfócate en darle confianza al usuario sobre su decisión.");

        try {
            // 1. CONSTRUCCIÓN 100% SEGURA DEL JSON
            ObjectNode rootNode = objectMapper.createObjectNode();
            ArrayNode contentsArray = rootNode.putArray("contents");
            ObjectNode contentObject = contentsArray.addObject();
            ArrayNode partsArray = contentObject.putArray("parts");
            ObjectNode textObject = partsArray.addObject();
            textObject.put("text", promptBuilder.toString());

            String requestBody = objectMapper.writeValueAsString(rootNode);

            // 2. CONFIGURAR CABECERAS
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            String finalUrl = apiUrl + "?key=" + apiKey;

            // 3. ENVIAR A GOOGLE
            String response = restTemplate.postForObject(finalUrl, request, String.class);

            // 4. LEER RESPUESTA
            JsonNode responseNode = objectMapper.readTree(response);
            return responseNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            // 🚨 AQUÍ ATRAPAMOS SI GOOGLE RECHAZA LA CLAVE O EL JSON 🚨
            System.err.println("\n=========================================");
            System.err.println("🔴 ERROR DE GOOGLE API (HTTP " + e.getStatusCode() + ")");
            System.err.println("Respuesta exacta de Google: " + e.getResponseBodyAsString());
            System.err.println("=========================================\n");

            return "El motor matemático sugiere fuertemente '" + winnerName + "' como la mejor opción, aunque la IA no pudo generar el texto. (Error de red).";
        } catch (Exception e) {
            System.err.println("🔴 ERROR INTERNO DE JAVA: " + e.getMessage());
            return "El motor matemático sugiere fuertemente '" + winnerName + "' como la mejor opción.";
        }
    }
}
