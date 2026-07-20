package com.knowledgeguru.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    @NotBlank
    private String token;
    @NotBlank @Size(min = 8, max = 128)
    private String password;
    public String getToken() {
        return this.token;
    }

    public String getPassword() {
        return this.password;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
