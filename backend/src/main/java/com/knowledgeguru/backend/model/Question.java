package com.knowledgeguru.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "questions")
@CompoundIndex(name = "quiz_difficulty", def = "{'quizId': 1, 'difficulty': 1}")
public class Question {
    @Id
    private String id;

    private String quizId;
    @Indexed
    private String topicId;
    private String courseId;

    private String type = "mcq"; // mcq | true_false | coding | subjective
    private String text;
    private List<String> options = new ArrayList<>();
    private String correctAnswer;
    private String difficulty = "medium";
    private double marks = 1;
    private boolean aiGenerated = false;
    private String explanation;

    @CreatedDate
    private Instant createdAt;
    public String getId() {
        return this.id;
    }

    public String getQuizId() {
        return this.quizId;
    }

    public String getTopicId() {
        return this.topicId;
    }

    public String getCourseId() {
        return this.courseId;
    }

    public String getType() {
        return this.type;
    }

    public String getText() {
        return this.text;
    }

    public List<String> getOptions() {
        return this.options;
    }

    public String getCorrectAnswer() {
        return this.correctAnswer;
    }

    public String getDifficulty() {
        return this.difficulty;
    }

    public double getMarks() {
        return this.marks;
    }

    public boolean isAiGenerated() {
        return this.aiGenerated;
    }

    public String getExplanation() {
        return this.explanation;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setMarks(double marks) {
        this.marks = marks;
    }

    public void setAiGenerated(boolean aiGenerated) {
        this.aiGenerated = aiGenerated;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
