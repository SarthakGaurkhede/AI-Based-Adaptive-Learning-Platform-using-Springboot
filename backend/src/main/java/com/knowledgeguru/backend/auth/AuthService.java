package com.knowledgeguru.backend.auth;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.MailService;
import com.knowledgeguru.backend.config.AppProperties;
import com.knowledgeguru.backend.model.User;
import com.knowledgeguru.backend.repository.UserRepository;
import com.knowledgeguru.backend.security.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/** Equivalent of the Node `auth.service.js` — register/login/refresh/logout/reset flows. */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;
    private final AppProperties appProperties;

    private static final SecureRandom RNG = new SecureRandom();

    public record AuthResult(String accessToken, String refreshToken, Map<String, Object> user) {}

    private Map<String, Object> stripUser(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("role", u.getRole());
        m.put("xp", u.getXp());
        m.put("level", u.getLevel());
        m.put("knowledgeScore", u.getKnowledgeScore());
        m.put("streak", u.getStreak());
        m.put("status", u.getStatus());
        m.put("avatar", u.getAvatar());
        return m;
    }

    private String randomHexToken() {
        byte[] bytes = new byte[32];
        RNG.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    private String sha256(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public AuthResult register(String name, String email, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw AppException.conflict("Email already registered");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user = userRepository.save(user);

        String deviceId = UUID.randomUUID().toString();
        String accessToken = jwtService.signAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtService.signRefreshToken(user.getId(), deviceId);

        User.RefreshTokenEntry entry = new User.RefreshTokenEntry();
        entry.setToken(passwordEncoder.encode(refreshToken));
        entry.setDeviceId(deviceId);
        entry.setExpiresAt(Instant.now().plus(appProperties.getJwt().getRefreshExpiresInDays(), ChronoUnit.DAYS));
        user.getRefreshTokens().add(entry);
        userRepository.save(user);

        sendVerificationEmailBestEffort(user);

        return new AuthResult(accessToken, refreshToken, stripUser(user));
    }

    private void sendVerificationEmailBestEffort(User user) {
        try {
            String rawToken = randomHexToken();
            user.setEmailVerificationTokenHash(sha256(rawToken));
            user.setEmailVerificationExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
            userRepository.save(user);
            String verifyUrl = appProperties.getClientUrl() + "/verify-email?token=" + rawToken;
            mailService.send(user.getEmail(), "Verify your KnowledgeGuru email",
                    "Welcome to KnowledgeGuru! Verify your email: " + verifyUrl + " (expires in 24 hours)",
                    "<p>Welcome to KnowledgeGuru!</p><p><a href=\"" + verifyUrl + "\">Click here to verify your email</a> (expires in 24 hours).</p>");
        } catch (Exception ignored) {
            // Best-effort — never blocks registration.
        }
    }

    public AuthResult login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> AppException.unauthorized("Invalid email or password"));
        if ("suspended".equals(user.getStatus())) {
            throw new AppException("Account suspended. Contact support.", 403);
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw AppException.unauthorized("Invalid email or password");
        }
        String deviceId = UUID.randomUUID().toString();
        String accessToken = jwtService.signAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtService.signRefreshToken(user.getId(), deviceId);

        User.RefreshTokenEntry entry = new User.RefreshTokenEntry();
        entry.setToken(passwordEncoder.encode(refreshToken));
        entry.setDeviceId(deviceId);
        entry.setExpiresAt(Instant.now().plus(appProperties.getJwt().getRefreshExpiresInDays(), ChronoUnit.DAYS));

        List<User.RefreshTokenEntry> tokens = user.getRefreshTokens();
        tokens.add(entry);
        // keep at most 5 most-recent devices, mirroring the Node $slice: -5
        while (tokens.size() > 5) tokens.remove(0);
        userRepository.save(user);

        return new AuthResult(accessToken, refreshToken, stripUser(user));
    }

    public AuthResult refresh(String oldRefreshToken) {
        Claims claims = jwtService.parseRefreshToken(oldRefreshToken);
        String userId = claims.getSubject();
        String deviceId = claims.get("deviceId", String.class);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.unauthorized("User not found"));

        int matchIdx = -1;
        for (int i = 0; i < user.getRefreshTokens().size(); i++) {
            User.RefreshTokenEntry rt = user.getRefreshTokens().get(i);
            if (rt.getDeviceId().equals(deviceId) && passwordEncoder.matches(oldRefreshToken, rt.getToken())) {
                matchIdx = i;
                break;
            }
        }
        if (matchIdx == -1) {
            user.setRefreshTokens(new ArrayList<>());
            userRepository.save(user);
            throw new AppException("Token reuse detected. All sessions revoked.", 401);
        }

        String newRefreshToken = jwtService.signRefreshToken(userId, deviceId);
        User.RefreshTokenEntry newEntry = new User.RefreshTokenEntry();
        newEntry.setToken(passwordEncoder.encode(newRefreshToken));
        newEntry.setDeviceId(deviceId);
        newEntry.setExpiresAt(Instant.now().plus(appProperties.getJwt().getRefreshExpiresInDays(), ChronoUnit.DAYS));
        user.getRefreshTokens().set(matchIdx, newEntry);
        userRepository.save(user);

        String accessToken = jwtService.signAccessToken(userId, user.getRole());
        return new AuthResult(accessToken, newRefreshToken, stripUser(user));
    }

    public void logout(String userId, String refreshToken) {
        userRepository.findById(userId).ifPresent(user -> {
            String matchedDeviceId = null;
            for (User.RefreshTokenEntry rt : user.getRefreshTokens()) {
                if (passwordEncoder.matches(refreshToken, rt.getToken())) {
                    matchedDeviceId = rt.getDeviceId();
                    break;
                }
            }
            if (matchedDeviceId != null) {
                final String deviceId = matchedDeviceId;
                user.getRefreshTokens().removeIf(rt -> rt.getDeviceId().equals(deviceId));
                userRepository.save(user);
            }
        });
    }

    public Map<String, Object> sendVerificationEmail(User user) {
        sendVerificationEmailBestEffort(user);
        return Map.of("message", "Verification email sent");
    }

    public Map<String, Object> verifyEmail(String rawToken) {
        String tokenHash = sha256(rawToken);
        User user = userRepository.findByEmailVerificationTokenHashAndEmailVerificationExpiresAtAfter(tokenHash, Instant.now())
                .orElseThrow(() -> AppException.badRequest("Invalid or expired verification link"));
        user.setEmailVerified(true);
        user.setEmailVerificationTokenHash(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);
        return Map.of("user", stripUser(user));
    }

    public Map<String, Object> forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String rawToken = randomHexToken();
            user.setResetPasswordTokenHash(sha256(rawToken));
            user.setResetPasswordExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
            userRepository.save(user);
            String resetUrl = appProperties.getClientUrl() + "/reset-password?token=" + rawToken;
            mailService.send(user.getEmail(), "Reset your KnowledgeGuru password",
                    "Reset your password: " + resetUrl + " (expires in 1 hour). If you didn't request this, ignore this email.",
                    "<p>We received a request to reset your password.</p><p><a href=\"" + resetUrl + "\">Click here to reset it</a> (expires in 1 hour).</p><p>If you didn't request this, you can safely ignore this email.</p>");
        });
        return Map.of("message", "If that email is registered, a reset link has been sent.");
    }

    public Map<String, Object> resetPassword(String rawToken, String newPassword) {
        String tokenHash = sha256(rawToken);
        User user = userRepository.findByResetPasswordTokenHashAndResetPasswordExpiresAtAfter(tokenHash, Instant.now())
                .orElseThrow(() -> AppException.badRequest("Invalid or expired reset link"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setRefreshTokens(new ArrayList<>());
        user.setResetPasswordTokenHash(null);
        user.setResetPasswordExpiresAt(null);
        userRepository.save(user);
        return Map.of("message", "Password updated successfully");
    }
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, MailService mailService, AppProperties appProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.appProperties = appProperties;
    }
}
