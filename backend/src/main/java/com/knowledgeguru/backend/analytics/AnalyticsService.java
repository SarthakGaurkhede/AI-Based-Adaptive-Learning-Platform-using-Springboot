package com.knowledgeguru.backend.analytics;

import com.knowledgeguru.backend.model.*;
import com.knowledgeguru.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Equivalent of the Node `analytics.service.js`. */
@Service
public class AnalyticsService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final CourseRepository courseRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final UserRepository userRepository;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    public Map<String, Object> getStudentAnalytics(String studentId) {
        long coursesEnrolled = enrollmentRepository.countByStudentId(studentId);
        long coursesCompleted = enrollmentRepository.countByStudentIdAndStatus(studentId, "completed");

        var attempts = mongoTemplate.find(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria.where("studentId").is(studentId))
                        .with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "submittedAt")),
                QuizAttempt.class);

        double avgQuizScore = attempts.isEmpty() ? 0 :
                attempts.stream().mapToDouble(QuizAttempt::getPercentScore).average().orElse(0);
        double studyHours = attempts.stream()
                .mapToLong(a -> a.getDurationSeconds() != null ? a.getDurationSeconds() : 0)
                .sum() / 3600.0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("coursesEnrolled", coursesEnrolled);
        result.put("coursesCompleted", coursesCompleted);
        result.put("avgQuizScore", Math.round(avgQuizScore));
        result.put("studyHours", Math.round(studyHours * 10) / 10.0);
        result.put("recentAttempts", attempts.stream().limit(10).toList());
        return result;
    }

    public Map<String, Object> getTeacherAnalytics(String teacherId) {
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        List<String> courseIds = courses.stream().map(Course::getId).toList();

        long totalStudents = courseIds.isEmpty() ? 0 : mongoTemplate.count(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria.where("courseId").in(courseIds)),
                CourseEnrollment.class);

        var gaps = courseIds.isEmpty() ? List.<KnowledgeGap>of() : knowledgeGapRepository.findByCourseIdInAndStatus(courseIds, "open");

        double avgRating = courses.isEmpty() ? 0 : courses.stream().mapToDouble(Course::getRating).average().orElse(0);

        // Average performance across quiz attempts for this teacher's courses.
        var quizIds = mongoTemplate.findDistinct(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria.where("courseId").in(courseIds)),
                "_id", Quiz.class, String.class);
        double avgPerformance = 0;
        if (!quizIds.isEmpty()) {
            var attempts = mongoTemplate.find(
                    org.springframework.data.mongodb.core.query.Query.query(
                            org.springframework.data.mongodb.core.query.Criteria.where("quizId").in(quizIds)),
                    QuizAttempt.class);
            avgPerformance = attempts.isEmpty() ? 0 : attempts.stream().mapToDouble(QuizAttempt::getPercentScore).average().orElse(0);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStudents", totalStudents);
        result.put("avgPerformance", Math.round(avgPerformance));
        result.put("totalGaps", gaps.size());
        result.put("totalCourses", courses.size());
        result.put("avgRating", Math.round(avgRating * 10) / 10.0);
        return result;
    }

    public Map<String, Object> getPlatformAnalytics() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalUsers", userRepository.count());
        result.put("totalCourses", courseRepository.countByStatus("published"));
        result.put("totalStudents", userRepository.countByRole("student"));
        result.put("totalTeachers", userRepository.countByRole("teacher"));
        result.put("suspendedUsers", userRepository.countByStatus("suspended"));
        result.put("totalAttempts", quizAttemptRepository.count());
        return result;
    }
    public AnalyticsService(CourseEnrollmentRepository enrollmentRepository, QuizAttemptRepository quizAttemptRepository, CourseRepository courseRepository, KnowledgeGapRepository knowledgeGapRepository, UserRepository userRepository, org.springframework.data.mongodb.core.MongoTemplate mongoTemplate) {
        this.enrollmentRepository = enrollmentRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.courseRepository = courseRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
    }
}
