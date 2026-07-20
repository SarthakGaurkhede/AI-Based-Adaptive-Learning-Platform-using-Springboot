package com.knowledgeguru.backend.gamification;

import com.knowledgeguru.backend.model.LeaderboardSnapshot;
import com.knowledgeguru.backend.model.User;
import com.knowledgeguru.backend.repository.LeaderboardSnapshotRepository;
import com.knowledgeguru.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/** Equivalent of the Node `leaderboard.service.js`. */
@Service
public class LeaderboardService {

    private final UserRepository userRepository;
    private final LeaderboardSnapshotRepository leaderboardSnapshotRepository;

    // Rank Score = 40% XP + 30% KnowledgeScore + 15% Level + 10% Streak (matches Node weighting)
    public int computeRankScore(User u) {
        double xpNorm = Math.min(u.getXp() / 10000.0, 1) * 100;
        double knowledgeNorm = Math.min(u.getKnowledgeScore() / 100.0, 1) * 100;
        double levelNorm = Math.min(u.getLevel() / 10.0, 1) * 100;
        double streakNorm = Math.min(u.getStreak().getCurrent() / 30.0, 1) * 100;
        return (int) Math.round(xpNorm * 0.40 + knowledgeNorm * 0.30 + levelNorm * 0.15 + streakNorm * 0.10);
    }

    public List<Map<String, Object>> getGlobal(int limit) {
        List<User> users = userRepository.findByStatusAndRoleOrderByXpDesc("active", "student", PageRequest.of(0, limit));
        return IntStream.range(0, users.size()).mapToObj(i -> {
            User u = users.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("rank", i + 1);
            m.put("userId", u.getId());
            m.put("name", u.getName());
            m.put("avatar", u.getAvatar());
            m.put("xp", u.getXp());
            m.put("level", u.getLevel());
            m.put("knowledgeScore", u.getKnowledgeScore());
            m.put("streak", u.getStreak().getCurrent());
            m.put("rankScore", computeRankScore(u));
            return m;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getMyRank(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;
        int myScore = computeRankScore(user);
        long rank = userRepository.countByRoleAndStatusAndXpGreaterThan("student", "active", user.getXp()) + 1;
        User next = userRepository.findFirstByRoleAndStatusAndXpGreaterThanOrderByXpAsc("student", "active", user.getXp()).orElse(null);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("rank", rank);
        result.put("rankScore", myScore);
        result.put("xp", user.getXp());
        result.put("knowledgeScore", user.getKnowledgeScore());
        result.put("streak", user.getStreak().getCurrent());
        if (next != null) {
            Map<String, Object> nextStudent = new LinkedHashMap<>();
            nextStudent.put("name", next.getName());
            nextStudent.put("xpNeeded", next.getXp() - user.getXp());
            result.put("nextStudent", nextStudent);
        } else {
            result.put("nextStudent", null);
        }
        return result;
    }

    public void snapshotAll(String scope) {
        String period = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        List<User> users = userRepository.findByStatusAndRoleOrderByXpDesc("active", "student", PageRequest.of(0, 10000));
        List<User> sorted = users.stream()
                .sorted((a, b) -> computeRankScore(b) - computeRankScore(a))
                .collect(Collectors.toList());
        for (int i = 0; i < sorted.size(); i++) {
            User u = sorted.get(i);
            LeaderboardSnapshot snap = leaderboardSnapshotRepository.findByStudentIdAndScopeAndPeriod(u.getId(), scope, period)
                    .orElseGet(LeaderboardSnapshot::new);
            snap.setStudentId(u.getId());
            snap.setScope(scope);
            snap.setPeriod(period);
            snap.setRankScore(computeRankScore(u));
            snap.setRank(i + 1);
            snap.setXp(u.getXp());
            snap.setKnowledgeScore(u.getKnowledgeScore());
            snap.setSnappedAt(java.time.Instant.now());
            leaderboardSnapshotRepository.save(snap);
        }
    }
    public LeaderboardService(UserRepository userRepository, LeaderboardSnapshotRepository leaderboardSnapshotRepository) {
        this.userRepository = userRepository;
        this.leaderboardSnapshotRepository = leaderboardSnapshotRepository;
    }
}
