package com.knowledgeguru.backend.quizzes;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.gamification.XpService;
import com.knowledgeguru.backend.knowledgegaps.KnowledgeGapService;
import com.knowledgeguru.backend.model.*;
import com.knowledgeguru.backend.recommendations.RecommendationService;
import com.knowledgeguru.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/** Equivalent of the Node `quiz.service.js`. */
@Service
public class QuizService {

    private static final Logger log = LoggerFactory.getLogger(QuizService.class);

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final KnowledgeGapService knowledgeGapService;
    private final RecommendationService recommendationService;
    private final XpService xpService;
    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    private static <T> List<T> shuffle(List<T> list) {
        List<T> copy = new ArrayList<>(list);
        Collections.shuffle(copy);
        return copy;
    }

    public Map<String, Object> startQuiz(String quizId, String studentId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> AppException.notFound("Quiz not found"));
        if (!"published".equals(quiz.getStatus())) throw new AppException("Quiz not available", 403);

        List<Question> easyQs = questionRepository.findByQuizIdAndDifficulty(quizId, "easy");
        List<Question> mediumQs = questionRepository.findByQuizIdAndDifficulty(quizId, "medium");
        List<Question> hardQs = questionRepository.findByQuizIdAndDifficulty(quizId, "hard");

        List<Question> selected = new ArrayList<>();
        selected.addAll(shuffle(easyQs).stream().limit(quiz.getDistribution().getEasy()).toList());
        selected.addAll(shuffle(mediumQs).stream().limit(quiz.getDistribution().getMedium()).toList());
        selected.addAll(shuffle(hardQs).stream().limit(quiz.getDistribution().getHard()).toList());
        List<Question> finalQuestions = shuffle(selected);

        // Strip correctAnswer/explanation, mirroring the Node `.select('-correctAnswer -explanation')`.
        List<Map<String, Object>> sanitized = finalQuestions.stream().map(q -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("_id", q.getId());
            m.put("quizId", q.getQuizId());
            m.put("topicId", q.getTopicId());
            m.put("courseId", q.getCourseId());
            m.put("type", q.getType());
            m.put("text", q.getText());
            m.put("options", q.getOptions());
            m.put("difficulty", q.getDifficulty());
            m.put("marks", q.getMarks());
            return m;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("_id", quizId);
        result.put("title", quiz.getTitle());
        result.put("timeLimitMinutes", quiz.getTimeLimitMinutes());
        result.put("questionsPerAttempt", quiz.getQuestionsPerAttempt());
        result.put("questions", sanitized);
        return result;
    }

    public record AnswerInput(String questionId, String response) {}

    public Map<String, Object> submitQuiz(String quizId, String studentId, List<Map<String, String>> answers) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> AppException.notFound("Quiz not found"));
        List<String> questionIds = answers.stream().map(a -> a.get("questionId")).toList();
        List<Question> questions = questionRepository.findByIdIn(questionIds);
        Map<String, Question> questionMap = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        double[] totalScore = {0};
        List<QuizAttempt.AnswerEntry> gradedAnswers = answers.stream().map(a -> {
            Question q = questionMap.get(a.get("questionId"));
            QuizAttempt.AnswerEntry entry = new QuizAttempt.AnswerEntry();
            entry.setQuestionId(a.get("questionId"));
            entry.setResponse(a.get("response"));
            if (q == null) {
                entry.setCorrect(false);
                entry.setMarksAwarded(0);
                return entry;
            }
            boolean isCorrect = q.getCorrectAnswer().trim().equalsIgnoreCase(a.get("response") == null ? "" : a.get("response").trim());
            double marksAwarded = isCorrect ? q.getMarks() : 0;
            totalScore[0] += marksAwarded;
            entry.setCorrect(isCorrect);
            entry.setMarksAwarded(marksAwarded);
            return entry;
        }).toList();

        double percentScore = quiz.getTotalMarks() > 0 ? Math.round(totalScore[0] / quiz.getTotalMarks() * 100) : 0;
        boolean passed = percentScore >= quiz.getPassPercent();

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quizId);
        attempt.setStudentId(studentId);
        attempt.setSelectedQuestionIds(questionIds);
        attempt.setAnswers(gradedAnswers);
        attempt.setScore(totalScore[0]);
        attempt.setPercentScore(percentScore);
        attempt.setPassed(passed);
        attempt.setStartedAt(Instant.now().minusSeconds(60));
        attempt.setSubmittedAt(Instant.now());
        attempt = quizAttemptRepository.save(attempt);

        try {
            knowledgeGapService.detectFromAttempt(attempt.getId(), studentId);
            recommendationService.generateForStudent(studentId);
        } catch (Exception e) {
            log.error("Knowledge gap detection / recommendation refresh failed for attempt {}", attempt.getId(), e);
        }

        Map<String, Object> gamification = null;
        try {
            String xpEvent = passed ? (percentScore == 100 ? "quiz_perfect" : "quiz_pass") : null;
            gamification = xpEvent != null ? xpService.award(studentId, xpEvent) : null;
            xpService.updateStreak(studentId);
        } catch (Exception e) {
            log.error("XP/streak update failed for attempt {}", attempt.getId(), e);
        }

        if (passed) {
            try {
                advanceCourseProgress(quiz, studentId);
            } catch (Exception e) {
                log.error("Course progress update failed for attempt {}", attempt.getId(), e);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("attemptId", attempt.getId());
        result.put("score", totalScore[0]);
        result.put("percentScore", percentScore);
        result.put("passed", passed);
        result.put("totalMarks", quiz.getTotalMarks());
        result.put("gamification", gamification);
        return result;
    }

    private void advanceCourseProgress(Quiz quiz, String studentId) {
        Topic topic = topicRepository.findById(quiz.getTopicId()).orElse(null);
        Course course = courseRepository.findById(quiz.getCourseId()).orElse(null);
        if (topic == null || course == null || course.getModules() == null || course.getModules().isEmpty()) return;
        CourseEnrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(quiz.getCourseId(), studentId).orElse(null);
        if (enrollment == null) return;
        if (enrollment.getCompletedModules().stream().noneMatch(m -> m.equals(topic.getModuleId()))) {
            enrollment.getCompletedModules().add(topic.getModuleId());
            enrollment.setProgressPercent(Math.round(100.0 * enrollment.getCompletedModules().size() / course.getModules().size()));
            if (enrollment.getProgressPercent() >= 100 && !"completed".equals(enrollment.getStatus())) {
                enrollment.setStatus("completed");
                xpService.award(studentId, "course_complete");
            }
            enrollmentRepository.save(enrollment);
        }
    }

    public QuizAttempt getAttempt(String attemptId, String studentId) {
        return quizAttemptRepository.findByIdAndStudentId(attemptId, studentId)
                .orElseThrow(() -> AppException.notFound("Attempt not found"));
    }
    public QuizService(QuizRepository quizRepository, QuestionRepository questionRepository, QuizAttemptRepository quizAttemptRepository, KnowledgeGapService knowledgeGapService, RecommendationService recommendationService, XpService xpService, CourseRepository courseRepository, TopicRepository topicRepository, CourseEnrollmentRepository enrollmentRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.knowledgeGapService = knowledgeGapService;
        this.recommendationService = recommendationService;
        this.xpService = xpService;
        this.courseRepository = courseRepository;
        this.topicRepository = topicRepository;
        this.enrollmentRepository = enrollmentRepository;
    }
}
