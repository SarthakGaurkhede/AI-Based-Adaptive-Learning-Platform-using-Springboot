package com.knowledgeguru.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "quizzes")
public class Quiz {
    @Id
    private String id;

    @Indexed
    private String courseId;
    @Indexed
    private String topicId;

    private String title;
    private double totalMarks = 10;
    private double passPercent = 60;
    private int timeLimitMinutes = 30;

    private Distribution distribution = new Distribution();
    private int questionsPerAttempt = 10;
    private String createdBy = "teacher"; // teacher | ai
    private String status = "draft"; // draft | published
    private boolean isDiagnostic = false;

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public static class Distribution {
        private int easy = 4;
        private int medium = 4;
        private int hard = 2;
    public int getEasy() {
        return this.easy;
    }

    public int getMedium() {
        return this.medium;
    }

    public int getHard() {
        return this.hard;
    }

    public void setEasy(int easy) {
        this.easy = easy;
    }

    public void setMedium(int medium) {
        this.medium = medium;
    }

    public void setHard(int hard) {
        this.hard = hard;
    }
    }
    public String getId() {
        return this.id;
    }

    public String getCourseId() {
        return this.courseId;
    }

    public String getTopicId() {
        return this.topicId;
    }

    public String getTitle() {
        return this.title;
    }

    public double getTotalMarks() {
        return this.totalMarks;
    }

    public double getPassPercent() {
        return this.passPercent;
    }

    public int getTimeLimitMinutes() {
        return this.timeLimitMinutes;
    }

    public Distribution getDistribution() {
        return this.distribution;
    }

    public int getQuestionsPerAttempt() {
        return this.questionsPerAttempt;
    }

    public String getCreatedBy() {
        return this.createdBy;
    }

    public String getStatus() {
        return this.status;
    }

    public boolean isDiagnostic() {
        return this.isDiagnostic;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Instant getUpdatedAt() {
        return this.updatedAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setTotalMarks(double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public void setPassPercent(double passPercent) {
        this.passPercent = passPercent;
    }

    public void setTimeLimitMinutes(int timeLimitMinutes) {
        this.timeLimitMinutes = timeLimitMinutes;
    }

    public void setDistribution(Distribution distribution) {
        this.distribution = distribution;
    }

    public void setQuestionsPerAttempt(int questionsPerAttempt) {
        this.questionsPerAttempt = questionsPerAttempt;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setDiagnostic(boolean isDiagnostic) {
        this.isDiagnostic = isDiagnostic;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
