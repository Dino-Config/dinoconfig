package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Generic API response wrapper.
 * @param <T> The type of data contained in the response
 */
public class ApiResponse<T> {
    
    @JsonProperty("data")
    private T data;
    
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("message")
    private String message;
    
    /**
     * Default constructor
     */
    public ApiResponse() {}
    
    /**
     * Constructor with data and success flag
     */
    public ApiResponse(T data, Boolean success) {
        this.data = data;
        this.success = success;
    }
    
    /**
     * Constructor with all fields
     */
    public ApiResponse(T data, Boolean success, String message) {
        this.data = data;
        this.success = success;
        this.message = message;
    }
    
    // Getters and Setters
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
