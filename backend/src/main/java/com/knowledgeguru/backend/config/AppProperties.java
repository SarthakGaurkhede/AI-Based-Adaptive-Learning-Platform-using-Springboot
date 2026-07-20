package com.knowledgeguru.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String clientUrl;
    private Jwt jwt = new Jwt();
    private int bcryptRounds = 12;
    private String emailFrom;
    private Gemini gemini = new Gemini();
    private RateLimit rateLimit = new RateLimit();

    public static class Jwt {
        private String secret;
        private String refreshSecret;
        private int expiresInMinutes = 15;
        private int refreshExpiresInDays = 30;
    public String getSecret() {
        return this.secret;
    }

    public String getRefreshSecret() {
        return this.refreshSecret;
    }

    public int getExpiresInMinutes() {
        return this.expiresInMinutes;
    }

    public int getRefreshExpiresInDays() {
        return this.refreshExpiresInDays;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public void setRefreshSecret(String refreshSecret) {
        this.refreshSecret = refreshSecret;
    }

    public void setExpiresInMinutes(int expiresInMinutes) {
        this.expiresInMinutes = expiresInMinutes;
    }

    public void setRefreshExpiresInDays(int refreshExpiresInDays) {
        this.refreshExpiresInDays = refreshExpiresInDays;
    }
    }

    public static class Gemini {
        private String apiKey;
        private String model = "gemini-2.5-flash";
    public String getApiKey() {
        return this.apiKey;
    }

    public String getModel() {
        return this.model;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public void setModel(String model) {
        this.model = model;
    }
    }

    public static class RateLimit {
        private int windowMinutes = 15;
        private int max = 100;
    public int getWindowMinutes() {
        return this.windowMinutes;
    }

    public int getMax() {
        return this.max;
    }

    public void setWindowMinutes(int windowMinutes) {
        this.windowMinutes = windowMinutes;
    }

    public void setMax(int max) {
        this.max = max;
    }
    }
    public String getClientUrl() {
        return this.clientUrl;
    }

    public Jwt getJwt() {
        return this.jwt;
    }

    public int getBcryptRounds() {
        return this.bcryptRounds;
    }

    public String getEmailFrom() {
        return this.emailFrom;
    }

    public Gemini getGemini() {
        return this.gemini;
    }

    public RateLimit getRateLimit() {
        return this.rateLimit;
    }

    public void setClientUrl(String clientUrl) {
        this.clientUrl = clientUrl;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public void setBcryptRounds(int bcryptRounds) {
        this.bcryptRounds = bcryptRounds;
    }

    public void setEmailFrom(String emailFrom) {
        this.emailFrom = emailFrom;
    }

    public void setGemini(Gemini gemini) {
        this.gemini = gemini;
    }

    public void setRateLimit(RateLimit rateLimit) {
        this.rateLimit = rateLimit;
    }
}
