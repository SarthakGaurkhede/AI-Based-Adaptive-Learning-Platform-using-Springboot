package com.knowledgeguru.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "course_enrollments")
@CompoundIndex(name = "course_student_unique", def = "{'courseId': 1, 'studentId': 1}", unique = true)
public class CourseEnrollment {
    @Id
    private String id;

    private String courseId;

    @Indexed
    private String studentId;

    private double progressPercent = 0;
    private int currentModule = 0;
    private List<String> completedModules = new ArrayList<>();
    private double completionScore = 0;
    private String grade = "";
    private String status = "active"; // active | completed | dropped
    private Instant enrolledAt = Instant.now();

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
    public String getId() {
        return this.id;
    }

    public String getCourseId() {
        return this.courseId;
    }

    public String getStudentId() {
        return this.studentId;
    }

    public double getProgressPercent() {
        return this.progressPercent;
    }

    public int getCurrentModule() {
        return this.currentModule;
    }

    public List<String> getCompletedModules() {
        return this.completedModules;
    }

    public double getCompletionScore() {
        return this.completionScore;
    }

    public String getGrade() {
        return this.grade;
    }

    public String getStatus() {
        return this.status;
    }

    public Instant getEnrolledAt() {
        return this.enrolledAt;
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

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setProgressPercent(double progressPercent) {
        this.progressPercent = progressPercent;
    }

    public void setCurrentModule(int currentModule) {
        this.currentModule = currentModule;
    }

    public void setCompletedModules(List<String> completedModules) {
        this.completedModules = completedModules;
    }

    public void setCompletionScore(double completionScore) {
        this.completionScore = completionScore;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setEnrolledAt(Instant enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
