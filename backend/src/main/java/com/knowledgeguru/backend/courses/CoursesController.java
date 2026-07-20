package com.knowledgeguru.backend.courses;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.Course;
import com.knowledgeguru.backend.repository.CourseRepository;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/** Equivalent of the Node `courses.controller.js` + `courses.routes.js`. */
@RestController
@RequestMapping("/api/v1/courses")
public class CoursesController {

    private final CourseRepository courseRepository;
    public CoursesController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    private void requireTeacherOrAdmin(UserPrincipal user) {
        if (!"teacher".equals(user.getRole()) && !"admin".equals(user.getRole())) {
            throw AppException.forbidden("Insufficient permissions");
        }
    }

    @GetMapping
    public Map<String, Object> list(@AuthenticationPrincipal UserPrincipal user,
                                     @RequestParam(required = false) String category,
                                     @RequestParam(required = false) String level,
                                     @RequestParam(required = false) String search,
                                     @RequestParam(defaultValue = "1") int page,
                                     @RequestParam(defaultValue = "12") int limit,
                                     @RequestParam(required = false) String mine) {
        var pageable = PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        org.springframework.data.domain.Page<Course> result;

        if ("true".equals(mine) && user != null && "teacher".equals(user.getRole())) {
            result = courseRepository.findByTeacherId(user.getId(), pageable);
        } else if (category != null) {
            result = courseRepository.findByStatusAndVisibilityAndCategory("published", "public", category, pageable);
        } else if (level != null) {
            result = courseRepository.findByStatusAndVisibilityAndLevel("published", "public", level, pageable);
        } else {
            result = courseRepository.findByStatusAndVisibility("published", "public", pageable);
        }

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("total", result.getTotalElements());
        meta.put("page", page);
        meta.put("pages", result.getTotalPages());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("data", result.getContent());
        out.put("meta", meta);
        return out;
    
    }

    @GetMapping("/{id}")
    public ApiResponse<Course> getOne(@PathVariable String id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> AppException.notFound("Course not found"));
        return ApiResponse.ok(course);
    }

    @PostMapping
    public ApiResponse<Course> create(@AuthenticationPrincipal UserPrincipal user, @RequestBody Course course) {
        requireTeacherOrAdmin(user);
        course.setId(null);
        course.setTeacherId(user.getId());
        return ApiResponse.ok(courseRepository.save(course));
    }

    @PatchMapping("/{id}")
    public ApiResponse<Course> update(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @RequestBody Map<String, Object> updates) {
        requireTeacherOrAdmin(user);
        Course course = courseRepository.findById(id).orElseThrow(() -> AppException.notFound("Course not found or access denied"));
        if (!"admin".equals(user.getRole()) && !course.getTeacherId().equals(user.getId())) {
            throw AppException.notFound("Course not found or access denied");
        }
        applyUpdates(course, updates);
        return ApiResponse.ok(courseRepository.save(course));
    }

    @SuppressWarnings("unchecked")
    static void applyUpdates(Course course, Map<String, Object> updates) {
        if (updates.containsKey("title")) course.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) course.setDescription((String) updates.get("description"));
        if (updates.containsKey("level")) course.setLevel((String) updates.get("level"));
        if (updates.containsKey("category")) course.setCategory((String) updates.get("category"));
        if (updates.containsKey("tags")) course.setTags((java.util.List<String>) updates.get("tags"));
        if (updates.containsKey("visibility")) course.setVisibility((String) updates.get("visibility"));
        if (updates.containsKey("invitedStudentEmails")) course.setInvitedStudentEmails((java.util.List<String>) updates.get("invitedStudentEmails"));
        if (updates.containsKey("status")) course.setStatus((String) updates.get("status"));
        if (updates.containsKey("thumbnail")) course.setThumbnail((String) updates.get("thumbnail"));
        if (updates.containsKey("aiGenerated")) course.setAiGenerated((Boolean) updates.get("aiGenerated"));
    }
}
