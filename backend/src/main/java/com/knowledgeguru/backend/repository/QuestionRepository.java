package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByQuizIdAndDifficulty(String quizId, String difficulty);
    List<Question> findByQuizId(String quizId);
    List<Question> findByIdIn(List<String> ids);
}
