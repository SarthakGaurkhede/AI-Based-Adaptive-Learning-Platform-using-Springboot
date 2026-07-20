package com.knowledgeguru.backend.auth;

import com.knowledgeguru.backend.auth.dto.*;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.security.UserPrincipal;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    private static final int REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(REFRESH_COOKIE_MAX_AGE);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private Map<String, Object> body(String accessToken, Map<String, Object> user) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", true);
        m.put("accessToken", accessToken);
        m.put("user", user);
        return m;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse response) {
        AuthService.AuthResult result = authService.register(req.getName(), req.getEmail(), req.getPassword(), req.getRole());
        setRefreshCookie(response, result.refreshToken());
        return ResponseEntity.status(201).body(body(result.accessToken(), result.user()));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        AuthService.AuthResult result = authService.login(req.getEmail(), req.getPassword());
        setRefreshCookie(response, result.refreshToken());
        return ResponseEntity.ok(body(result.accessToken(), result.user()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@CookieValue(value = "refreshToken", required = false) String token, HttpServletResponse response) {
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No refresh token"));
        }
        AuthService.AuthResult result = authService.refresh(token);
        setRefreshCookie(response, result.refreshToken());
        return ResponseEntity.ok(body(result.accessToken(), result.user()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout(@CookieValue(value = "refreshToken", required = false) String token,
                                                        @AuthenticationPrincipal UserPrincipal principal,
                                                        HttpServletResponse response) {
        if (token != null && principal != null) {
            authService.logout(principal.getId(), token);
        }
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(ApiResponse.message("Logged out"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        Map<String, Object> result = authService.forgotPassword(req.getEmail());
        Map<String, Object> out = new HashMap<>(result);
        out.put("success", true);
        return ResponseEntity.ok(out);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        Map<String, Object> result = authService.resetPassword(req.getToken(), req.getPassword());
        Map<String, Object> out = new HashMap<>(result);
        out.put("success", true);
        return ResponseEntity.ok(out);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Verification token is required"));
        }
        Map<String, Object> result = authService.verifyEmail(token);
        Map<String, Object> out = new HashMap<>(result);
        out.put("success", true);
        return ResponseEntity.ok(out);
    }
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
}
