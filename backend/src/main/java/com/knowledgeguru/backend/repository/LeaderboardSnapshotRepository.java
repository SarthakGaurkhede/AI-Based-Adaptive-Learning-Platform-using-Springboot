package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.LeaderboardSnapshot;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LeaderboardSnapshotRepository extends MongoRepository<LeaderboardSnapshot, String> {
    Optional<LeaderboardSnapshot> findFirstByScopeOrderBySnappedAtDesc(String scope);
    List<LeaderboardSnapshot> findByScopeAndPeriodOrderByRankAsc(String scope, String period, org.springframework.data.domain.Pageable pageable);
    Optional<LeaderboardSnapshot> findByStudentIdAndScopeAndPeriod(String studentId, String scope, String period);
}
