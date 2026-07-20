package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "leaderboard_snapshots")
@CompoundIndexes({
    @CompoundIndex(name = "scope_period_rankscore", def = "{'scope': 1, 'period': 1, 'rankScore': -1}"),
    @CompoundIndex(name = "student_scope_period", def = "{'studentId': 1, 'scope': 1, 'period': 1}")
})
public class LeaderboardSnapshot {
    private String id;
    private String studentId;
    private String scope; // global | weekly | monthly | course | friends
    private String courseId;
    private String period;
    private double rankScore = 0;
    private int rank = 0;
    private long xp = 0;
    private double knowledgeScore = 0;
    private double completionRate = 0;
    private int streak = 0;
    private Instant snappedAt = Instant.now();
    public String getId() {
        return this.id;
    }

    public String getStudentId() {
        return this.studentId;
    }

    public String getScope() {
        return this.scope;
    }

    public String getCourseId() {
        return this.courseId;
    }

    public String getPeriod() {
        return this.period;
    }

    public double getRankScore() {
        return this.rankScore;
    }

    public int getRank() {
        return this.rank;
    }

    public long getXp() {
        return this.xp;
    }

    public double getKnowledgeScore() {
        return this.knowledgeScore;
    }

    public double getCompletionRate() {
        return this.completionRate;
    }

    public int getStreak() {
        return this.streak;
    }

    public Instant getSnappedAt() {
        return this.snappedAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public void setRankScore(double rankScore) {
        this.rankScore = rankScore;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public void setXp(long xp) {
        this.xp = xp;
    }

    public void setKnowledgeScore(double knowledgeScore) {
        this.knowledgeScore = knowledgeScore;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public void setSnappedAt(Instant snappedAt) {
        this.snappedAt = snappedAt;
    }
}
