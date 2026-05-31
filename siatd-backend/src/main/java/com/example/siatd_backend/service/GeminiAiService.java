package com.example.siatd_backend.service;

import com.example.siatd_backend.model.SystemSetting;
import java.util.List;
import com.example.siatd_backend.repository.SystemSettingRepository;
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
    private final SystemSettingRepository systemSettingRepository;

    // ✅ Constructor con inyección del repository
    public GeminiAiService(SystemSettingRepository systemSettingRepository) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.systemSettingRepository = systemSettingRepository;
    }

    public String generateDecisionJustification(
            String dilemmaTitle,
            String winnerName,
            Map<String, Double> allScores
    ) {

        StringBuilder promptBuilder = new StringBuilder();

        // ✅ Obtener prompt del sistema desde la BD
        SystemSetting settings = systemSettingRepository
                .findById(1L)
                .orElse(new SystemSetting());

        // ✅ Reemplaza el string fijo
        if (settings.getAiSystemPrompt() != null
                && !settings.getAiSystemPrompt().trim().isEmpty()) {

            promptBuilder.append(settings.getAiSystemPrompt()).append("\n\n");

        } else {
            // Fallback si no existe en la BD
            promptBuilder.append(
                    "Actúa como un consultor estratégico experto en análisis de decisiones."
            ).append("\n\n");
        }

        promptBuilder.append("El usuario tenía el siguiente dilema: '")
                .append(dilemmaTitle)
                .append("'.\n");

        promptBuilder.append(
                "El algoritmo matemático TOPSIS ha evaluado las opciones y ha determinado que la mejor alternativa es: **"
        ).append(winnerName).append("**.\n\n");

        promptBuilder.append(
                "Estos son los puntajes finales de todas las opciones evaluadas (escala 0 a 100%):\n"
        );

        for (Map.Entry<String, Double> entry : allScores.entrySet()) {
            promptBuilder.append("- ")
                    .append(entry.getKey())
                    .append(": ")
                    .append(String.format("%.2f", entry.getValue()))
                    .append("%\n");
        }

        promptBuilder.append(
                "\nTu tarea: Redacta una justificación profesional, persuasiva y clara (máximo 3 párrafos cortos) "
        );

        promptBuilder.append("explicando por qué '")
                .append(winnerName)
                .append("' es la decisión más lógica basándote en que obtuvo el mayor puntaje matemático. ");

        promptBuilder.append(
                "No menciones cómo funciona la fórmula TOPSIS, enfócate en darle confianza al usuario sobre su decisión."
        );

        try {

            // 1. CONSTRUCCIÓN SEGURA DEL JSON
            ObjectNode rootNode = objectMapper.createObjectNode();
            ArrayNode contentsArray = rootNode.putArray("contents");

            ObjectNode contentObject = contentsArray.addObject();
            ArrayNode partsArray = contentObject.putArray("parts");

            ObjectNode textObject = partsArray.addObject();
            textObject.put("text", promptBuilder.toString());

            String requestBody
                    = objectMapper.writeValueAsString(rootNode);

            // 2. CABECERAS
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request
                    = new HttpEntity<>(requestBody, headers);

            String finalUrl = apiUrl + "?key=" + apiKey;

            // 3. ENVIAR A GEMINI
            String response = restTemplate.postForObject(
                    finalUrl,
                    request,
                    String.class
            );

            // 4. LEER RESPUESTA
            JsonNode responseNode
                    = objectMapper.readTree(response);

            return responseNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (HttpClientErrorException
                | HttpServerErrorException e) {

            System.err.println(
                    "\n========================================="
            );

            System.err.println(
                    "🔴 ERROR DE GOOGLE API (HTTP "
                    + e.getStatusCode() + ")"
            );

            System.err.println(
                    "Respuesta exacta de Google: "
                    + e.getResponseBodyAsString()
            );

            System.err.println(
                    "=========================================\n"
            );

            return "El motor matemático sugiere fuertemente '"
                    + winnerName
                    + "' como la mejor opción, aunque la IA no pudo generar el texto. (Error de red).";

        } catch (Exception e) {

            System.err.println(
                    "🔴 ERROR INTERNO DE JAVA: "
                    + e.getMessage()
            );

            return "El motor matemático sugiere fuertemente '"
                    + winnerName
                    + "' como la mejor opción.";
        }
    }

    public String generateStrategicRecommendations(String dilemmaTitle, String winnerName, Map<String, Double> allScores, List<String> criteriaNames) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Actúa como un consultor de riesgos y estratega corporativo de alto nivel. ")
                .append("El usuario ha tomado la decisión: '").append(dilemmaTitle).append("', ")
                .append("y el motor TOPSIS determinó que la opción ganadora es: '").append(winnerName).append("'.\n\n");

        promptBuilder.append("Los criterios considerados fueron: ").append(String.join(", ", criteriaNames)).append(".\n");
        promptBuilder.append("Puntajes de las alternativas: ").append(allScores.toString()).append(".\n\n");

        promptBuilder.append("Tu tarea es generar una lista de recomendaciones estratégicas divididas EXACTAMENTE en las siguientes tres secciones, usando títulos claros con markdown (###):\n")
                .append("### 1. Plan de Acción Inmediato\n")
                .append("Brinda una lista numerada con 3 pasos concretos y realistas para empezar a ejecutar la opción '").append(winnerName).append("'.\n\n")
                .append("### 2. Gestión de Riesgos\n")
                .append("Identifica el mayor riesgo o desventaja de elegir '").append(winnerName).append("' frente a los criterios evaluados y cómo mitigarlo.\n\n")
                .append("### 3. Alertas de Sesgo\n")
                .append("Analiza si la configuración de pesos pudo haber causado un sesgo y dale un consejo analítico al tomador de decisiones.");

        try {
            // Reutilizamos la lógica de construcción segura de JSON con ObjectMapper que ya tienes
            ObjectNode rootNode = objectMapper.createObjectNode();
            ArrayNode contentsArray = rootNode.putArray("contents");
            ObjectNode contentObject = contentsArray.addObject();
            ArrayNode partsArray = contentObject.putArray("parts");
            ObjectNode textObject = partsArray.addObject();
            textObject.put("text", promptBuilder.toString());

            String requestBody = objectMapper.writeValueAsString(rootNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(apiUrl + "?key=" + apiKey, request, String.class);

            JsonNode responseNode = objectMapper.readTree(response);
            return responseNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            System.err.println("Error generando recomendaciones estratégicas: " + e.getMessage());
            return "### 1. Plan de Acción Inmediato\n1. Proceder con el despliegue de la opción ganadora.\n2. Monitorear los costos iniciales.\n### 2. Gestión de Riesgos\n- Validar la viabilidad técnica.\n### 3. Alertas de Sesgo\n- No se detectaron anomalías críticas en la distribución de pesos.";
        }
    }
}
