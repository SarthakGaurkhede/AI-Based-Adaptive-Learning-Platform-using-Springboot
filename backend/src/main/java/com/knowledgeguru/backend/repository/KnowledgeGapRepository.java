package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.KnowledgeGap;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface KnowledgeGapRepository extends MongoRepository<KnowledgeGap, String> {
    List<KnowledgeGap> findByStudentIdAndStatusNotOrderByPriorityScoreDesc(String studentId, String status);
    List<KnowledgeGap> findByStudentIdAndStatusOrderByPriorityScoreDesc(String studentId, String status);
    Optional<KnowledgeGap> findByStudentIdAndTopicId(String studentId, String topicId);
    Optional<KnowledgeGap> findByIdAndStudentId(String id, String studentId);
    List<KnowledgeGap> findByCourseIdInAndStatus(List<String> courseIds, String status);
}
