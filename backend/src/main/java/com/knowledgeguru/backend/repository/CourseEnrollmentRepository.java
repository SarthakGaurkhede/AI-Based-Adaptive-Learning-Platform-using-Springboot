package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.CourseEnrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CourseEnrollmentRepository extends MongoRepository<CourseEnrollment, String> {
    Optional<CourseEnrollment> findByCourseIdAndStudentId(String courseId, String studentId);
    List<CourseEnrollment> findByStudentIdAndStatusOrderByEnrolledAtDesc(String studentId, String status);
    long countByStudentId(String studentId);
    long countByStudentIdAndStatus(String studentId, String status);
}
