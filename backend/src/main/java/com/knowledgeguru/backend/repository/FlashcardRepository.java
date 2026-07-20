package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Flashcard;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface FlashcardRepository extends MongoRepository<Flashcard, String> {
    List<Flashcard> findByStudentIdOrderByNextReviewAtAsc(String studentId, Pageable pageable);
    List<Flashcard> findByStudentIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(String studentId, Instant now, Pageable pageable);
    List<Flashcard> findByStudentIdAndTopicIdOrderByNextReviewAtAsc(String studentId, String topicId, Pageable pageable);
    List<Flashcard> findByStudentIdAndTopicIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(String studentId, String topicId, Instant now, Pageable pageable);
    List<Flashcard> findByStudentIdAndCourseIdOrderByNextReviewAtAsc(String studentId, String courseId, Pageable pageable);
    List<Flashcard> findByStudentIdAndCourseIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(String studentId, String courseId, Instant now, Pageable pageable);
    Optional<Flashcard> findByIdAndStudentId(String id, String studentId);
    void deleteByIdAndStudentId(String id, String studentId);
}
