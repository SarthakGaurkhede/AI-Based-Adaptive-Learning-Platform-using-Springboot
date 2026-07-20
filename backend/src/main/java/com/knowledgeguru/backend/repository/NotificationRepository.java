package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
    long countByUserIdAndReadFalse(String userId);
    Optional<Notification> findByIdAndUserId(String id, String userId);
    java.util.List<Notification> findByUserIdAndReadFalse(String userId);
}
