package com.knowledgeguru.backend.notifications;

import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.model.Notification;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // Constructor
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public Map<String, Object> list(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        Map<String, Object> result =
                notificationService.getForUser(user.getId(), page, limit);

        Map<String, Object> out = new LinkedHashMap<>(result);
        out.put("success", true);

        return out;
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Notification> markRead(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id) {

        Notification n = notificationService.markRead(id, user.getId());

        if (n == null) {
            throw AppException.notFound("Notification not found");
        }

        return ApiResponse.ok(n);
    }

    @PatchMapping("/mark-all-read")
    public ApiResponse<Object> markAllRead(
            @AuthenticationPrincipal UserPrincipal user) {

        notificationService.markAllRead(user.getId());
        return ApiResponse.message("All notifications marked as read");
    }
}