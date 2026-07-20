package com.knowledgeguru.backend.admin;

import com.knowledgeguru.backend.analytics.AnalyticsService;
import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.AiUsage;
import com.knowledgeguru.backend.model.AuditLog;
import com.knowledgeguru.backend.model.Course;
import com.knowledgeguru.backend.model.User;
import com.knowledgeguru.backend.repository.*;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Equivalent of the Node `admin.routes.js`. All endpoints require the admin role. */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AiUsageRepository aiUsageRepository;
    private final AuditLogRepository auditLogRepository;
    private final AnalyticsService analyticsService;
    public AdminController(UserRepository userRepository, CourseRepository courseRepository, AiUsageRepository aiUsageRepository, AuditLogRepository auditLogRepository, AnalyticsService analyticsService) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.aiUsageRepository = aiUsageRepository;
        this.auditLogRepository = auditLogRepository;
        this.analyticsService = analyticsService;
    }

    private void requireAdmin(UserPrincipal user) {
        if (!"admin".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    private void audit(UserPrincipal actor, String action, String targetType, String targetId) {
        AuditLog log = new AuditLog();
        log.setActorId(actor.getId());
        log.setActorRole(actor.getRole());
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }

    @GetMapping("/users")
    public Map<String, Object> listUsers(@AuthenticationPrincipal UserPrincipal user,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "20") int limit) {
        requireAdmin(user);
        var pageable = PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> result = (search != null && !search.isBlank())
                ? userRepository.searchByNameOrEmail(java.util.regex.Pattern.quote(search), pageable)
                : userRepository.findAll(pageable);
        result.getContent().forEach(u -> { u.setPasswordHash(null); u.setRefreshTokens(null); });

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("total", result.getTotalElements());
        meta.put("page", page);
        meta.put("pages", result.getTotalPages());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("data", result.getContent());
        out.put("meta", meta);
        return out;
    
    }

    @PatchMapping("/users/{id}/suspend")
    public ApiResponse<User> suspendUser(@AuthenticationPrincipal UserPrincipal admin, @PathVariable String id) {
        requireAdmin(admin);
        User target = userRepository.findById(id).orElseThrow(() -> AppException.notFound("User not found"));
        target.setStatus("suspended");
        target.setRefreshTokens(new java.util.ArrayList<>());
        userRepository.save(target);
        audit(admin, "suspend_user", "user", id);
        target.setPasswordHash(null);
        return ApiResponse.ok(target);
    }

    @PatchMapping("/users/{id}/reinstate")
    public ApiResponse<User> reinstateUser(@AuthenticationPrincipal UserPrincipal admin, @PathVariable String id) {
        requireAdmin(admin);
        User target = userRepository.findById(id).orElseThrow(() -> AppException.notFound("User not found"));
        target.setStatus("active");
        userRepository.save(target);
        audit(admin, "reinstate_user", "user", id);
        target.setPasswordHash(null);
        return ApiResponse.ok(target);
    }

    @PatchMapping("/users/{id}/role")
    public ApiResponse<User> changeRole(@AuthenticationPrincipal UserPrincipal admin, @PathVariable String id, @RequestBody Map<String, String> body) {
        requireAdmin(admin);
        String role = body.get("role");
        if (!List.of("student", "teacher", "admin").contains(role)) throw AppException.badRequest("Invalid role");
        User target = userRepository.findById(id).orElseThrow(() -> AppException.notFound("User not found"));
        target.setRole(role);
        userRepository.save(target);
        audit(admin, "change_role", "user", id);
        target.setPasswordHash(null);
        return ApiResponse.ok(target);
    }

    @GetMapping("/courses")
    public ApiResponse<List<Course>> listCourses(@AuthenticationPrincipal UserPrincipal user) {
        requireAdmin(user);
        return ApiResponse.ok(courseRepository.findByStatusOrderByCreatedAtDesc("published", PageRequest.of(0, 100)));
    }

    @PatchMapping("/courses/{id}/status")
    public ApiResponse<Course> setCourseStatus(@AuthenticationPrincipal UserPrincipal admin, @PathVariable String id, @RequestBody Map<String, String> body) {
        requireAdmin(admin);
        String status = body.get("status");
        if (!List.of("draft", "published", "archived").contains(status)) throw AppException.badRequest("Invalid status");
        Course course = courseRepository.findById(id).orElseThrow(() -> AppException.notFound("Course not found"));
        course.setStatus(status);
        courseRepository.save(course);
        audit(admin, "set_course_status", "course", id);
        return ApiResponse.ok(course);
    }

    @GetMapping("/analytics/platform")
    public ApiResponse<Map<String, Object>> platformAnalytics(@AuthenticationPrincipal UserPrincipal user) {
        requireAdmin(user);
        return ApiResponse.ok(analyticsService.getPlatformAnalytics());
    }

    @GetMapping("/ai-usage")
    public ApiResponse<Map<String, Object>> aiUsage(@AuthenticationPrincipal UserPrincipal user, @RequestParam(defaultValue = "30") int days) {
        requireAdmin(user);
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        List<AiUsage> usages = aiUsageRepository.findByCreatedAtGreaterThanEqual(since);
        Map<String, Long> byModule = new LinkedHashMap<>();
        long errors = 0;
        double totalCost = 0;
        for (AiUsage u : usages) {
            byModule.merge(u.getModule(), 1L, Long::sum);
            if ("error".equals(u.getStatus())) errors++;
            totalCost += u.getCostUsd();
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalCalls", usages.size());
        result.put("byModule", byModule);
        result.put("errors", errors);
        result.put("totalCostUsd", totalCost);
        return ApiResponse.ok(result);
    }

    @GetMapping("/audit-log")
    public Map<String, Object> auditLog(@AuthenticationPrincipal UserPrincipal user,
                                         @RequestParam(required = false) String action,
                                         @RequestParam(defaultValue = "1") int page,
                                         @RequestParam(defaultValue = "50") int limit) {
        requireAdmin(user);
        var pageable = PageRequest.of(Math.max(page - 1, 0), limit);
        Page<AuditLog> result = (action != null && !action.isBlank())
                ? auditLogRepository.findByActionRegexOrderByCreatedAtDesc(java.util.regex.Pattern.quote(action), pageable)
                : auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("total", result.getTotalElements());
        meta.put("page", page);
        meta.put("pages", result.getTotalPages());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("data", result.getContent());
        out.put("meta", meta);
        return out;
    }
}
