package com.knowledgeguru.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgeguru.backend.model.KnowledgeGap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/** Equivalent of the Node `ai-tutor.service.js`. */
@Service
public class AiTutorService {

    private static final Logger log = LoggerFactory.getLogger(AiTutorService.class);

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Minimal in-memory session store (mirrors the Node in-memory Map; swap for Mongo-backed
    // sessions if you need multi-instance/durable chat history).
    private final Map<String, List<Map<String, Object>>> sessions = new ConcurrentHashMap<>();

    private static final String SYSTEM_PROMPT = """
            You are an intelligent AI Learning Assistant for Knowledge Guru, an adaptive learning platform.
            You help students understand their course material based on retrieved context from their uploaded resources.
            - Always ground your answers in the provided context when available
            - Cite sources when referencing specific content
            - Be encouraging and educational in tone
            - If a concept isn't in the context, say so and provide general knowledge
            - Keep responses concise but thorough
            - Format with markdown when helpful""";

    public Map<String, Object> sendMessage(String studentId, String sessionId, String message, String context) {
        String key = studentId + ":" + sessionId;
        List<Map<String, Object>> history = sessions.computeIfAbsent(key, k -> new ArrayList<>());

        String systemWithContext = context != null ? SYSTEM_PROMPT + "\n\n## Course Material Context:\n" + context : SYSTEM_PROMPT;

        history.add(Map.of("role", "user", "parts", List.of(Map.of("text", message))));
        List<Map<String, Object>> recentHistory = history.size() > 20 ? history.subList(history.size() - 20, history.size()) : history;

        String response;
        try {
            response = geminiClient.chat(recentHistory, systemWithContext);
        } catch (Exception e) {
            log.error("AI Tutor error:", e);
            response = "I encountered an issue processing your request. Please try again.";
        }

        history.add(Map.of("role", "model", "parts", List.of(Map.of("text", response))));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("response", response);
        result.put("sessionId", sessionId);
        result.put("citations", List.of());
        return result;
    }

    public String generateStudyPlan(String studentId, List<KnowledgeGap> gaps, Map<String, Object> preferences) {
        String gapsList = gaps.stream()
                .map(g -> "- " + g.getTopicId() + " (" + g.getSeverity() + " priority)")
                .collect(Collectors.joining("\n"));
        String type = preferences != null && preferences.get("type") != null ? preferences.get("type").toString() : "daily";
        String prompt = "Write a short, encouraging study plan summary for a student with these knowledge gaps:\n"
                + (gapsList.isBlank() ? "No major gaps detected — general revision." : gapsList)
                + "\n\nPlan type: " + type
                + "\n\nWrite 3-5 short sentences or bullet points in plain, friendly language — practical tips and what to focus on first. "
                + "Do NOT use JSON, code blocks, or markdown headers. Plain prose and simple \"-\" bullet points only.";
        String response = geminiClient.generateContent(prompt,
                "You are an encouraging, practical study coach. Reply in plain conversational text only — never JSON or code.");
        String cleaned = response.replaceAll("(?i)```[a-z]*\\n?|\\n?```", "").trim();
        if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
            try {
                Object parsed = objectMapper.readValue(cleaned, Object.class);
                if (parsed instanceof String s) cleaned = s;
                // else leave cleaned text as-is (best-effort defensive cleanup, matches Node fallback)
            } catch (Exception ignored) {
                // Not parseable JSON after all — use cleaned text as-is.
            }
        }
        return cleaned;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> generateFlashcards(String topicTitle, int count) {
        String prompt = "Generate " + count + " flashcards for the topic: \"" + topicTitle + "\"\n"
                + "Each flashcard should have a question and detailed answer.\n"
                + "Return as JSON array: [{\"question\": \"...\", \"answer\": \"...\", \"difficulty\": \"easy|medium|hard\"}]";
        String raw = geminiClient.generateContent(prompt, "You are an expert educator creating concise, effective study flashcards. Return only valid JSON.");
        try {
            String cleaned = raw.replaceAll("```json\\n?|\\n?```", "").trim();
            return objectMapper.readValue(cleaned, List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    public String generateNotes(String lessonContent) {
        String prompt = "Summarize this lesson content into clear study notes:\n\n" + lessonContent
                + "\n\nProvide: 1) Summary (2-3 sentences), 2) Key Concepts (bullet points), 3) Important Formulas/Definitions, 4) Revision Questions";
        return geminiClient.generateContent(prompt, "You are an expert educator. Create clear, concise study notes that aid retention.");
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> generateCourseDraft(String courseName, String targetAudience, int durationWeeks,
                                                    String learningObjectives, String level) {
        String prompt = "Design a complete week-by-week course structure for: \"" + courseName + "\".\n"
                + "Target audience: " + targetAudience + "\n"
                + "Duration: " + durationWeeks + " weeks\n"
                + "Level: " + level + "\n"
                + "Learning objectives: " + learningObjectives + "\n\n"
                + "Return ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:\n"
                + "{\n  \"title\": \"string\",\n  \"description\": \"2-4 sentence course description\",\n"
                + "  \"category\": \"short category label, e.g. 'Data Science'\",\n  \"weeks\": [\n"
                + "    {\n      \"title\": \"Week 1: string\",\n      \"topics\": [\n"
                + "        { \"title\": \"string\", \"difficulty\": \"easy|medium|hard\" }\n      ]\n    }\n  ]\n}\n"
                + "Produce exactly " + durationWeeks + " week entries, each with 2-5 topics.";
        String raw = geminiClient.generateContent(prompt, "You are an expert curriculum designer. Return only valid JSON matching the requested schema, nothing else.");
        String cleaned = extractJsonObject(raw);
        Map<String, Object> draft;
        try {
            draft = objectMapper.readValue(cleaned, Map.class);
        } catch (Exception e) {
            log.error("AI course draft JSON parse error: {} raw={}", e.getMessage(), raw);
            throw new RuntimeException("AI returned an unparseable course draft. Please try again.");
        }
        List<Map<String, Object>> weeks = (List<Map<String, Object>>) draft.get("weeks");
        if (weeks == null || weeks.isEmpty()) {
            throw new RuntimeException("AI course draft was missing week data. Please try again.");
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("title", draft.getOrDefault("title", courseName));
        result.put("description", draft.getOrDefault("description", ""));
        result.put("category", draft.getOrDefault("category", ""));
        result.put("level", level);
        List<Map<String, Object>> normWeeks = weeks.stream().map(w -> {
            Map<String, Object> wm = new LinkedHashMap<>();

            wm.put("title",
                    w.get("title") != null ? w.get("title") : "Untitled week");

            @SuppressWarnings("unchecked")
            List<Object> topics = w.get("topics") != null
                    ? (List<Object>) w.get("topics")
                    : Collections.emptyList();

            List<Map<String, Object>> normTopics = topics.stream().map(t -> {

                Map<String, Object> tm = new LinkedHashMap<>();

                if (t instanceof String s) {
                    tm.put("title", s);
                    tm.put("difficulty", "medium");

                } else if (t instanceof Map<?, ?>) {

                    @SuppressWarnings("unchecked")
                    Map<String, Object> tmap = (Map<String, Object>) t;

                    tm.put("title",
                            tmap.get("title") != null
                                    ? tmap.get("title")
                                    : "Untitled topic");

                    Object diff = tmap.get("difficulty");

                    tm.put("difficulty",
                            (diff instanceof String
                                    && List.of("easy", "medium", "hard").contains(diff))
                                    ? diff
                                    : "medium");
                }

                return tm;

            }).collect(Collectors.toList());

            wm.put("topics", normTopics);

            return wm;

        }).collect(Collectors.toList());
        result.put("weeks", normWeeks);
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> generateQuizQuestions(String subject, String topic, int questionCount, String difficulty, double marksPerQuestion) {
        String prompt = "Create " + questionCount + " multiple-choice quiz questions about \"" + topic + "\" in the subject \"" + subject + "\".\n"
                + "Difficulty: " + ("mixed".equals(difficulty) ? "a mix of easy, medium and hard" : difficulty) + "\n"
                + "Each question is worth " + marksPerQuestion + " marks.\n\n"
                + "Return ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:\n"
                + "{\n  \"questions\": [\n    {\n      \"text\": \"question text\",\n"
                + "      \"options\": [\"option A\", \"option B\", \"option C\", \"option D\"],\n"
                + "      \"correctAnswer\": \"the exact text of the correct option\",\n"
                + "      \"difficulty\": \"easy|medium|hard\",\n"
                + "      \"explanation\": \"1-2 sentence explanation of the correct answer\"\n    }\n  ]\n}\n"
                + "Produce exactly " + questionCount + " questions.";
        String raw = geminiClient.generateContent(prompt, "You are an expert quiz designer. Return only valid JSON matching the requested schema, nothing else.");
        String cleaned = extractJsonObject(raw);
        Map<String, Object> parsed;
        try {
            parsed = objectMapper.readValue(cleaned, Map.class);
        } catch (Exception e) {
            log.error("AI quiz JSON parse error: {} raw={}", e.getMessage(), raw);
            throw new RuntimeException("AI returned an unparseable quiz. Please try again.");
        }
        List<Map<String, Object>> questions = (List<Map<String, Object>>) parsed.get("questions");
        if (questions == null || questions.isEmpty()) {
            throw new RuntimeException("AI quiz response was missing question data. Please try again.");
        }
        return questions.stream().map(q -> {
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("type", "mcq");
            out.put("text", q.getOrDefault("text", "Untitled question"));
            out.put("options", q.getOrDefault("options", List.of()));
            out.put("correctAnswer", q.getOrDefault("correctAnswer", ""));
            Object diff = q.get("difficulty");
            out.put("difficulty", (diff instanceof String ds && List.of("easy", "medium", "hard").contains(ds)) ? ds : "medium");
            out.put("marks", marksPerQuestion);
            out.put("explanation", q.getOrDefault("explanation", ""));
            out.put("aiGenerated", true);
            return out;
        }).collect(Collectors.toList());
    }

    private String extractJsonObject(String raw) {
        String cleaned = raw.replaceAll("```json\\n?|\\n?```", "").trim();
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start != -1 && end != -1) cleaned = cleaned.substring(start, end + 1);
        return cleaned;
    }
    public AiTutorService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }
}
