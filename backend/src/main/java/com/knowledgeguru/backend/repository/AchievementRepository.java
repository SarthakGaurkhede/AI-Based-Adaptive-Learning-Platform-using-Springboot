package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AchievementRepository extends MongoRepository<Achievement, String> {
    List<Achievement> findAllByOrderByXpRewardDesc();
}
