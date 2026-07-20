package com.knowledgeguru.backend.users;

import com.knowledgeguru.backend.analytics.AnalyticsService;
import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.User;
import com.knowledgeguru.backend.repository.UserRepository;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UsersController {

    private final UserRepository userRepository;
    private final AnalyticsService analyticsService;

    /** Strips sensitive fields, mirroring the Node `.select('-passwordHash -refreshTokens -otpCode -otpExpiresAt')`. */
    private User sanitize(User u) {
        u.setPasswordHash(null);
        u.setRefreshTokens(null);
        return u;
    }

    @GetMapping("/me")
    public ApiResponse<User> me(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow(() -> AppException.notFound("User not found"));
        return ApiResponse.ok(sanitize(user));
    }

    @PatchMapping("/me")
    public ApiResponse<User> updateMe(@AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(principal.getId()).orElseThrow(() -> AppException.notFound("User not found"));
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("avatar")) user.setAvatar((String) body.get("avatar"));
        if (body.containsKey("onboarding")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> ob = (Map<String, Object>) body.get("onboarding");
            User.Onboarding onboarding = user.getOnboarding();
            if (ob.containsKey("completed")) onboarding.setCompleted((Boolean) ob.get("completed"));
            if (ob.containsKey("domain")) onboarding.setDomain((String) ob.get("domain"));
            if (ob.containsKey("level")) onboarding.setLevel((String) ob.get("level"));
        }
        userRepository.save(user);
        return ApiResponse.ok(sanitize(user));
    }

    @GetMapping("/me/analytics")
    public ApiResponse<Map<String, Object>> myAnalytics(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> data;
        if ("teacher".equals(principal.getRole())) {
            var t = analyticsService.getTeacherAnalytics(principal.getId());
            data = new LinkedHashMap<>();
            data.put("totalStudents", t.get("totalStudents"));
            data.put("avgPerformance", t.get("avgPerformance"));
            data.put("totalGaps", t.get("totalGaps"));
            data.put("totalCourses", t.get("totalCourses"));
            data.put("avgRating", t.get("avgRating"));
        } else {
            var s = analyticsService.getStudentAnalytics(principal.getId());
            data = new LinkedHashMap<>();
            data.put("coursesEnrolled", s.get("coursesEnrolled"));
            data.put("coursesCompleted", s.get("coursesCompleted"));
            data.put("avgQuizScore", s.get("avgQuizScore"));
            data.put("studyHours", s.get("studyHours"));
            data.put("recentAttempts", s.get("recentAttempts"));
        }
        return ApiResponse.ok(data);
    }
    public UsersController(UserRepository userRepository, AnalyticsService analyticsService) {
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
    }
}
