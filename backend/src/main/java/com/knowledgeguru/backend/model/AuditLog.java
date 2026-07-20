package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "audit_logs")
@CompoundIndexes({
    @CompoundIndex(name = "actor_created", def = "{'actorId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "target_type_id", def = "{'targetType': 1, 'targetId': 1}")
})
public class AuditLog {
    private String id;
    private String actorId;
    private String actorRole;
    private String action;
    private String targetType;
    private String targetId;
    private String ipAddress = "";
    private Map<String, Object> metadata;
    private Instant createdAt = Instant.now();
    public String getId() {
        return this.id;
    }

    public String getActorId() {
        return this.actorId;
    }

    public String getActorRole() {
        return this.actorRole;
    }

    public String getAction() {
        return this.action;
    }

    public String getTargetType() {
        return this.targetType;
    }

    public String getTargetId() {
        return this.targetId;
    }

    public String getIpAddress() {
        return this.ipAddress;
    }

    public Map<String, Object> getMetadata() {
        return this.metadata;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
