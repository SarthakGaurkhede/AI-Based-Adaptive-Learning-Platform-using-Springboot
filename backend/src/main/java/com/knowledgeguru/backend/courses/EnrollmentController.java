package com.knowledgeguru.backend.courses;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.Course;
import com.knowledgeguru.backend.model.CourseEnrollment;
import com.knowledgeguru.backend.repository.CourseEnrollmentRepository;
import com.knowledgeguru.backend.repository.CourseRepository;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/** Equivalent of the Node `enrollment.routes.js`. */
@RestController
@RequestMapping("/api/v1/courses")
public class EnrollmentController {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    private void requireStudent(UserPrincipal user) {
        if (!"student".equals(user.getRole())) throw AppException.forbidden("Insufficient permissions");
    }

    @PostMapping("/{id}/enroll")
    public ApiResponse<CourseEnrollment> enroll(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        requireStudent(user);
        Course course = courseRepository.findById(id).orElseThrow(() -> AppException.notFound("Course not found"));
        if (!"published".equals(course.getStatus())) throw AppException.badRequest("Course is not available for enrollment");
        if ("private".equals(course.getVisibility()) && !course.getInvitedStudentEmails().contains(user.getEmail())) {
            throw AppException.forbidden("You are not invited to this private course");
        }
        CourseEnrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(id, user.getId())
                .orElseGet(() -> {
                    CourseEnrollment e = new CourseEnrollment();
                    e.setCourseId(id);
                    e.setStudentId(user.getId());
                    e.setEnrolledAt(Instant.now());
                    return enrollmentRepository.save(e);
                });
        course.setEnrollmentCount(course.getEnrollmentCount() + 1);
        courseRepository.save(course);
        return ApiResponse.ok(enrollment);
    }

    @GetMapping("/{id}/progress")
    public ApiResponse<CourseEnrollment> progress(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        requireStudent(user);
        CourseEnrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(id, user.getId())
                .orElseThrow(() -> AppException.notFound("Not enrolled in this course"));
        return ApiResponse.ok(enrollment);
    }

    @GetMapping("/enrolled")
    public ApiResponse<List<CourseEnrollment>> enrolled(@AuthenticationPrincipal UserPrincipal user) {
        requireStudent(user);
        return ApiResponse.ok(enrollmentRepository.findByStudentIdAndStatusOrderByEnrolledAtDesc(user.getId(), "active"));
    }
    public EnrollmentController(CourseRepository courseRepository, CourseEnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }
}
