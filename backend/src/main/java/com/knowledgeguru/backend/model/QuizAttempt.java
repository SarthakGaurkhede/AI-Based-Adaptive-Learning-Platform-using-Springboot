package com.knowledgeguru.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "quiz_attempts")
@CompoundIndex(name = "student_quiz", def = "{'studentId': 1, 'quizId': 1}")
@CompoundIndex(name = "student_submitted", def = "{'studentId': 1, 'submittedAt': -1}")
public class QuizAttempt {
    @Id
    private String id;

    private String quizId;
    private String studentId;

    private List<String> selectedQuestionIds = new ArrayList<>();
    private List<AnswerEntry> answers = new ArrayList<>();

    private double score = 0;
    private double percentScore = 0;
    private List<TopicScore> topicScores = new ArrayList<>();
    private boolean passed = false;

    private Instant startedAt = Instant.now();
    private Instant submittedAt;
    private Long durationSeconds;

    @CreatedDate
    private Instant createdAt;

    public static class AnswerEntry {
        private String questionId;
        private String response;
        private boolean isCorrect = false;
        private double marksAwarded = 0;
    public String getQuestionId() {
        return this.questionId;
    }

    public String getResponse() {
        return this.response;
    }

    public boolean isCorrect() {
        return this.isCorrect;
    }

    public double getMarksAwarded() {
        return this.marksAwarded;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public void setCorrect(boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public void setMarksAwarded(double marksAwarded) {
        this.marksAwarded = marksAwarded;
    }
    }

    public static class TopicScore {
        private String topicId;
        private double score;
    public String getTopicId() {
        return this.topicId;
    }

    public double getScore() {
        return this.score;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public void setScore(double score) {
        this.score = score;
    }
    }
    public String getId() {
        return this.id;
    }

    public String getQuizId() {
        return this.quizId;
    }

    public String getStudentId() {
        return this.studentId;
    }

    public List<String> getSelectedQuestionIds() {
        return this.selectedQuestionIds;
    }

    public List<AnswerEntry> getAnswers() {
        return this.answers;
    }

    public double getScore() {
        return this.score;
    }

    public double getPercentScore() {
        return this.percentScore;
    }

    public List<TopicScore> getTopicScores() {
        return this.topicScores;
    }

    public boolean isPassed() {
        return this.passed;
    }

    public Instant getStartedAt() {
        return this.startedAt;
    }

    public Instant getSubmittedAt() {
        return this.submittedAt;
    }

    public Long getDurationSeconds() {
        return this.durationSeconds;
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

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setSelectedQuestionIds(List<String> selectedQuestionIds) {
        this.selectedQuestionIds = selectedQuestionIds;
    }

    public void setAnswers(List<AnswerEntry> answers) {
        this.answers = answers;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public void setPercentScore(double percentScore) {
        this.percentScore = percentScore;
    }

    public void setTopicScores(List<TopicScore> topicScores) {
        this.topicScores = topicScores;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
