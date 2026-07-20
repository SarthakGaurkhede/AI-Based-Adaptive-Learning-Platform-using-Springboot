package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
@CompoundIndex(name = "user_read_created", def = "{'userId': 1, 'read': 1, 'createdAt': -1}")
public class Notification {
    private String id;
    private String userId;
    private String type = "announcement"; // performance | warning | rank | study_plan | quiz | announcement
    private String title;
    private String body;
    private String link;
    private boolean read = false;
    private String priority = "normal"; // low | normal | high
    private Instant createdAt = Instant.now();
    public String getId() {
        return this.id;
    }

    public String getUserId() {
        return this.userId;
    }

    public String getType() {
        return this.type;
    }

    public String getTitle() {
        return this.title;
    }

    public String getBody() {
        return this.body;
    }

    public String getLink() {
        return this.link;
    }

    public boolean isRead() {
        return this.read;
    }

    public String getPriority() {
        return this.priority;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
