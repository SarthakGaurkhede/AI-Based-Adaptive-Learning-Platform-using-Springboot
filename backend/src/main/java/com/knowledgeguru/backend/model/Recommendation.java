package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "recommendations")
@CompoundIndex(name = "student_dismissed_priority", def = "{'studentId': 1, 'dismissed': 1, 'priorityScore': -1}")
public class Recommendation {
    private String id;
    private String studentId;
    private String type = "topic"; // course | topic | resource | action
    private String refId;
    private String reason = "";
    private double priorityScore = 0;
    private boolean dismissed = false;
    private boolean actedOn = false;
    private Instant generatedAt = Instant.now();
    private Instant createdAt = Instant.now();
    public String getId() {
        return this.id;
    }

    public String getStudentId() {
        return this.studentId;
    }

    public String getType() {
        return this.type;
    }

    public String getRefId() {
        return this.refId;
    }

    public String getReason() {
        return this.reason;
    }

    public double getPriorityScore() {
        return this.priorityScore;
    }

    public boolean isDismissed() {
        return this.dismissed;
    }

    public boolean isActedOn() {
        return this.actedOn;
    }

    public Instant getGeneratedAt() {
        return this.generatedAt;
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

    public void setRefId(String refId) {
        this.refId = refId;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setPriorityScore(double priorityScore) {
        this.priorityScore = priorityScore;
    }

    public void setDismissed(boolean dismissed) {
        this.dismissed = dismissed;
    }

    public void setActedOn(boolean actedOn) {
        this.actedOn = actedOn;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
