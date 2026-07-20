package com.knowledgeguru.backend.ai;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.knowledgegaps.KnowledgeGapService;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiTutorService aiTutorService;
    private final AiUsageLogger aiUsageLogger;
    private final KnowledgeGapService knowledgeGapService;

    private void requireStudentOrTeacher(UserPrincipal user) {
        if (!"student".equals(user.getRole()) && !"teacher".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }
    private void requireTeacherOrAdmin(UserPrincipal user) {
        if (!"teacher".equals(user.getRole()) && !"admin".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }
    private void requireStudent(UserPrincipal user) {
        if (!"student".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    @PostMapping("/tutor/message")
    public Map<String, Object> tutorMessage(@AuthenticationPrincipal UserPrincipal user, @RequestBody Map<String, String> body) {
        requireStudentOrTeacher(user);
        String message = body.get("message");
        if (message == null || message.isBlank()) throw AppException.badRequest("Message is required");
        String sessionId = body.getOrDefault("sessionId", UUID.randomUUID().toString());
        try {
            Map<String, Object> result = aiTutorService.sendMessage(user.getId(), sessionId, message, null);
            aiUsageLogger.log(user.getId(), "tutor", "success");
            Map<String, Object> out = new java.util.LinkedHashMap<>(result);
            out.put("success", true);
            return out;
        } catch (Exception e) {
            aiUsageLogger.log(user.getId(), "tutor", "error");
            throw new AppException(e.getMessage(), 503);
        }
    }

    @PostMapping("/course/generate")
    public ApiResponse<Map<String, Object>> generateCourse(@AuthenticationPrincipal UserPrincipal user, @RequestBody Map<String, Object> body) {
        requireTeacherOrAdmin(user);
        String courseName = (String) body.get("courseName");
        if (courseName == null || courseName.isBlank()) throw AppException.badRequest("courseName is required");
        try {
            Map<String, Object> draft = aiTutorService.generateCourseDraft(
                    courseName,
                    (String) body.get("targetAudience"),
                    body.get("durationWeeks") != null ? ((Number) body.get("durationWeeks")).intValue() : 4,
                    (String) body.get("learningObjectives"),
                    (String) body.get("level"));
            aiUsageLogger.log(user.getId(), "course-gen", "success");
            return ApiResponse.ok(draft);
        } catch (Exception e) {
            aiUsageLogger.log(user.getId(), "course-gen", "error");
            throw new AppException(e.getMessage(), 503);
        }
    }

    @PostMapping("/quiz/generate")
    public ApiResponse<List<Map<String, Object>>> generateQuiz(@AuthenticationPrincipal UserPrincipal user, @RequestBody Map<String, Object> body) {
        requireTeacherOrAdmin(user);
        String subject = (String) body.get("subject");
        String topic = (String) body.get("topic");
        if (subject == null || subject.isBlank() || topic == null || topic.isBlank()) {
            throw AppException.badRequest("subject and topic are required");
        }
        try {
            var questions = aiTutorService.generateQuizQuestions(
                    subject, topic,
                    body.get("questionCount") != null ? ((Number) body.get("questionCount")).intValue() : 10,
                    (String) body.getOrDefault("difficulty", "mixed"),
                    body.get("marksPerQuestion") != null ? ((Number) body.get("marksPerQuestion")).doubleValue() : 1);
            aiUsageLogger.log(user.getId(), "quiz-gen", "success");
            return ApiResponse.ok(questions);
        } catch (Exception e) {
            aiUsageLogger.log(user.getId(), "quiz-gen", "error");
            throw new AppException(e.getMessage(), 503);
        }
    }

    @PostMapping("/flashcards/generate")
    public ApiResponse<List<Map<String, Object>>> generateFlashcards(@AuthenticationPrincipal UserPrincipal user, @RequestBody Map<String, Object> body) {
        requireStudent(user);
        String topicTitle = (String) body.get("topicTitle");
        if (topicTitle == null) throw AppException.badRequest("topicTitle is required");
        int count = body.get("count") != null ? ((Number) body.get("count")).intValue() : 10;
        try {
            var cards = aiTutorService.generateFlashcards(topicTitle, count);
            aiUsageLogger.log(user.getId(), "flashcards", "success");
            return ApiResponse.ok(cards);
        } catch (Exception e) {
            aiUsageLogger.log(user.getId(), "flashcards", "error");
            throw new AppException(e.getMessage(), 503);
        }
    }

    @PostMapping("/notes/generate")
    public ApiResponse<String> generateNotes(@AuthenticationPrincipal UserPrincipal user, @RequestBody Map<String, String> body) {
        requireStudent(user);
        String content = body.get("content");
        if (content == null) throw AppException.badRequest("content is required");
        try {
            String notes = aiTutorService.generateNotes(content);
            aiUsageLogger.log(user.getId(), "notes", "success");
            return ApiResponse.ok(notes);
        } catch (Exception e) {
            aiUsageLogger.log(user.getId(), "notes", "error");
            throw new AppException(e.getMessage(), 503);
        }
    }

    @PostMapping("/study-plan/generate")
    public ApiResponse<String> generateStudyPlan(@AuthenticationPrincipal UserPrincipal user, @RequestBody(required = false) Map<String, Object> body) {
        requireStudent(user);
        Map<String, Object> preferences = body != null ? (Map<String, Object>) body.getOrDefault("preferences", Map.of()) : Map.of();
        var gaps = knowledgeGapService.getStudentGaps(user.getId());
        try {
            String plan = aiTutorService.generateStudyPlan(user.getId(), gaps, preferences);
            aiUsageLogger.log(user.getId(), "study-plan", "success");
            return ApiResponse.ok(plan);
        } catch (Exception e) {
            aiUsageLogger.log(user.getId(), "study-plan", "error");
            throw new AppException(e.getMessage(), 503);
        }
    }
    public AiController(AiTutorService aiTutorService, AiUsageLogger aiUsageLogger, KnowledgeGapService knowledgeGapService) {
        this.aiTutorService = aiTutorService;
        this.aiUsageLogger = aiUsageLogger;
        this.knowledgeGapService = knowledgeGapService;
    }
}
