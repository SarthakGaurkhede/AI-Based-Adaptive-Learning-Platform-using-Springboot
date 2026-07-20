package com.knowledgeguru.backend.auth.dto;


import java.util.Map;

public class AuthResponse {
    private boolean success = true;
    private String accessToken;
    private Map<String, Object> user;
    public AuthResponse(boolean success, String accessToken, Map<String, Object> user) {
        this.success = success;
        this.accessToken = accessToken;
        this.user = user;
    }

    public boolean isSuccess() {
        return this.success;
    }

    public String getAccessToken() {
        return this.accessToken;
    }

    public Map<String, Object> getUser() {
        return this.user;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setUser(Map<String, Object> user) {
        this.user = user;
    }
}
