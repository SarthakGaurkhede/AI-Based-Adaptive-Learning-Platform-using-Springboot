package com.knowledgeguru.backend.search;

import com.knowledgeguru.backend.common.ApiResponse;
import com.knowledgeguru.backend.model.Course;
import com.knowledgeguru.backend.model.Topic;
import com.knowledgeguru.backend.repository.CourseRepository;
import com.knowledgeguru.backend.repository.TopicRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** Equivalent of the Node `search.routes.js` — full-text-ish search over published courses/topics. */
@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final MongoTemplate mongoTemplate;

    @GetMapping
    public ApiResponse<Map<String, Object>> search(@RequestParam String q, @RequestParam(defaultValue = "10") int limit) {
        Pattern pattern = Pattern.compile(Pattern.quote(q), Pattern.CASE_INSENSITIVE);

        Query courseQuery = Query.query(Criteria.where("status").is("published").andOperator(
                new Criteria().orOperator(
                        Criteria.where("title").regex(pattern),
                        Criteria.where("description").regex(pattern),
                        Criteria.where("tags").regex(pattern)
                )
        )).limit(limit);
        List<Course> courses = mongoTemplate.find(courseQuery, Course.class);

        Query topicQuery = Query.query(Criteria.where("title").regex(pattern)).limit(limit);
        List<Topic> topics = mongoTemplate.find(topicQuery, Topic.class);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("courses", courses);
        result.put("topics", topics);
        return ApiResponse.ok(result);
    }
    public SearchController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
}
