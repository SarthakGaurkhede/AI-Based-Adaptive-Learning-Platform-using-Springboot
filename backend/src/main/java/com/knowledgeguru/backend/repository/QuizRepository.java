package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByCourseIdOrderByCreatedAtDesc(String courseId);
    List<Quiz> findByCourseIdAndStatusOrderByCreatedAtDesc(String courseId, String status);
    List<Quiz> findByCourseIdInOrderByCreatedAtDesc(List<String> courseIds);
    List<Quiz> findByTopicIdOrderByCreatedAtDesc(String topicId);
    List<Quiz> findAllByOrderByCreatedAtDesc();
}
