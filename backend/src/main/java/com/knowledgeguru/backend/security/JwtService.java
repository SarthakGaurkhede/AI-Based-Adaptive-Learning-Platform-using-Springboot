package com.knowledgeguru.backend.security;

import com.knowledgeguru.backend.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

/** Equivalent of the Node auth.service's signAccess/signRefresh + jwt.verify. */
@Service
public class JwtService {

    private final AppProperties appProperties;

    private SecretKey accessKey() {
        return Keys.hmacShaKeyFor(appProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey refreshKey() {
        return Keys.hmacShaKeyFor(appProperties.getJwt().getRefreshSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String signAccessToken(String userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claims(Map.of("sub", userId, "role", role))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(appProperties.getJwt().getExpiresInMinutes(), ChronoUnit.MINUTES)))
                .signWith(accessKey())
                .compact();
    }

    public String signRefreshToken(String userId, String deviceId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claims(Map.of("sub", userId, "deviceId", deviceId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(appProperties.getJwt().getRefreshExpiresInDays(), ChronoUnit.DAYS)))
                .signWith(refreshKey())
                .compact();
    }

    public Claims parseAccessToken(String token) {
        try {
            return Jwts.parser().verifyWith(accessKey()).build().parseSignedClaims(token).getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new com.knowledgeguru.backend.common.AppException("Invalid or expired token", 401);
        }
    }

    public Claims parseRefreshToken(String token) {
        try {
            return Jwts.parser().verifyWith(refreshKey()).build().parseSignedClaims(token).getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new com.knowledgeguru.backend.common.AppException("Invalid refresh token", 401);
        }
    }
    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }
}
