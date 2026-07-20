package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Recommendation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository extends MongoRepository<Recommendation, String> {
    List<Recommendation> findByStudentIdAndDismissedFalseOrderByPriorityScoreDesc(String studentId, Pageable pageable);
    Optional<Recommendation> findByStudentIdAndRefId(String studentId, String refId);
    Optional<Recommendation> findByIdAndStudentId(String id, String studentId);
}
