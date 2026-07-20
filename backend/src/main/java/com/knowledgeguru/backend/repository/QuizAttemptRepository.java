package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    Optional<QuizAttempt> findByIdAndStudentId(String id, String studentId);
}
