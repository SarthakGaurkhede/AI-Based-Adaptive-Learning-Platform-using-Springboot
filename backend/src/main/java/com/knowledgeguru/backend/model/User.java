package com.knowledgeguru.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    @Indexed
    private String role = "student"; // student | teacher | admin

    private boolean emailVerified = false;

    private String resetPasswordTokenHash;
    private Instant resetPasswordExpiresAt;
    private String emailVerificationTokenHash;
    private Instant emailVerificationExpiresAt;

    private List<RefreshTokenEntry> refreshTokens = new ArrayList<>();

    @Indexed
    private long xp = 0;
    private int level = 1;
    private double knowledgeScore = 0;

    private Streak streak = new Streak();
    private Onboarding onboarding = new Onboarding();

    private String status = "active"; // active | suspended
    private String avatar;

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public static class RefreshTokenEntry {
        private String token;
        private String deviceId;
        private Instant expiresAt;
    public String getToken() {
        return this.token;
    }

    public String getDeviceId() {
        return this.deviceId;
    }

    public Instant getExpiresAt() {
        return this.expiresAt;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
    }

    public static class Streak {
        private int current = 0;
        private int longest = 0;
        private Instant lastActiveDate;
    public int getCurrent() {
        return this.current;
    }

    public int getLongest() {
        return this.longest;
    }

    public Instant getLastActiveDate() {
        return this.lastActiveDate;
    }

    public void setCurrent(int current) {
        this.current = current;
    }

    public void setLongest(int longest) {
        this.longest = longest;
    }

    public void setLastActiveDate(Instant lastActiveDate) {
        this.lastActiveDate = lastActiveDate;
    }
    }

    public static class Onboarding {
        private boolean completed = false;
        private String domain;
        private List<String> strongTopics = new ArrayList<>();
        private List<String> weakTopics = new ArrayList<>();
        private String level;
    public boolean isCompleted() {
        return this.completed;
    }

    public String getDomain() {
        return this.domain;
    }

    public List<String> getStrongTopics() {
        return this.strongTopics;
    }

    public List<String> getWeakTopics() {
        return this.weakTopics;
    }

    public String getLevel() {
        return this.level;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public void setStrongTopics(List<String> strongTopics) {
        this.strongTopics = strongTopics;
    }

    public void setWeakTopics(List<String> weakTopics) {
        this.weakTopics = weakTopics;
    }

    public void setLevel(String level) {
        this.level = level;
    }
    }
    public String getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public String getEmail() {
        return this.email;
    }

    public String getPasswordHash() {
        return this.passwordHash;
    }

    public String getRole() {
        return this.role;
    }

    public boolean isEmailVerified() {
        return this.emailVerified;
    }

    public String getResetPasswordTokenHash() {
        return this.resetPasswordTokenHash;
    }

    public Instant getResetPasswordExpiresAt() {
        return this.resetPasswordExpiresAt;
    }

    public String getEmailVerificationTokenHash() {
        return this.emailVerificationTokenHash;
    }

    public Instant getEmailVerificationExpiresAt() {
        return this.emailVerificationExpiresAt;
    }

    public List<RefreshTokenEntry> getRefreshTokens() {
        return this.refreshTokens;
    }

    public long getXp() {
        return this.xp;
    }

    public int getLevel() {
        return this.level;
    }

    public double getKnowledgeScore() {
        return this.knowledgeScore;
    }

    public Streak getStreak() {
        return this.streak;
    }

    public Onboarding getOnboarding() {
        return this.onboarding;
    }

    public String getStatus() {
        return this.status;
    }

    public String getAvatar() {
        return this.avatar;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Instant getUpdatedAt() {
        return this.updatedAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public void setResetPasswordTokenHash(String resetPasswordTokenHash) {
        this.resetPasswordTokenHash = resetPasswordTokenHash;
    }

    public void setResetPasswordExpiresAt(Instant resetPasswordExpiresAt) {
        this.resetPasswordExpiresAt = resetPasswordExpiresAt;
    }

    public void setEmailVerificationTokenHash(String emailVerificationTokenHash) {
        this.emailVerificationTokenHash = emailVerificationTokenHash;
    }

    public void setEmailVerificationExpiresAt(Instant emailVerificationExpiresAt) {
        this.emailVerificationExpiresAt = emailVerificationExpiresAt;
    }

    public void setRefreshTokens(List<RefreshTokenEntry> refreshTokens) {
        this.refreshTokens = refreshTokens;
    }

    public void setXp(long xp) {
        this.xp = xp;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public void setKnowledgeScore(double knowledgeScore) {
        this.knowledgeScore = knowledgeScore;
    }

    public void setStreak(Streak streak) {
        this.streak = streak;
    }

    public void setOnboarding(Onboarding onboarding) {
        this.onboarding = onboarding;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
