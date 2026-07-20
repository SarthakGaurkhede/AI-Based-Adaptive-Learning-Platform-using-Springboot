package com.knowledgeguru.backend.gamification;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Equivalent of the recurring BullMQ leaderboard-snapshot job in the Node backend. */
@Component
public class LeaderboardScheduler {

    private final LeaderboardService leaderboardService;

    @Scheduled(cron = "0 0 * * * *") // hourly
    public void snapshotGlobal() {
        leaderboardService.snapshotAll("global");
    }

    @Scheduled(cron = "0 0 0 * * *") // daily at midnight
    public void snapshotWeeklyMonthly() {
        leaderboardService.snapshotAll("weekly");
        leaderboardService.snapshotAll("monthly");
    }
    public LeaderboardScheduler(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
}
