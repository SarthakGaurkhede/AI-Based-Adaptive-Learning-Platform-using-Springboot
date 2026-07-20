package com.knowledgeguru.backend.quizzes;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.Course;
import com.knowledgeguru.backend.model.Question;
import com.knowledgeguru.backend.model.Quiz;
import com.knowledgeguru.backend.model.QuizAttempt;
import com.knowledgeguru.backend.repository.CourseRepository;
import com.knowledgeguru.backend.repository.QuestionRepository;
import com.knowledgeguru.backend.repository.QuizRepository;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/** Equivalent of the Node `quizzes.routes.js`. */
@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final CourseRepository courseRepository;
    public QuizController(QuizService quizService, QuizRepository quizRepository, QuestionRepository questionRepository, CourseRepository courseRepository) {
        this.quizService = quizService;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.courseRepository = courseRepository;
    }

    private void requireStudent(UserPrincipal user) {
        if (!"student".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }
    private void requireTeacherOrAdmin(UserPrincipal user) {
        if (!"teacher".equals(user.getRole()) && !"admin".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    @GetMapping
    public ApiResponse<List<Quiz>> list(@AuthenticationPrincipal UserPrincipal user,
                                         @RequestParam(required = false) String courseId,
                                         @RequestParam(required = false) String topicId) {
        List<Quiz> quizzes;
        if ("student".equals(user.getRole())) {
            if (courseId == null) throw AppException.badRequest("courseId is required");
            quizzes = quizRepository.findByCourseIdAndStatusOrderByCreatedAtDesc(courseId, "published");
        } else {
            if (courseId != null) {
                Course course = courseRepository.findById(courseId).orElseThrow(() -> AppException.notFound("Course not found"));
                if (!"admin".equals(user.getRole()) && !course.getTeacherId().equals(user.getId())) {
                    throw AppException.forbidden("You do not have access to this course");
                }
                quizzes = quizRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
            } else if (!"admin".equals(user.getRole())) {
                List<String> ownCourseIds = courseRepository.findByTeacherId(user.getId()).stream().map(Course::getId).toList();
                quizzes = quizRepository.findByCourseIdInOrderByCreatedAtDesc(ownCourseIds);
            } else {
                quizzes = quizRepository.findAllByOrderByCreatedAtDesc();
            }
        }
        if (topicId != null) quizzes = quizzes.stream().filter(q -> topicId.equals(q.getTopicId())).toList();
        return ApiResponse.ok(quizzes);
    
    }

    @GetMapping("/{id}/start")
    public Map<String, Object> start(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        requireStudent(user);
        Map<String, Object> data = quizService.startQuiz(id, user.getId());
        Map<String, Object> out = new LinkedHashMap<>(data);
        out.put("success", true);
        return out;
    }

    @PostMapping("/{id}/submit")
    public Map<String, Object> submit(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @RequestBody Map<String, Object> body) {
        requireStudent(user);
        @SuppressWarnings("unchecked")
        List<Map<String, String>> answers = (List<Map<String, String>>) body.get("answers");
        if (answers == null) throw AppException.badRequest("answers must be an array");
        Map<String, Object> result = quizService.submitQuiz(id, user.getId(), answers);
        Map<String, Object> out = new LinkedHashMap<>(result);
        out.put("success", true);
        return out;
    }

    @GetMapping("/{id}/attempts/{attemptId}")
    public ApiResponse<QuizAttempt> getAttempt(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @PathVariable String attemptId) {
        return ApiResponse.ok(quizService.getAttempt(attemptId, user.getId()));
    }

    @PostMapping
    public ApiResponse<Quiz> create(@AuthenticationPrincipal UserPrincipal user, @RequestBody Map<String, Object> body) {
        requireTeacherOrAdmin(user);
        String courseId = (String) body.get("courseId");
        String topicId = (String) body.get("topicId");
        String title = (String) body.get("title");
        if (courseId == null || topicId == null || title == null) throw AppException.badRequest("courseId, topicId and title are required");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) body.get("questions");
        if (questions == null || questions.isEmpty()) throw AppException.badRequest("At least one question is required");

        Course course = courseRepository.findById(courseId).orElseThrow(() -> AppException.notFound("Course not found"));
        if (!"admin".equals(user.getRole()) && !course.getTeacherId().equals(user.getId())) {
            throw AppException.forbidden("You do not have access to this course");
        }

        boolean isDiagnostic = Boolean.TRUE.equals(body.get("isDiagnostic"));
        if (isDiagnostic) {
            quizRepository.findByCourseIdOrderByCreatedAtDesc(courseId).stream()
                    .filter(Quiz::isDiagnostic)
                    .forEach(q -> { q.setDiagnostic(false); quizRepository.save(q); });
        }

        Map<String, Integer> counts = new LinkedHashMap<>(Map.of("easy", 0, "medium", 0, "hard", 0));
        for (Map<String, Object> q : questions) {
            String diff = (String) q.getOrDefault("difficulty", "medium");
            counts.merge(diff, 1, Integer::sum);
        }

        Quiz quiz = new Quiz();
        quiz.setCourseId(courseId);
        quiz.setTopicId(topicId);
        quiz.setTitle(title);
        double totalMarks = body.get("totalMarks") != null ? ((Number) body.get("totalMarks")).doubleValue()
                : questions.stream().mapToDouble(q -> q.get("marks") != null ? ((Number) q.get("marks")).doubleValue() : 1).sum();
        quiz.setTotalMarks(totalMarks);
        quiz.setPassPercent(body.get("passPercent") != null ? ((Number) body.get("passPercent")).doubleValue() : 60);
        quiz.setTimeLimitMinutes(body.get("timeLimitMinutes") != null ? ((Number) body.get("timeLimitMinutes")).intValue() : 30);
        Quiz.Distribution dist = new Quiz.Distribution();
        dist.setEasy(counts.get("easy")); dist.setMedium(counts.get("medium")); dist.setHard(counts.get("hard"));
        quiz.setDistribution(dist);
        quiz.setQuestionsPerAttempt(questions.size());
        quiz.setCreatedBy((String) body.getOrDefault("createdBy", "teacher"));
        quiz.setStatus("published".equals(body.get("status")) ? "published" : "draft");
        quiz.setDiagnostic(isDiagnostic);
        quiz = quizRepository.save(quiz);

        final String qId = quiz.getId();
        List<Question> questionEntities = questions.stream().map(q -> {
            Question entity = new Question();
            entity.setQuizId(qId);
            entity.setTopicId(topicId);
            entity.setCourseId(courseId);
            entity.setType((String) q.getOrDefault("type", "mcq"));
            entity.setText((String) q.get("text"));
            @SuppressWarnings("unchecked")
            List<String> options = (List<String>) q.getOrDefault("options", List.of());
            entity.setOptions(options);
            entity.setCorrectAnswer((String) q.get("correctAnswer"));
            entity.setDifficulty((String) q.getOrDefault("difficulty", "medium"));
            entity.setMarks(q.get("marks") != null ? ((Number) q.get("marks")).doubleValue() : 1);
            entity.setAiGenerated(Boolean.TRUE.equals(q.get("aiGenerated")));
            entity.setExplanation((String) q.get("explanation"));
            return entity;
        }).collect(Collectors.toList());
        questionRepository.saveAll(questionEntities);

        return ApiResponse.ok(quiz);
    }

    @PatchMapping("/{id}")
    public ApiResponse<Quiz> update(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @RequestBody Map<String, Object> body) {
        requireTeacherOrAdmin(user);
        Quiz quiz = quizRepository.findById(id).orElseThrow(() -> AppException.notFound("Quiz not found"));
        Course course = courseRepository.findById(quiz.getCourseId()).orElse(null);
        if (!"admin".equals(user.getRole()) && (course == null || !course.getTeacherId().equals(user.getId()))) {
            throw AppException.forbidden("You do not have access to this quiz");
        }
        if (body.containsKey("title")) quiz.setTitle((String) body.get("title"));
        if (body.containsKey("totalMarks")) quiz.setTotalMarks(((Number) body.get("totalMarks")).doubleValue());
        if (body.containsKey("passPercent")) quiz.setPassPercent(((Number) body.get("passPercent")).doubleValue());
        if (body.containsKey("timeLimitMinutes")) quiz.setTimeLimitMinutes(((Number) body.get("timeLimitMinutes")).intValue());
        if (body.containsKey("status")) quiz.setStatus((String) body.get("status"));
        if (body.containsKey("isDiagnostic")) {
            boolean isDiagnostic = Boolean.TRUE.equals(body.get("isDiagnostic"));
            if (isDiagnostic) {
                quizRepository.findByCourseIdOrderByCreatedAtDesc(quiz.getCourseId()).stream()
                        .filter(q -> q.isDiagnostic() && !q.getId().equals(quiz.getId()))
                        .forEach(q -> { q.setDiagnostic(false); quizRepository.save(q); });
            }
            quiz.setDiagnostic(isDiagnostic);
        }
        return ApiResponse.ok(quizRepository.save(quiz));
    }
}
