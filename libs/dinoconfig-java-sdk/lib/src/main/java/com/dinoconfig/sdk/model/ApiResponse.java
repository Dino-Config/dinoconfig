/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Generic API response wrapper for all DinoConfig API responses.
 * 
 * <p>This class wraps the response data from API calls, providing a consistent
 * structure for handling both successful responses and errors.
 * 
 * <p><b>Usage Example:</b>
 * <pre>{@code
 * ApiResponse<Object> response = configAPI.getConfigValue(
 *     "mybrand", "myconfig", "mykey", new RequestOptions()
 * );
 * 
 * if (response.getSuccess()) {
 *     Object value = response.getData();
 *     System.out.println("Value: " + value);
 *     
 *     // Cast to expected type
 *     String stringValue = (String) response.getData();
 *     Boolean boolValue = (Boolean) response.getData();
 *     Map<String, Object> mapValue = (Map<String, Object>) response.getData();
 * } else {
 *     System.out.println("Error: " + response.getMessage());
 * }
 * }</pre>
 * 
 * <p><b>Response Data Types:</b>
 * The {@code data} field can contain any JSON-compatible type:
 * <ul>
 *   <li>{@code String} - for text values</li>
 *   <li>{@code Boolean} - for boolean flags</li>
 *   <li>{@code Number} (Integer, Long, Double) - for numeric values</li>
 *   <li>{@code Map<String, Object>} - for JSON objects</li>
 *   <li>{@code List<Object>} - for JSON arrays</li>
 *   <li>{@code null} - for null values</li>
 * </ul>
 * 
 * @param <T> The type of data contained in the response
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
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
