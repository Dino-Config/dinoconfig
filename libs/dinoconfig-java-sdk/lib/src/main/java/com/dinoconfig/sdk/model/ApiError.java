package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * API error model representing error responses from the API.
 */
public class ApiError extends RuntimeException {
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("status")
    private Integer status;
    
    @JsonProperty("code")
    private String code;
    
    /**
     * Default constructor
     */
    public ApiError() {}
    
    /**
     * Constructor with message and status
     */
    public ApiError(String message, Integer status) {
        super(message);
        this.message = message;
        this.status = status;
    }
    
    /**
     * Constructor with all fields
     */
    public ApiError(String message, Integer status, String code) {
        super(message);
        this.message = message;
        this.status = status;
        this.code = code;
    }
    
    // Getters and Setters
    @Override
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
}
