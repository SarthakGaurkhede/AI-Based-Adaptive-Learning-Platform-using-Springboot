package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByResetPasswordTokenHashAndResetPasswordExpiresAtAfter(String tokenHash, java.time.Instant now);
    Optional<User> findByEmailVerificationTokenHashAndEmailVerificationExpiresAtAfter(String tokenHash, java.time.Instant now);

    List<User> findByStatusAndRoleOrderByXpDesc(String status, String role, org.springframework.data.domain.Pageable pageable);
    long countByRoleAndStatusAndXpGreaterThan(String role, String status, long xp);
    Optional<User> findFirstByRoleAndStatusAndXpGreaterThanOrderByXpAsc(String role, String status, long xp);

    long countByRole(String role);
    long countByStatus(String status);
    long countByCreatedAtGreaterThanEqual(java.time.Instant since);

    @Query("{ $or: [ { name: { $regex: ?0, $options: 'i' } }, { email: { $regex: ?0, $options: 'i' } } ] }")
    Page<User> searchByNameOrEmail(String regex, Pageable pageable);
}
