package com.example.siatd_backend.service;

import com.example.siatd_backend.model.Criterion;
import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.model.Option;
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

    public GeminiAiService(SystemSettingRepository systemSettingRepository) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.systemSettingRepository = systemSettingRepository;
    }

    public String generateDecisionJustification(String dilemmaTitle, String winnerName, Map<String, Double> allScores) {
        StringBuilder promptBuilder = new StringBuilder();
        SystemSetting settings = systemSettingRepository.findById(1L).orElse(new SystemSetting());

        if (settings.getAiSystemPrompt() != null && !settings.getAiSystemPrompt().trim().isEmpty()) {
            promptBuilder.append(settings.getAiSystemPrompt()).append("\n\n");
        } else {
            promptBuilder.append("Actúa como un consultor estratégico experto en análisis de decisiones.\n\n");
        }

        promptBuilder.append("El usuario tenía el siguiente dilema: '").append(dilemmaTitle).append("'.\n");
        promptBuilder.append("El algoritmo matemático TOPSIS ha evaluado las opciones y ha determinado que la mejor alternativa es: **").append(winnerName).append("**.\n\n");
        promptBuilder.append("Estos son los puntajes finales de todas las opciones evaluadas (escala 0 a 100%):\n");

        for (Map.Entry<String, Double> entry : allScores.entrySet()) {
            promptBuilder.append("- ").append(entry.getKey()).append(": ").append(String.format("%.2f", entry.getValue())).append("%\n");
        }

        promptBuilder.append("\nTu tarea: Redacta una justificación profesional, persuasiva y clara (máximo 3 párrafos cortos) ");
        promptBuilder.append("explicando por qué '").append(winnerName).append("' es la decisión más lógica basándote en que obtuvo el mayor puntaje matemático. ");
        promptBuilder.append("No menciones cómo funciona la fórmula TOPSIS, enfócate en darle confianza al usuario sobre su decisión.");

        return executeGeminiRequest(promptBuilder.toString(), "El motor matemático sugiere fuertemente '" + winnerName + "' como la mejor opción.");
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

        String fallback = "### 1. Plan de Acción Inmediato\n1. Proceder con el despliegue.\n### 2. Gestión de Riesgos\n- Validar viabilidad técnica.\n### 3. Alertas de Sesgo\n- Revisar ponderaciones.";
        return executeGeminiRequest(promptBuilder.toString(), fallback);
    }

    public String autoEvaluateMatrix(Decision decision) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Actúa como un experto imparcial en toma de decisiones. ");
        promptBuilder.append("El usuario tiene el siguiente dilema: '").append(decision.getTitle()).append("'.\n\n");

        promptBuilder.append("Tu tarea es evaluar objetivamente del 1 al 10 cada opción frente a cada criterio.\n");
        promptBuilder.append("IMPORTANTE: Devuelve ÚNICAMENTE un arreglo JSON válido. Sin texto extra.\n");
        promptBuilder.append("El formato EXACTO que necesito es:\n");
        promptBuilder.append("[\n  {\n    \"opcion\": \"Nombre Opción\",\n    \"criterio\": \"Nombre Criterio\",\n    \"puntaje\": 8\n  }\n]\n\n");

        promptBuilder.append("Opciones a evaluar:\n");
        for (Option o : decision.getOptions()) {
            promptBuilder.append("- ").append(o.getName()).append("\n");
        }

        promptBuilder.append("\nCriterios de Evaluación:\n");
        for (Criterion c : decision.getCriteria()) {
            String tipo = c.getIsPositive() ? "Beneficio (10 es excelente)" : "Costo (10 es excelente/muy barato)";
            promptBuilder.append("- ").append(c.getName()).append(" | Tipo: ").append(tipo).append("\n");
        }

        String rawResponse = executeGeminiRequest(promptBuilder.toString(), "[]");
        return cleanJsonResponse(rawResponse);
    }

    // Método auxiliar privado para centralizar las llamadas a Gemini y evitar código repetido
    private String executeGeminiRequest(String promptText, String fallbackMessage) {
        try {
            ObjectNode rootNode = objectMapper.createObjectNode();
            ArrayNode contentsArray = rootNode.putArray("contents");
            ObjectNode contentObject = contentsArray.addObject();
            ArrayNode partsArray = contentObject.putArray("parts");
            ObjectNode textObject = partsArray.addObject();
            textObject.put("text", promptText);

            String requestBody = objectMapper.writeValueAsString(rootNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(apiUrl + "?key=" + apiKey, request, String.class);
            JsonNode responseNode = objectMapper.readTree(response);

            return responseNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("🔴 ERROR DE GOOGLE API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return fallbackMessage;
        } catch (Exception e) {
            System.err.println("🔴 ERROR INTERNO DE JAVA: " + e.getMessage());
            return fallbackMessage;
        }
    }

// 🛡️ MÉTODO BLINDADO: Extrae solo el JSON, ignorando texto charlatán de la IA
    private String cleanJsonResponse(String rawJson) {
        try {
            // Busca el primer '[' y el último ']'
            int startArray = rawJson.indexOf('[');
            int endArray = rawJson.lastIndexOf(']');

            // Busca el primer '{' y el último '}'
            int startObj = rawJson.indexOf('{');
            int endObj = rawJson.lastIndexOf('}');

            // Prioriza extraer un Array si existe
            if (startArray != -1 && endArray != -1 && (startObj == -1 || startArray <= startObj)) {
                return rawJson.substring(startArray, endArray + 1);
            }
            // Si la IA terqueó y devolvió un Objeto, extraemos el Objeto
            if (startObj != -1 && endObj != -1) {
                return rawJson.substring(startObj, endObj + 1);
            }

            return rawJson.trim();
        } catch (Exception e) {
            return "[]"; // Fallback seguro
        }
    }
}
