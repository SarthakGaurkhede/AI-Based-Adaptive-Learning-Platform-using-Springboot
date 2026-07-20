package com.knowledgeguru.backend.flashcards;

import com.knowledgeguru.backend.ai.AiTutorService;
import com.knowledgeguru.backend.ai.AiUsageLogger;
import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.Flashcard;
import com.knowledgeguru.backend.repository.FlashcardRepository;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Equivalent of the Node `flashcards.routes.js`. */
@RestController
@RequestMapping("/api/v1/flashcards")
public class FlashcardController {

    private final FlashcardRepository flashcardRepository;
    private final AiTutorService aiTutorService;
    private final AiUsageLogger aiUsageLogger;
    public FlashcardController(FlashcardRepository flashcardRepository, AiTutorService aiTutorService, AiUsageLogger aiUsageLogger) {
        this.flashcardRepository = flashcardRepository;
        this.aiTutorService = aiTutorService;
        this.aiUsageLogger = aiUsageLogger;
    }

    private void requireStudent(UserPrincipal user) {
        if (!"student".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    @GetMapping
    public ApiResponse<List<Flashcard>> list(@AuthenticationPrincipal UserPrincipal user,
                                              @RequestParam(required = false) String topicId,
                                              @RequestParam(required = false) String courseId,
                                              @RequestParam(required = false) String all) {
        requireStudent(user);
        var pageable = PageRequest.of(0, 50);
        List<Flashcard> cards;
        boolean includeAll = all != null;
        if (topicId != null) {
            cards = includeAll ? flashcardRepository.findByStudentIdAndTopicIdOrderByNextReviewAtAsc(user.getId(), topicId, pageable)
                    : flashcardRepository.findByStudentIdAndTopicIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(user.getId(), topicId, Instant.now(), pageable);
        } else if (courseId != null) {
            cards = includeAll ? flashcardRepository.findByStudentIdAndCourseIdOrderByNextReviewAtAsc(user.getId(), courseId, pageable)
                    : flashcardRepository.findByStudentIdAndCourseIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(user.getId(), courseId, Instant.now(), pageable);
        } else {
            cards = includeAll ? flashcardRepository.findByStudentIdOrderByNextReviewAtAsc(user.getId(), pageable)
                    : flashcardRepository.findByStudentIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(user.getId(), Instant.now(), pageable);
        }
        return ApiResponse.ok(cards);
    
    }

    @PostMapping("/generate")
    public ApiResponse<List<Flashcard>> generate(@AuthenticationPrincipal UserPrincipal user, @RequestBody Map<String, Object> body) {
        requireStudent(user);
        String topicId = (String) body.get("topicId");
        String topicTitle = (String) body.get("topicTitle");
        String courseId = (String) body.get("courseId");
        int count = body.get("count") != null ? ((Number) body.get("count")).intValue() : 10;
        if (topicTitle == null || courseId == null) throw AppException.badRequest("topicTitle and courseId are required");
        try {
            var rawCards = aiTutorService.generateFlashcards(topicTitle, count);
            Instant now = Instant.now();
            List<Flashcard> saved = rawCards.stream().map(c -> {
                Flashcard card = new Flashcard();
                card.setStudentId(user.getId());
                card.setCourseId(courseId);
                card.setTopicId(topicId != null ? topicId : courseId);
                card.setQuestion((String) c.get("question"));
                card.setAnswer((String) c.get("answer"));
                card.setDifficulty((String) c.getOrDefault("difficulty", "medium"));
                card.setAiGenerated(true);
                card.setNextReviewAt(now);
                return card;
            }).toList();
            saved = flashcardRepository.saveAll(saved);
            aiUsageLogger.log(user.getId(), "flashcards", "success");
            return ApiResponse.ok(saved);
        } catch (Exception e) {
            aiUsageLogger.log(user.getId(), "flashcards", "error");
            throw new AppException(e.getMessage(), 503);
        }
    }

    @PatchMapping("/{id}/review")
    public ApiResponse<Flashcard> review(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @RequestBody Map<String, Integer> body) {
        requireStudent(user);
        Flashcard card = flashcardRepository.findByIdAndStudentId(id, user.getId()).orElseThrow(() -> AppException.notFound("Flashcard not found"));
        int quality = body.getOrDefault("quality", 0);
        Map<Integer, Integer> intervals = Map.of(0, 1, 1, 2, 2, 4, 3, 7);
        int days = intervals.getOrDefault(quality, 1);
        card.setLastReviewedAt(Instant.now());
        card.setNextReviewAt(Instant.now().plus(days, java.time.temporal.ChronoUnit.DAYS));
        card.setReviewCount(card.getReviewCount() + 1);
        card.setMasteryLevel(Math.min(card.getMasteryLevel() + (quality >= 2 ? 1 : -1), 5));
        return ApiResponse.ok(flashcardRepository.save(card));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> delete(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        requireStudent(user);
        flashcardRepository.deleteByIdAndStudentId(id, user.getId());
        return ApiResponse.message("Flashcard deleted");
    }
}
