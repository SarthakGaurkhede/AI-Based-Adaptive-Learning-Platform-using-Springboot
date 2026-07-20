package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.UserAchievement;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserAchievementRepository extends MongoRepository<UserAchievement, String> {
    List<UserAchievement> findByUserId(String userId);
    Optional<UserAchievement> findByUserIdAndAchievementId(String userId, String achievementId);
}
