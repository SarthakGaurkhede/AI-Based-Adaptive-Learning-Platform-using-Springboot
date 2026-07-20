package com.knowledgeguru.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.knowledgeguru.backend.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

/** Equivalent of the Node `gemini.client.js` — the only place the Gemini API key is used. */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private static final Set<Integer> RETRYABLE_STATUSES = Set.of(429, 503);
    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    private final WebClient webClient;
    private final AppProperties appProperties;

    public String generateContent(String prompt, String systemInstruction) {
        return generateContent(prompt, systemInstruction, 0);
    }

    private String generateContent(String prompt, String systemInstruction, int attempt) {
        Map<String, Object> body = new LinkedHashMap<>();
        if (systemInstruction != null) {
            body.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        }
        body.put("contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))));
        body.put("generationConfig", Map.of("maxOutputTokens", 8124, "temperature", 0.7));
        try {
            JsonNode data = call(body);
            return extractText(data);
        } catch (WebClientResponseException e) {
            if (RETRYABLE_STATUSES.contains(e.getStatusCode().value()) && attempt < 2) {
                sleep(500L * (attempt + 1) * (attempt + 1));
                return generateContent(prompt, systemInstruction, attempt + 1);
            }
            throw friendlyError(e);
        }
    }

    public String chat(List<Map<String, Object>> messages, String systemInstruction) {
        return chat(messages, systemInstruction, 0);
    }

    private String chat(List<Map<String, Object>> messages, String systemInstruction, int attempt) {
        Map<String, Object> body = new LinkedHashMap<>();
        if (systemInstruction != null) {
            body.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        }
        body.put("contents", messages);
        body.put("generationConfig", Map.of("maxOutputTokens", 2048, "temperature", 0.7));
        try {
            JsonNode data = call(body);
            return extractText(data);
        } catch (WebClientResponseException e) {
            if (RETRYABLE_STATUSES.contains(e.getStatusCode().value()) && attempt < 2) {
                sleep(500L * (attempt + 1) * (attempt + 1));
                return chat(messages, systemInstruction, attempt + 1);
            }
            throw friendlyError(e);
        }
    }

    private JsonNode call(Map<String, Object> body) {
        return webClient.post()
                .uri(BASE_URL + "/" + appProperties.getGemini().getModel() + ":generateContent?key=" + appProperties.getGemini().getApiKey())
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    private String extractText(JsonNode data) {
        JsonNode candidates = data.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            return candidates.get(0).path("content").path("parts").path(0).path("text").asText("");
        }
        return "";
    }

    private RuntimeException friendlyError(WebClientResponseException e) {
        log.error("Gemini API error: {}", e.getResponseBodyAsString());
        String message = RETRYABLE_STATUSES.contains(e.getStatusCode().value())
                ? "The AI service is temporarily busy. Please try again in a moment."
                : "Gemini API error: " + e.getStatusCode().value();
        return new RuntimeException(message);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }
    public GeminiClient(WebClient webClient, AppProperties appProperties) {
        this.webClient = webClient;
        this.appProperties = appProperties;
    }
}
