package com.knowledgeguru.backend.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "achievements")
public class Achievement {
    private String id;
    private String title;
    private String description;
    private String icon = "emoji_events";
    private String family; // learning | quiz | streak | ai
    private Map<String, Object> criteria;
    private double xpReward = 100;
    public String getId() {
        return this.id;
    }

    public String getTitle() {
        return this.title;
    }

    public String getDescription() {
        return this.description;
    }

    public String getIcon() {
        return this.icon;
    }

    public String getFamily() {
        return this.family;
    }

    public Map<String, Object> getCriteria() {
        return this.criteria;
    }

    public double getXpReward() {
        return this.xpReward;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public void setFamily(String family) {
        this.family = family;
    }

    public void setCriteria(Map<String, Object> criteria) {
        this.criteria = criteria;
    }

    public void setXpReward(double xpReward) {
        this.xpReward = xpReward;
    }
}
