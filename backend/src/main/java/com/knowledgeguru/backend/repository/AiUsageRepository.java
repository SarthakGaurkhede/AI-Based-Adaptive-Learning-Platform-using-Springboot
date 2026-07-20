package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.AiUsage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface AiUsageRepository extends MongoRepository<AiUsage, String> {
    List<AiUsage> findByCreatedAtGreaterThanEqual(Instant since);
    List<AiUsage> findByStatus(String status);
}
