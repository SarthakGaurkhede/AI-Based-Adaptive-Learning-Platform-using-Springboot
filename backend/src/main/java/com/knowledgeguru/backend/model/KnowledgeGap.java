package com.knowledgeguru.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "knowledge_gaps")
@CompoundIndexes({
    @CompoundIndex(name = "student_status", def = "{'studentId': 1, 'status': 1}"),
    @CompoundIndex(name = "student_priority", def = "{'studentId': 1, 'priorityScore': -1}"),
    @CompoundIndex(name = "student_topic_unique", def = "{'studentId': 1, 'topicId': 1}", unique = true)
})
public class KnowledgeGap {
    @Id
    private String id;

    private String studentId;
    private String topicId;
    private String courseId;

    private double confidenceScore = 50;
    private String severity = "low"; // low | medium | high
    private double priorityScore = 0;
    private String source = "quiz_attempt"; // quiz_attempt | onboarding_assessment
    private String status = "open"; // open | improving | resolved

    private Instant detectedAt = Instant.now();
    private Instant resolvedAt;

    @CreatedDate
    private Instant createdAt;
    public String getId() {
        return this.id;
    }

    public String getStudentId() {
        return this.studentId;
    }

    public String getTopicId() {
        return this.topicId;
    }

    public String getCourseId() {
        return this.courseId;
    }

    public double getConfidenceScore() {
        return this.confidenceScore;
    }

    public String getSeverity() {
        return this.severity;
    }

    public double getPriorityScore() {
        return this.priorityScore;
    }

    public String getSource() {
        return this.source;
    }

    public String getStatus() {
        return this.status;
    }

    public Instant getDetectedAt() {
        return this.detectedAt;
    }

    public Instant getResolvedAt() {
        return this.resolvedAt;
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

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public void setPriorityScore(double priorityScore) {
        this.priorityScore = priorityScore;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setDetectedAt(Instant detectedAt) {
        this.detectedAt = detectedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
