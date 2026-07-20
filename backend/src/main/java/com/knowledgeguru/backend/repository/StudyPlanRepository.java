package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.StudyPlan;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StudyPlanRepository extends MongoRepository<StudyPlan, String> {
    List<StudyPlan> findByStudentIdAndTypeAndStatusOrderByPeriodStartDesc(String studentId, String type, String status, Pageable pageable);
    Optional<StudyPlan> findByIdAndStudentId(String id, String studentId);
}
