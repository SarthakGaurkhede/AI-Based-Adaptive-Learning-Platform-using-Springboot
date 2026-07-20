package com.knowledgeguru.backend.knowledgegaps;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.gamification.XpService;
import com.knowledgeguru.backend.model.KnowledgeGap;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/knowledge-gaps")
public class KnowledgeGapController {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeGapController.class);

    private final KnowledgeGapService knowledgeGapService;
    private final XpService xpService;

    private void requireStudent(UserPrincipal user) {
        if (!"student".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    private void requireTeacherOrAdmin(UserPrincipal user) {
        if (!"teacher".equals(user.getRole()) && !"admin".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    @GetMapping
    public ApiResponse<List<KnowledgeGap>> myGaps(@AuthenticationPrincipal UserPrincipal user) {
        requireStudent(user);
        return ApiResponse.ok(knowledgeGapService.getStudentGaps(user.getId()));
    }

    @GetMapping("/{studentId}")
    public ApiResponse<List<KnowledgeGap>> studentGaps(@AuthenticationPrincipal UserPrincipal user, @PathVariable String studentId) {
        requireTeacherOrAdmin(user);
        return ApiResponse.ok(knowledgeGapService.getStudentGaps(studentId));
    }

    @PatchMapping("/{id}/resolve")
    public ApiResponse<KnowledgeGap> resolve(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        requireStudent(user);
        KnowledgeGap gap = knowledgeGapService.resolveGap(id, user.getId());
        try {
            xpService.award(user.getId(), "gap_resolved");
        } catch (Exception e) {
            log.error("XP award failed for gap resolve {}", id, e);
        }
        return ApiResponse.ok(gap);
    }
    public KnowledgeGapController(KnowledgeGapService knowledgeGapService, XpService xpService) {
        this.knowledgeGapService = knowledgeGapService;
        this.xpService = xpService;
    }
}
