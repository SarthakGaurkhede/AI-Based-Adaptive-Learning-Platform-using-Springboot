package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "battles")
public class Battle {
    private String id;
    private List<String> participants = new ArrayList<>();
    private String quizId;
    private List<String> questionIds = new ArrayList<>();
    private List<ScoreEntry> scores = new ArrayList<>();
    private String winnerId;
    private String status = "waiting"; // waiting | active | completed
    private Instant startedAt;
    private Instant completedAt;
    private Instant createdAt = Instant.now();

    public static class ScoreEntry {
        private String userId;
        private double score = 0;
        private List<Object> answers = new ArrayList<>();
    public String getUserId() {
        return this.userId;
    }

    public double getScore() {
        return this.score;
    }

    public List<Object> getAnswers() {
        return this.answers;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public void setAnswers(List<Object> answers) {
        this.answers = answers;
    }
    }
    public String getId() {
        return this.id;
    }

    public List<String> getParticipants() {
        return this.participants;
    }

    public String getQuizId() {
        return this.quizId;
    }

    public List<String> getQuestionIds() {
        return this.questionIds;
    }

    public List<ScoreEntry> getScores() {
        return this.scores;
    }

    public String getWinnerId() {
        return this.winnerId;
    }

    public String getStatus() {
        return this.status;
    }

    public Instant getStartedAt() {
        return this.startedAt;
    }

    public Instant getCompletedAt() {
        return this.completedAt;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public void setQuestionIds(List<String> questionIds) {
        this.questionIds = questionIds;
    }

    public void setScores(List<ScoreEntry> scores) {
        this.scores = scores;
    }

    public void setWinnerId(String winnerId) {
        this.winnerId = winnerId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
