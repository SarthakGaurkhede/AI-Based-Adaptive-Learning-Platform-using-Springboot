package com.knowledgeguru.backend.recommendations;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.Recommendation;
import com.knowledgeguru.backend.repository.RecommendationRepository;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

    private final RecommendationRepository recommendationRepository;
    private final RecommendationService recommendationService;

    private void requireStudent(UserPrincipal user) {
        if (!"student".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    @GetMapping
    public ApiResponse<List<Recommendation>> list(@AuthenticationPrincipal UserPrincipal user) {
        requireStudent(user);
        return ApiResponse.ok(recommendationRepository.findByStudentIdAndDismissedFalseOrderByPriorityScoreDesc(
                user.getId(), PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "priorityScore"))));
    }

    @PostMapping("/generate")
    public ApiResponse<List<Recommendation>> generate(@AuthenticationPrincipal UserPrincipal user) {
        requireStudent(user);
        return ApiResponse.ok(recommendationService.generateForStudent(user.getId()));
    }

    @PostMapping("/{id}/dismiss")
    public ApiResponse<Recommendation> dismiss(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        requireStudent(user);
        Recommendation rec = recommendationRepository.findByIdAndStudentId(id, user.getId())
                .orElseThrow(() -> AppException.notFound("Recommendation not found"));
        rec.setDismissed(true);
        return ApiResponse.ok(recommendationRepository.save(rec));
    }
    public RecommendationController(RecommendationRepository recommendationRepository, RecommendationService recommendationService) {
        this.recommendationRepository = recommendationRepository;
        this.recommendationService = recommendationService;
    }
}
