/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Structured error representing API error responses from DinoConfig.
 * 
 * <p>This exception is thrown when the API returns an error response (4xx or 5xx status codes).
 * It extends {@link RuntimeException} for convenient error handling without requiring
 * checked exception declarations.
 * 
 * <p><b>Error Handling Example:</b>
 * <pre>{@code
 * try {
 *     ApiResponse<Object> response = configAPI.getConfigValue(
 *         "mybrand", "myconfig", "mykey", new RequestOptions()
 *     );
 * } catch (ApiError e) {
 *     System.err.println("Status: " + e.getStatus());
 *     System.err.println("Message: " + e.getMessage());
 *     System.err.println("Code: " + e.getCode());
 *     
 *     // Handle specific status codes
 *     switch (e.getStatus()) {
 *         case 401:
 *             System.err.println("Unauthorized - check your API key");
 *             break;
 *         case 403:
 *             System.err.println("Forbidden - insufficient permissions");
 *             break;
 *         case 404:
 *             System.err.println("Not found - check brand/config/key names");
 *             break;
 *         case 429:
 *             System.err.println("Rate limited - slow down requests");
 *             break;
 *         case 500:
 *             System.err.println("Server error - try again later");
 *             break;
 *     }
 *     
 *     // Handle specific error codes
 *     if ("CONFIG_NOT_FOUND".equals(e.getCode())) {
 *         // Handle specific error case
 *     }
 * }
 * }</pre>
 * 
 * <p><b>Common HTTP Status Codes:</b>
 * <ul>
 *   <li>{@code 400} - Bad Request: Invalid request parameters</li>
 *   <li>{@code 401} - Unauthorized: Invalid or expired API key/token</li>
 *   <li>{@code 403} - Forbidden: Insufficient permissions</li>
 *   <li>{@code 404} - Not Found: Resource doesn't exist</li>
 *   <li>{@code 429} - Too Many Requests: Rate limit exceeded</li>
 *   <li>{@code 500} - Internal Server Error: Server-side error</li>
 *   <li>{@code 502} - Bad Gateway: Upstream server error</li>
 *   <li>{@code 503} - Service Unavailable: Service temporarily unavailable</li>
 * </ul>
 * 
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public class ApiError extends RuntimeException {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * Human-readable error message describing what went wrong.
     */
    @JsonProperty("message")
    private String message;
    
    /**
     * HTTP status code of the error response.
     */
    @JsonProperty("status")
    private Integer status;
    
    /**
     * Optional error code for programmatic error handling.
     * 
     * <p>Examples: {@code "CONFIG_NOT_FOUND"}, {@code "INVALID_API_KEY"},
     * {@code "RATE_LIMITED"}, {@code "VALIDATION_ERROR"}
     */
    @JsonProperty("code")
    private String code;
    
    /**
     * Default constructor for Jackson deserialization.
     */
    public ApiError() {
        super();
    }
    
    /**
     * Constructor with message and status code.
     * 
     * @param message Human-readable error message
     * @param status HTTP status code
     */
    public ApiError(String message, Integer status) {
        super(message);
        this.message = message;
        this.status = status;
    }
    
    /**
     * Constructor with all fields.
     * 
     * @param message Human-readable error message
     * @param status HTTP status code
     * @param code Optional error code for programmatic handling
     */
    public ApiError(String message, Integer status, String code) {
        super(message);
        this.message = message;
        this.status = status;
        this.code = code;
    }
    
    /**
     * Returns the error message.
     * 
     * @return Human-readable error message
     */
    @Override
    public String getMessage() {
        return message;
    }
    
    /**
     * Sets the error message.
     * 
     * @param message Human-readable error message
     */
    public void setMessage(String message) {
        this.message = message;
    }
    
    /**
     * Returns the HTTP status code.
     * 
     * <p><b>Common status codes:</b>
     * <ul>
     *   <li>{@code 400} - Bad Request</li>
     *   <li>{@code 401} - Unauthorized</li>
     *   <li>{@code 403} - Forbidden</li>
     *   <li>{@code 404} - Not Found</li>
     *   <li>{@code 429} - Too Many Requests</li>
     *   <li>{@code 500} - Internal Server Error</li>
     * </ul>
     * 
     * @return HTTP status code
     */
    public Integer getStatus() {
        return status;
    }
    
    /**
     * Sets the HTTP status code.
     * 
     * @param status HTTP status code
     */
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    /**
     * Returns the optional error code.
     * 
     * <p>Error codes can be used for programmatic error handling when
     * the status code alone is not specific enough.
     * 
     * @return Error code, or {@code null} if not provided
     */
    public String getCode() {
        return code;
    }
    
    /**
     * Sets the error code.
     * 
     * @param code Error code for programmatic handling
     */
    public void setCode(String code) {
        this.code = code;
    }
    
    /**
     * Checks if this is a client error (4xx status code).
     * 
     * @return {@code true} if status is between 400 and 499
     */
    public boolean isClientError() {
        return status != null && status >= 400 && status < 500;
    }
    
    /**
     * Checks if this is a server error (5xx status code).
     * 
     * @return {@code true} if status is between 500 and 599
     */
    public boolean isServerError() {
        return status != null && status >= 500 && status < 600;
    }
    
    /**
     * Checks if this error is retryable.
     * 
     * <p>Server errors (5xx) and rate limiting (429) are typically retryable.
     * Client errors (4xx except 429) are not retryable.
     * 
     * @return {@code true} if the request can be retried
     */
    public boolean isRetryable() {
        if (status == null) {
            return false;
        }
        return status == 429 || (status >= 500 && status < 600);
    }
    
    @Override
    public String toString() {
        return "ApiError{" +
                "message='" + message + '\'' +
                ", status=" + status +
                ", code='" + code + '\'' +
                '}';
    }
}
