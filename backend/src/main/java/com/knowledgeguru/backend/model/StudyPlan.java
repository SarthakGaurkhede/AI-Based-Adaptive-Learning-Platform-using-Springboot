package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "study_plans")
@CompoundIndex(name = "student_period", def = "{'studentId': 1, 'periodStart': -1}")
public class StudyPlan {
    private String id;
    private String studentId;
    private String type = "daily"; // daily | weekly | monthly
    private Instant periodStart;
    private Instant periodEnd;
    private List<Item> items = new ArrayList<>();
    private double totalEstimatedHours = 0;
    private String status = "active"; // active | completed | expired
    private String aiGenerated = "";
    private Instant createdAt = Instant.now();

    public static class Item {
        private String topicId;
        private String taskType = "study";
        private int estimatedMinutes = 30;
        private boolean completed = false;
    public String getTopicId() {
        return this.topicId;
    }

    public String getTaskType() {
        return this.taskType;
    }

    public int getEstimatedMinutes() {
        return this.estimatedMinutes;
    }

    public boolean isCompleted() {
        return this.completed;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public void setEstimatedMinutes(int estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
    }
    public String getId() {
        return this.id;
    }

    public String getStudentId() {
        return this.studentId;
    }

    public String getType() {
        return this.type;
    }

    public Instant getPeriodStart() {
        return this.periodStart;
    }

    public Instant getPeriodEnd() {
        return this.periodEnd;
    }

    public List<Item> getItems() {
        return this.items;
    }

    public double getTotalEstimatedHours() {
        return this.totalEstimatedHours;
    }

    public String getStatus() {
        return this.status;
    }

    public String getAiGenerated() {
        return this.aiGenerated;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setPeriodStart(Instant periodStart) {
        this.periodStart = periodStart;
    }

    public void setPeriodEnd(Instant periodEnd) {
        this.periodEnd = periodEnd;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public void setTotalEstimatedHours(double totalEstimatedHours) {
        this.totalEstimatedHours = totalEstimatedHours;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAiGenerated(String aiGenerated) {
        this.aiGenerated = aiGenerated;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
