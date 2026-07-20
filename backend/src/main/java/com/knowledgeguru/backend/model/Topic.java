package com.knowledgeguru.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "topics")
@CompoundIndex(name = "course_module_order", def = "{'courseId': 1, 'moduleId': 1, 'order': 1}")
public class Topic {
    @Id
    private String id;

    @Indexed
    private String courseId;
    private String moduleId;

    private String title;
    private int order = 0;
    private String difficulty = "medium"; // easy | medium | hard
    private List<String> prerequisiteTopicIds = new ArrayList<>();
    private List<Resource> resources = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public static class Resource {
        private String id = new org.bson.types.ObjectId().toString();
        private String type; // video | ppt | notes | pdf | link
        private String title;
        private String url;
        private String content;
        private int order = 0;
        private Instant createdAt = Instant.now();
    public String getId() {
        return this.id;
    }

    public String getType() {
        return this.type;
    }

    public String getTitle() {
        return this.title;
    }

    public String getUrl() {
        return this.url;
    }

    public String getContent() {
        return this.content;
    }

    public int getOrder() {
        return this.order;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    }
    public String getId() {
        return this.id;
    }

    public String getCourseId() {
        return this.courseId;
    }

    public String getModuleId() {
        return this.moduleId;
    }

    public String getTitle() {
        return this.title;
    }

    public int getOrder() {
        return this.order;
    }

    public String getDifficulty() {
        return this.difficulty;
    }

    public List<String> getPrerequisiteTopicIds() {
        return this.prerequisiteTopicIds;
    }

    public List<Resource> getResources() {
        return this.resources;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Instant getUpdatedAt() {
        return this.updatedAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setPrerequisiteTopicIds(List<String> prerequisiteTopicIds) {
        this.prerequisiteTopicIds = prerequisiteTopicIds;
    }

    public void setResources(List<Resource> resources) {
        this.resources = resources;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
