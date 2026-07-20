package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "ai_usages")
@CompoundIndexes({
    @CompoundIndex(name = "user_created", def = "{'userId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "module_created", def = "{'module': 1, 'createdAt': -1}")
})
public class AiUsage {
    private String id;
    private String userId;
    private String module; // tutor | study-plan | quiz-gen | course-gen | flashcards | notes | gap-detection
    private long promptTokens = 0;
    private long completionTokens = 0;
    private double costUsd = 0;
    private String model = "gemini-2.5-flash";
    private String requestId = "";
    private String status = "success"; // success | error | blocked_by_safety_filter
    private Instant createdAt = Instant.now();
    public String getId() {
        return this.id;
    }

    public String getUserId() {
        return this.userId;
    }

    public String getModule() {
        return this.module;
    }

    public long getPromptTokens() {
        return this.promptTokens;
    }

    public long getCompletionTokens() {
        return this.completionTokens;
    }

    public double getCostUsd() {
        return this.costUsd;
    }

    public String getModel() {
        return this.model;
    }

    public String getRequestId() {
        return this.requestId;
    }

    public String getStatus() {
        return this.status;
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

    public void setModule(String module) {
        this.module = module;
    }

    public void setPromptTokens(long promptTokens) {
        this.promptTokens = promptTokens;
    }

    public void setCompletionTokens(long completionTokens) {
        this.completionTokens = completionTokens;
    }

    public void setCostUsd(double costUsd) {
        this.costUsd = costUsd;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
