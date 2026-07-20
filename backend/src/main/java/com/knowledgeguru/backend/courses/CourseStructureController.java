package com.knowledgeguru.backend.courses;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.Course;
import com.knowledgeguru.backend.model.Topic;
import com.knowledgeguru.backend.repository.CourseRepository;
import com.knowledgeguru.backend.repository.TopicRepository;
import com.knowledgeguru.backend.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Equivalent of the Node `course-structure.routes.js` — modules (weeks), topics, resources. */
@RestController
@RequestMapping("/api/v1/courses")
public class CourseStructureController {

    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    public CourseStructureController(CourseRepository courseRepository, TopicRepository topicRepository) {
        this.courseRepository = courseRepository;
        this.topicRepository = topicRepository;
    }

    private static final List<String> RESOURCE_TYPES = List.of("video", "ppt", "notes", "pdf", "link");

    private void requireTeacherOrAdmin(UserPrincipal user) {
        if (!"teacher".equals(user.getRole()) && !"admin".equals(user.getRole())) {
            throw AppException.forbidden("Insufficient permissions");
        }
    }

    private Course loadOwnedCourse(UserPrincipal user, String id) {
        requireTeacherOrAdmin(user);
        Course course = courseRepository.findById(id).orElseThrow(() -> AppException.notFound("Course not found"));
        if (!"admin".equals(user.getRole()) && !course.getTeacherId().equals(user.getId())) {
            throw AppException.forbidden("You do not have access to this course");
        }
        return course;
    }

    private Course.ModuleEntry findModule(Course course, String moduleId) {
        return course.getModules().stream().filter(m -> m.getId().equals(moduleId)).findFirst()
                .orElseThrow(() -> AppException.notFound("Module not found"));
    }

    // ── Modules ──────────────────────────────────────────────
    @PostMapping("/{id}/modules")
    public ApiResponse<Course> addModule(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @RequestBody Map<String, String> body) {
        Course course = loadOwnedCourse(user, id);
        String title = body.get("title");
        if (title == null || title.isBlank()) throw AppException.badRequest("Module title is required");
        Course.ModuleEntry mod = new Course.ModuleEntry();
        mod.setTitle(title.trim());
        mod.setOrder(course.getModules().size());
        course.getModules().add(mod);
        return ApiResponse.ok(courseRepository.save(course));
    }

    @PatchMapping("/{id}/modules/{moduleId}")
    public ApiResponse<Course> updateModule(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id,
                                             @PathVariable String moduleId, @RequestBody Map<String, Object> body) {
        Course course = loadOwnedCourse(user, id);
        Course.ModuleEntry mod = findModule(course, moduleId);
        if (body.containsKey("title")) mod.setTitle((String) body.get("title"));
        if (body.containsKey("order")) mod.setOrder(((Number) body.get("order")).intValue());
        return ApiResponse.ok(courseRepository.save(course));
    
    }

    @DeleteMapping("/{id}/modules/{moduleId}")
    public ApiResponse<Course> deleteModule(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @PathVariable String moduleId) {
        Course course = loadOwnedCourse(user, id);
        findModule(course, moduleId);
        course.getModules().removeIf(m -> m.getId().equals(moduleId));
        Course saved = courseRepository.save(course);
        topicRepository.deleteByCourseIdAndModuleId(course.getId(), moduleId);
        return ApiResponse.ok(saved);
    }

    // ── Topics ───────────────────────────────────────────────
    @GetMapping("/{id}/topics")
    public ApiResponse<List<Topic>> listTopics(@PathVariable String id) {
        return ApiResponse.ok(topicRepository.findByCourseIdOrderByModuleIdAscOrderAsc(id));
    }

    @PostMapping("/{id}/topics")
    public ApiResponse<Topic> addTopic(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @RequestBody Map<String, Object> body) {
        Course course = loadOwnedCourse(user, id);
        String moduleId = (String) body.get("moduleId");
        String title = (String) body.get("title");
        String difficulty = (String) body.get("difficulty");
        if (moduleId == null || title == null || title.isBlank()) throw AppException.badRequest("moduleId and title are required");
        findModule(course, moduleId);
        long count = topicRepository.countByCourseIdAndModuleId(course.getId(), moduleId);
        Topic topic = new Topic();
        topic.setCourseId(course.getId());
        topic.setModuleId(moduleId);
        topic.setTitle(title.trim());
        topic.setDifficulty(difficulty != null ? difficulty : "medium");
        topic.setOrder((int) count);
        return ApiResponse.ok(topicRepository.save(topic));
    }

    @PatchMapping("/{id}/topics/{topicId}")
    public ApiResponse<Topic> updateTopic(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id,
                                           @PathVariable String topicId, @RequestBody Map<String, Object> body) {
        loadOwnedCourse(user, id);
        Topic topic = topicRepository.findByIdAndCourseId(topicId, id).orElseThrow(() -> AppException.notFound("Topic not found"));
        if (body.containsKey("title")) topic.setTitle((String) body.get("title"));
        if (body.containsKey("difficulty")) topic.setDifficulty((String) body.get("difficulty"));
        if (body.containsKey("order")) topic.setOrder(((Number) body.get("order")).intValue());
        return ApiResponse.ok(topicRepository.save(topic));
    }

    @DeleteMapping("/{id}/topics/{topicId}")
    public ApiResponse<Map<String, Object>> deleteTopic(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @PathVariable String topicId) {
        loadOwnedCourse(user, id);
        Topic topic = topicRepository.findByIdAndCourseId(topicId, id).orElseThrow(() -> AppException.notFound("Topic not found"));
        topicRepository.delete(topic);
        return ApiResponse.ok(Map.of("deleted", true));
    }

    // ── Resources ────────────────────────────────────────────
    @PostMapping("/{id}/topics/{topicId}/resources")
    public ApiResponse<Topic> addResource(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id,
                                           @PathVariable String topicId, @RequestBody Map<String, String> body) {
        loadOwnedCourse(user, id);
        Topic topic = topicRepository.findByIdAndCourseId(topicId, id).orElseThrow(() -> AppException.notFound("Topic not found"));
        String type = body.get("type");
        String title = body.get("title");
        String url = body.get("url");
        String content = body.get("content");
        if (!RESOURCE_TYPES.contains(type)) throw AppException.badRequest("type must be one of: " + String.join(", ", RESOURCE_TYPES));
        if (title == null || title.isBlank()) throw AppException.badRequest("title is required");
        if ("notes".equals(type) && (content == null || content.isBlank())) throw AppException.badRequest("content is required for notes");
        if (!"notes".equals(type) && (url == null || url.isBlank())) throw AppException.badRequest("url is required for this resource type");

        Topic.Resource resource = new Topic.Resource();
        resource.setType(type);
        resource.setTitle(title.trim());
        resource.setUrl(url != null ? url.trim() : null);
        resource.setContent(content);
        resource.setOrder(topic.getResources().size());
        topic.getResources().add(resource);
        return ApiResponse.ok(topicRepository.save(topic));
    }

    @PatchMapping("/{id}/topics/{topicId}/resources/{resourceId}")
    public ApiResponse<Topic> updateResource(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id, @PathVariable String topicId,
                                              @PathVariable String resourceId, @RequestBody Map<String, Object> body) {
        loadOwnedCourse(user, id);
        Topic topic = topicRepository.findByIdAndCourseId(topicId, id).orElseThrow(() -> AppException.notFound("Topic not found"));
        Topic.Resource resource = topic.getResources().stream().filter(r -> r.getId().equals(resourceId)).findFirst()
                .orElseThrow(() -> AppException.notFound("Resource not found"));
        if (body.containsKey("title")) resource.setTitle((String) body.get("title"));
        if (body.containsKey("url")) resource.setUrl((String) body.get("url"));
        if (body.containsKey("content")) resource.setContent((String) body.get("content"));
        if (body.containsKey("order")) resource.setOrder(((Number) body.get("order")).intValue());
        return ApiResponse.ok(topicRepository.save(topic));
    }

    @DeleteMapping("/{id}/topics/{topicId}/resources/{resourceId}")
    public ApiResponse<Topic> deleteResource(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id,
                                              @PathVariable String topicId, @PathVariable String resourceId) {
        loadOwnedCourse(user, id);
        Topic topic = topicRepository.findByIdAndCourseId(topicId, id).orElseThrow(() -> AppException.notFound("Topic not found"));
        topic.getResources().removeIf(r -> r.getId().equals(resourceId));
        return ApiResponse.ok(topicRepository.save(topic));
    }
}
