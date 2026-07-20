package com.knowledgeguru.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "courses")
public class Course {
    @Id
    private String id;

    private String title;
    private String description = "";

    @Indexed
    private String teacherId;

    private String level = "beginner"; // beginner | intermediate | advanced
    private String category = "";
    private List<String> tags = new ArrayList<>();
    private String visibility = "public"; // public | private
    private List<String> invitedStudentEmails = new ArrayList<>();

    private List<ModuleEntry> modules = new ArrayList<>();

    private boolean aiGenerated = false;
    private PassCriteria passCriteria = new PassCriteria();
    private String status = "draft"; // draft | published | archived
    private long enrollmentCount = 0;
    private double rating = 0;
    private String thumbnail;

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public static class ModuleEntry {
        private String id = new org.bson.types.ObjectId().toString();
        private String title;
        private int order = 0;
    public String getId() {
        return this.id;
    }

    public String getTitle() {
        return this.title;
    }

    public int getOrder() {
        return this.order;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setOrder(int order) {
        this.order = order;
    }
    }

    public static class PassCriteria {
        private int perModulePassPercent = 70;
    public int getPerModulePassPercent() {
        return this.perModulePassPercent;
    }

    public void setPerModulePassPercent(int perModulePassPercent) {
        this.perModulePassPercent = perModulePassPercent;
    }
    }
    public String getId() {
        return this.id;
    }

    public String getTitle() {
        return this.title;
    }

    public String getDescription() {
        return this.description;
    }

    public String getTeacherId() {
        return this.teacherId;
    }

    public String getLevel() {
        return this.level;
    }

    public String getCategory() {
        return this.category;
    }

    public List<String> getTags() {
        return this.tags;
    }

    public String getVisibility() {
        return this.visibility;
    }

    public List<String> getInvitedStudentEmails() {
        return this.invitedStudentEmails;
    }

    public List<ModuleEntry> getModules() {
        return this.modules;
    }

    public boolean isAiGenerated() {
        return this.aiGenerated;
    }

    public PassCriteria getPassCriteria() {
        return this.passCriteria;
    }

    public String getStatus() {
        return this.status;
    }

    public long getEnrollmentCount() {
        return this.enrollmentCount;
    }

    public double getRating() {
        return this.rating;
    }

    public String getThumbnail() {
        return this.thumbnail;
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

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public void setInvitedStudentEmails(List<String> invitedStudentEmails) {
        this.invitedStudentEmails = invitedStudentEmails;
    }

    public void setModules(List<ModuleEntry> modules) {
        this.modules = modules;
    }

    public void setAiGenerated(boolean aiGenerated) {
        this.aiGenerated = aiGenerated;
    }

    public void setPassCriteria(PassCriteria passCriteria) {
        this.passCriteria = passCriteria;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setEnrollmentCount(long enrollmentCount) {
        this.enrollmentCount = enrollmentCount;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
