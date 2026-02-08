/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Generic API response wrapper for DinoConfig API responses.
 * 
 * @param <T> The type of data contained in the response
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 * @deprecated As of version 2.0.0, the SDK now returns values directly without
 *             the ApiResponse wrapper. Methods throw exceptions on errors instead
 *             of using a success flag. This class will be removed in a future version.
 *             
 *             <p><b>Migration:</b>
 *             <pre>{@code
 *             // Old (deprecated):
 *             ApiResponse<Object> response = configAPI.getValue("Brand.Config.key");
 *             if (response.getSuccess()) {
 *                 Object value = response.getData();
 *             }
 *             
 *             // New (recommended):
 *             String value = configAPI.getValue("Brand.Config.key", String.class);
 *             }</pre>
 */
@Deprecated(since = "2.0.0", forRemoval = true)
public class ApiResponse<T> {
    
    /**
     * The response payload containing the requested data.
     * 
     * <p>For successful requests, this contains the configuration value
     * or other requested data. For failed requests, this may be {@code null}.
     */
    @JsonProperty("data")
    private T data;
    
    /**
     * Indicates whether the request was successful.
     * 
     * <p>{@code true} for successful 2xx responses, {@code false} otherwise.
     */
    @JsonProperty("success")
    private Boolean success;
    
    /**
     * Optional message providing additional context.
     * 
     * <p>Typically populated for errors or warnings. May be {@code null}
     * for successful responses.
     */
    @JsonProperty("message")
    private String message;
    
    /**
     * Default constructor for Jackson deserialization.
     */
    public ApiResponse() {
    }
    
    /**
     * Constructor with data and success flag.
     * 
     * @param data The response data
     * @param success Whether the request was successful
     */
    public ApiResponse(T data, Boolean success) {
        this.data = data;
        this.success = success;
    }
    
    /**
     * Constructor with all fields.
     * 
     * @param data The response data
     * @param success Whether the request was successful
     * @param message Optional message (usually for errors)
     */
    public ApiResponse(T data, Boolean success, String message) {
        this.data = data;
        this.success = success;
        this.message = message;
    }
    
    /**
     * Returns the response data.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * Object value = response.getData();
     * 
     * // Type casting based on expected type
     * if (value instanceof String) {
     *     String stringValue = (String) value;
     * } else if (value instanceof Boolean) {
     *     Boolean boolValue = (Boolean) value;
     * } else if (value instanceof Map) {
     *     Map<String, Object> mapValue = (Map<String, Object>) value;
     * }
     * }</pre>
     * 
     * @return The response data, or {@code null} if not present
     */
    public T getData() {
        return data;
    }
    
    /**
     * Sets the response data.
     * 
     * @param data The response data
     */
    public void setData(T data) {
        this.data = data;
    }
    
    /**
     * Returns whether the request was successful.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * if (response.getSuccess()) {
     *     // Process successful response
     *     Object value = response.getData();
     * } else {
     *     // Handle error
     *     System.err.println("Error: " + response.getMessage());
     * }
     * }</pre>
     * 
     * @return {@code true} if the request was successful, {@code false} otherwise
     */
    public Boolean getSuccess() {
        return success;
    }
    
    /**
     * Sets the success flag.
     * 
     * @param success Whether the request was successful
     */
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    /**
     * Returns the optional message.
     * 
     * <p>This is typically populated for error responses to provide
     * details about what went wrong.
     * 
     * @return The message, or {@code null} if not present
     */
    public String getMessage() {
        return message;
    }
    
    /**
     * Sets the message.
     * 
     * @param message The message
     */
    public void setMessage(String message) {
        this.message = message;
    }
    
    /**
     * Checks if the response was successful and contains data.
     * 
     * @return {@code true} if successful and data is not null
     */
    public boolean hasData() {
        return Boolean.TRUE.equals(success) && data != null;
    }
    
    @Override
    public String toString() {
        return "ApiResponse{" +
                "data=" + data +
                ", success=" + success +
                ", message='" + message + '\'' +
                '}';
    }
}
