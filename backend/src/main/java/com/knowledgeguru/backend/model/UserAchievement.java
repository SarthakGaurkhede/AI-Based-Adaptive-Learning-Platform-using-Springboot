package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "user_achievements")
@CompoundIndex(name = "user_achievement_unique", def = "{'userId': 1, 'achievementId': 1}", unique = true)
public class UserAchievement {
    private String id;
    private String userId;
    private String achievementId;
    private Instant earnedAt = Instant.now();
    public String getId() {
        return this.id;
    }

    public String getUserId() {
        return this.userId;
    }

    public String getAchievementId() {
        return this.achievementId;
    }

    public Instant getEarnedAt() {
        return this.earnedAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setAchievementId(String achievementId) {
        this.achievementId = achievementId;
    }

    public void setEarnedAt(Instant earnedAt) {
        this.earnedAt = earnedAt;
    }
}
