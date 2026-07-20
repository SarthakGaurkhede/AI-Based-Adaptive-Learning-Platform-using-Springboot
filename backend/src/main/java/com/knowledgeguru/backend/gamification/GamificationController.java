package com.knowledgeguru.backend.gamification;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.*;
import com.knowledgeguru.backend.repository.*;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/gamification")
public class GamificationController {

    private final LeaderboardService leaderboardService;
    private final LeaderboardSnapshotRepository leaderboardSnapshotRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final BattleRepository battleRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    public GamificationController(LeaderboardService leaderboardService, LeaderboardSnapshotRepository leaderboardSnapshotRepository, AchievementRepository achievementRepository, UserAchievementRepository userAchievementRepository, BattleRepository battleRepository, QuizRepository quizRepository, QuestionRepository questionRepository, UserRepository userRepository) {
        this.leaderboardService = leaderboardService;
        this.leaderboardSnapshotRepository = leaderboardSnapshotRepository;
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.battleRepository = battleRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/leaderboard")
    public ApiResponse<Object> leaderboard(@RequestParam(defaultValue = "global") String scope,
                                            @RequestParam(defaultValue = "50") int limit) {
        if ("global".equals(scope)) {
            return ApiResponse.ok(leaderboardService.getGlobal(limit));
        }
        var latestOpt = leaderboardSnapshotRepository.findFirstByScopeOrderBySnappedAtDesc(scope);
        if (latestOpt.isEmpty()) {
            return ApiResponse.ok(Collections.emptyList());
        }
        String period = latestOpt.get().getPeriod();
        var rows = leaderboardSnapshotRepository.findByScopeAndPeriodOrderByRankAsc(scope, period, PageRequest.of(0, limit));
        var data = rows.stream().map(r -> {
            User u = userRepository.findById(r.getStudentId()).orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("rank", r.getRank());
            m.put("userId", r.getStudentId());
            m.put("name", u != null ? u.getName() : null);
            m.put("avatar", u != null ? u.getAvatar() : null);
            m.put("xp", r.getXp());
            m.put("level", u != null ? u.getLevel() : null);
            m.put("knowledgeScore", r.getKnowledgeScore());
            m.put("streak", u != null ? u.getStreak().getCurrent() : 0);
            m.put("rankScore", r.getRankScore());
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.ok(data);
    
    }

    @GetMapping("/rank/me")
    public ApiResponse<Object> myRank(@AuthenticationPrincipal UserPrincipal user) {
        return ApiResponse.ok(leaderboardService.getMyRank(user.getId()));
    }

    @GetMapping("/achievements")
    public ApiResponse<Object> achievements(@AuthenticationPrincipal UserPrincipal user) {
        var all = achievementRepository.findAllByOrderByXpRewardDesc();
        var earned = userAchievementRepository.findByUserId(user.getId());
        var earnedByAchievement = earned.stream().collect(Collectors.toMap(UserAchievement::getAchievementId, e -> e));
        var result = all.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("_id", a.getId());
            m.put("title", a.getTitle());
            m.put("description", a.getDescription());
            m.put("icon", a.getIcon());
            m.put("family", a.getFamily());
            m.put("xpReward", a.getXpReward());
            boolean earnedFlag = earnedByAchievement.containsKey(a.getId());
            m.put("earned", earnedFlag);
            m.put("earnedAt", earnedFlag ? earnedByAchievement.get(a.getId()).getEarnedAt() : null);
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.ok(result);
    }

    @PostMapping("/battle/create")
    public ApiResponse<Battle> createBattle(@AuthenticationPrincipal UserPrincipal user, @RequestBody Map<String, String> body) {
        String quizId = body.get("quizId");
        String opponentId = body.get("opponentId");
        if (quizId == null) throw AppException.badRequest("quizId is required");
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> AppException.notFound("Quiz not found"));
        var questions = questionRepository.findByQuizId(quizId).stream().limit(10).toList();

        Battle battle = new Battle();
        List<String> participants = new ArrayList<>();
        participants.add(user.getId());
        if (opponentId != null) participants.add(opponentId);
        battle.setParticipants(participants);
        battle.setQuizId(quizId);
        battle.setQuestionIds(questions.stream().map(Question::getId).collect(Collectors.toList()));
        Battle.ScoreEntry scoreEntry = new Battle.ScoreEntry();
        scoreEntry.setUserId(user.getId());
        battle.setScores(List.of(scoreEntry));
        battle.setStatus("waiting");
        battle.setCreatedAt(Instant.now());
        return ApiResponse.ok(battleRepository.save(battle));
    }

    @GetMapping("/battle/{id}")
    public ApiResponse<Battle> getBattle(@PathVariable String id) {
        Battle battle = battleRepository.findById(id).orElseThrow(() -> AppException.notFound("Battle not found"));
        return ApiResponse.ok(battle);
    }
}
