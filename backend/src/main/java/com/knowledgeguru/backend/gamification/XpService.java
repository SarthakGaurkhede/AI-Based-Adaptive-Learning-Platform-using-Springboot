package com.knowledgeguru.backend.gamification;

import com.knowledgeguru.backend.model.Achievement;
import com.knowledgeguru.backend.model.User;
import com.knowledgeguru.backend.model.UserAchievement;
import com.knowledgeguru.backend.repository.AchievementRepository;
import com.knowledgeguru.backend.repository.UserAchievementRepository;
import com.knowledgeguru.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

/** Equivalent of the Node `xp.service.js`. */
@Service
public class XpService {

    private static final Logger log = LoggerFactory.getLogger(XpService.class);

    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    private static final long[] XP_LEVELS = {0, 400, 1000, 2500, 5000, 10000, 20000, 40000, 75000, 120000};

    private static final Map<String, Integer> XP_AWARDS = Map.ofEntries(
            Map.entry("lesson_complete", 20),
            Map.entry("quiz_pass", 50),
            Map.entry("quiz_perfect", 100),
            Map.entry("gap_resolved", 75),
            Map.entry("streak_day", 10),
            Map.entry("course_complete", 200),
            Map.entry("study_plan_done", 40),
            Map.entry("ai_tutor_session", 5),
            Map.entry("battle_win", 80)
    );

    private int getLevelForXp(long xp) {
        for (int i = XP_LEVELS.length - 1; i >= 0; i--) {
            if (xp >= XP_LEVELS[i]) return i + 1;
        }
        return 1;
    }

    public Map<String, Object> award(String userId, String event) {
        return award(userId, event, 1.0);
    }

    public Map<String, Object> award(String userId, String event, double multiplier) {
        int amount = (int) Math.round(XP_AWARDS.getOrDefault(event, 10) * multiplier);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;
        user.setXp(user.getXp() + amount);
        int newLevel = getLevelForXp(user.getXp());
        boolean leveledUp = newLevel > user.getLevel();
        if (leveledUp) {
            user.setLevel(newLevel);
            log.info("User {} leveled up to {}", userId, newLevel);
        }
        userRepository.save(user);
        checkAchievements(userId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("xpAwarded", amount);
        result.put("totalXp", user.getXp());
        result.put("level", newLevel);
        return result;
    }

    public void updateStreak(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        Instant today = Instant.now();
        Instant lastActive = user.getStreak().getLastActiveDate();
        boolean isYesterday = lastActive != null && (today.toEpochMilli() - lastActive.toEpochMilli()) < 48L * 60 * 60 * 1000;
        boolean isToday = lastActive != null && lastActive.truncatedTo(ChronoUnit.DAYS).equals(today.truncatedTo(ChronoUnit.DAYS));
        if (isToday) return;
        int newCurrent = isYesterday ? user.getStreak().getCurrent() + 1 : 1;
        int newLongest = Math.max(newCurrent, user.getStreak().getLongest());
        user.getStreak().setCurrent(newCurrent);
        user.getStreak().setLongest(newLongest);
        user.getStreak().setLastActiveDate(today);
        userRepository.save(user);
        if (newCurrent > 0) award(userId, "streak_day");
    }

    public void updateKnowledgeScore(String userId, double delta) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setKnowledgeScore(user.getKnowledgeScore() + delta);
            userRepository.save(user);
        });
    }

    public void checkAchievements(String userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return;
            var all = achievementRepository.findAll();
            var earned = userAchievementRepository.findByUserId(userId);
            var earnedIds = earned.stream().map(UserAchievement::getAchievementId).collect(java.util.stream.Collectors.toSet());
            for (Achievement ach : all) {
                if (earnedIds.contains(ach.getId())) continue;
                boolean qualified = false;
                Map<String, Object> criteria = ach.getCriteria();
                if (criteria != null) {
                    if (criteria.get("minXp") != null && user.getXp() >= toLong(criteria.get("minXp"))) qualified = true;
                    if (criteria.get("minStreak") != null && user.getStreak().getCurrent() >= toLong(criteria.get("minStreak"))) qualified = true;
                    if (criteria.get("minLevel") != null && user.getLevel() >= toLong(criteria.get("minLevel"))) qualified = true;
                    if (criteria.get("minKnowledge") != null && user.getKnowledgeScore() >= toLong(criteria.get("minKnowledge"))) qualified = true;
                }
                if (qualified) {
                    UserAchievement ua = new UserAchievement();
                    ua.setUserId(userId);
                    ua.setAchievementId(ach.getId());
                    ua.setEarnedAt(Instant.now());
                    userAchievementRepository.save(ua);
                    user.setXp(user.getXp() + (long) ach.getXpReward());
                    userRepository.save(user);
                    log.info("Achievement earned: {} by {}", ach.getTitle(), userId);
                }
            }
        } catch (Exception e) {
            log.error("Achievement check error:", e);
        }
    }

    private long toLong(Object o) {
        if (o instanceof Number n) return n.longValue();
        return Long.parseLong(o.toString());
    }
    public XpService(UserRepository userRepository, AchievementRepository achievementRepository, UserAchievementRepository userAchievementRepository) {
        this.userRepository = userRepository;
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
    }
}
