package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "flashcards")
@CompoundIndex(name = "student_next_review", def = "{'studentId': 1, 'nextReviewAt': 1}")
public class Flashcard {
    private String id;
    private String studentId;
    private String courseId;
    private String topicId;
    private String question;
    private String answer;
    private String difficulty = "medium";
    private boolean aiGenerated = false;
    private String deckId;
    private Instant lastReviewedAt;
    private Instant nextReviewAt = Instant.now();
    private int reviewCount = 0;
    private int masteryLevel = 0;
    private Instant createdAt = Instant.now();
    public String getId() {
        return this.id;
    }

    public String getStudentId() {
        return this.studentId;
    }

    public String getCourseId() {
        return this.courseId;
    }

    public String getTopicId() {
        return this.topicId;
    }

    public String getQuestion() {
        return this.question;
    }

    public String getAnswer() {
        return this.answer;
    }

    public String getDifficulty() {
        return this.difficulty;
    }

    public boolean isAiGenerated() {
        return this.aiGenerated;
    }

    public String getDeckId() {
        return this.deckId;
    }

    public Instant getLastReviewedAt() {
        return this.lastReviewedAt;
    }

    public Instant getNextReviewAt() {
        return this.nextReviewAt;
    }

    public int getReviewCount() {
        return this.reviewCount;
    }

    public int getMasteryLevel() {
        return this.masteryLevel;
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

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setAiGenerated(boolean aiGenerated) {
        this.aiGenerated = aiGenerated;
    }

    public void setDeckId(String deckId) {
        this.deckId = deckId;
    }

    public void setLastReviewedAt(Instant lastReviewedAt) {
        this.lastReviewedAt = lastReviewedAt;
    }

    public void setNextReviewAt(Instant nextReviewAt) {
        this.nextReviewAt = nextReviewAt;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public void setMasteryLevel(int masteryLevel) {
        this.masteryLevel = masteryLevel;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
