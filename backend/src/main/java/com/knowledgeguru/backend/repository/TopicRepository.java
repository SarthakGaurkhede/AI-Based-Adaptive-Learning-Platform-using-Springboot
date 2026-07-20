package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends MongoRepository<Topic, String> {
    List<Topic> findByCourseIdOrderByModuleIdAscOrderAsc(String courseId);
    Optional<Topic> findByIdAndCourseId(String id, String courseId);
    long countByCourseIdAndModuleId(String courseId, String moduleId);
    void deleteByCourseIdAndModuleId(String courseId, String moduleId);
}
