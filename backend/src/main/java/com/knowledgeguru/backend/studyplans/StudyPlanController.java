package com.knowledgeguru.backend.studyplans;

import com.knowledgeguru.backend.ai.AiTutorService;
import com.knowledgeguru.backend.ai.AiUsageLogger;
import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.knowledgegaps.KnowledgeGapService;
import com.knowledgeguru.backend.model.KnowledgeGap;
import com.knowledgeguru.backend.model.StudyPlan;
import com.knowledgeguru.backend.repository.StudyPlanRepository;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/** Equivalent of the Node `study-plans.routes.js`. */
@RestController
@RequestMapping("/api/v1/study-plans")
public class StudyPlanController {

    private static final Logger log = LoggerFactory.getLogger(StudyPlanController.class);

    private final StudyPlanRepository studyPlanRepository;
    private final KnowledgeGapService knowledgeGapService;
    private final AiTutorService aiTutorService;
    private final AiUsageLogger aiUsageLogger;

    private void requireStudent(UserPrincipal user) {
        if (!"student".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    @GetMapping
    public ApiResponse<List<StudyPlan>> list(@AuthenticationPrincipal UserPrincipal user, @RequestParam(defaultValue = "daily") String type) {
        requireStudent(user);
        return ApiResponse.ok(studyPlanRepository.findByStudentIdAndTypeAndStatusOrderByPeriodStartDesc(user.getId(), type, "active", PageRequest.of(0, 5)));
    }

    @PostMapping("/generate")
    public ApiResponse<StudyPlan> generate(@AuthenticationPrincipal UserPrincipal user, @RequestBody(required = false) Map<String, Object> body) {
        requireStudent(user);
        String type = body != null && body.get("type") != null ? (String) body.get("type") : "daily";
        @SuppressWarnings("unchecked")
        Map<String, Object> preferences = body != null ? (Map<String, Object>) body.getOrDefault("preferences", Map.of()) : Map.of();

        List<KnowledgeGap> gaps = knowledgeGapService.getStudentGaps(user.getId());

        Instant now = Instant.now();
        Instant end = switch (type) {
            case "weekly" -> now.plus(7, ChronoUnit.DAYS);
            case "monthly" -> now.plus(30, ChronoUnit.DAYS);
            default -> now.plus(1, ChronoUnit.DAYS);
        };
        int max = type.equals("daily") ? 3 : type.equals("weekly") ? 10 : 20;
        List<StudyPlan.Item> items = gaps.stream().limit(max).map(g -> {
            StudyPlan.Item item = new StudyPlan.Item();
            item.setTopicId(g.getTopicId());
            item.setTaskType("review");
            item.setEstimatedMinutes("high".equals(g.getSeverity()) ? 60 : "medium".equals(g.getSeverity()) ? 40 : 20);
            item.setCompleted(false);
            return item;
        }).toList();
        double totalHours = items.stream().mapToInt(StudyPlan.Item::getEstimatedMinutes).sum() / 60.0;

        String aiPlan;
        try {
            Map<String, Object> mergedPrefs = new java.util.HashMap<>(preferences);
            mergedPrefs.put("type", type);
            aiPlan = aiTutorService.generateStudyPlan(user.getId(), gaps, mergedPrefs);
            aiUsageLogger.log(user.getId(), "study-plan", "success");
        } catch (Exception e) {
            log.error("AI study plan narrative failed, using fallback text:", e);
            aiUsageLogger.log(user.getId(), "study-plan", "error");
            aiPlan = items.isEmpty()
                    ? "You're all caught up — no urgent gaps right now. Keep up the momentum with regular practice."
                    : "Focus on your " + items.size() + " highest-priority topics this " + (type.equals("daily") ? "day" : type.equals("weekly") ? "week" : "month")
                      + " — review each one and retake its quiz when you feel ready.";
        }

        StudyPlan plan = new StudyPlan();
        plan.setStudentId(user.getId());
        plan.setType(type);
        plan.setPeriodStart(now);
        plan.setPeriodEnd(end);
        plan.setItems(items);
        plan.setTotalEstimatedHours(totalHours);
        plan.setStatus("active");
        plan.setAiGenerated(aiPlan);
        return ApiResponse.ok(studyPlanRepository.save(plan));
    }

    @PatchMapping("/{id}/items/{itemId}/complete")
    public ApiResponse<StudyPlan> completeItem(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @PathVariable String itemId) {
        requireStudent(user);
        StudyPlan plan = studyPlanRepository.findByIdAndStudentId(id, user.getId()).orElseThrow(() -> AppException.notFound("Study plan not found"));
        plan.getItems().stream().filter(i -> itemId.equals(i.getTopicId())).findFirst().ifPresent(i -> i.setCompleted(true));
        boolean allDone = plan.getItems().stream().allMatch(StudyPlan.Item::isCompleted);
        if (allDone) plan.setStatus("completed");
        return ApiResponse.ok(studyPlanRepository.save(plan));
    }
    public StudyPlanController(StudyPlanRepository studyPlanRepository, KnowledgeGapService knowledgeGapService, AiTutorService aiTutorService, AiUsageLogger aiUsageLogger) {
        this.studyPlanRepository = studyPlanRepository;
        this.knowledgeGapService = knowledgeGapService;
        this.aiTutorService = aiTutorService;
        this.aiUsageLogger = aiUsageLogger;
    }
}
