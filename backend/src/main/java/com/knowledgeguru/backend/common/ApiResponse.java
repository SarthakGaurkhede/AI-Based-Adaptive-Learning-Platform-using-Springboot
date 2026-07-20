package com.knowledgeguru.backend.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/**
 * Generic envelope matching the Node API's `{ success, data, message, meta, ...extra }` shape.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private final boolean success;
    private T data;
    private String message;
    private Map<String, Object> meta;
    // extra top-level fields (accessToken, user, etc.) merged in by controllers via `extra`
    private Map<String, Object> extra;

    private ApiResponse(boolean success) {
        this.success = success;
    }

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> r = new ApiResponse<>(true);
        r.data = data;
        return r;
    }

    public static <T> ApiResponse<T> ok(T data, Map<String, Object> meta) {
        ApiResponse<T> r = new ApiResponse<>(true);
        r.data = data;
        r.meta = meta;
        return r;
    }

    public static <T> ApiResponse<T> message(String message) {
        ApiResponse<T> r = new ApiResponse<>(true);
        r.message = message;
        return r;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> r = new ApiResponse<>(false);
        r.message = message;
        return r;
    }
    public boolean isSuccess() {
        return this.success;
    }

    public T getData() {
        return this.data;
    }

    public String getMessage() {
        return this.message;
    }

    public Map<String, Object> getMeta() {
        return this.meta;
    }

    public Map<String, Object> getExtra() {
        return this.extra;
    }
}
