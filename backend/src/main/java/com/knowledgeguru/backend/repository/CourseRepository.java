package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CourseRepository extends MongoRepository<Course, String> {
    Page<Course> findByStatusAndVisibility(String status, String visibility, Pageable pageable);
    Page<Course> findByStatusAndVisibilityAndCategory(String status, String visibility, String category, Pageable pageable);
    Page<Course> findByStatusAndVisibilityAndLevel(String status, String visibility, String level, Pageable pageable);
    Page<Course> findByTeacherId(String teacherId, Pageable pageable);
    List<Course> findByTeacherId(String teacherId);
    long countByStatus(String status);
    List<Course> findByStatusOrderByCreatedAtDesc(String status, org.springframework.data.domain.Pageable pageable);
}
