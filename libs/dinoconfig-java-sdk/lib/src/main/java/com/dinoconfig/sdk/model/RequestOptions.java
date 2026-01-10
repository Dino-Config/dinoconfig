/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import java.util.HashMap;
import java.util.Map;

/**
 * Options for customizing individual API requests.
 * 
 * <p>This class allows you to customize request behavior on a per-request basis,
 * including timeouts, retries, and custom headers.
 * 
 * <p><b>Basic Usage:</b>
 * <pre>{@code
 * // Empty options (use defaults)
 * RequestOptions options = new RequestOptions();
 * 
 * ApiResponse<Object> response = configAPI.getConfigValue(
 *     "mybrand", "myconfig", "mykey", options
 * );
 * }</pre>
 * 
 * <p><b>Custom Timeout:</b>
 * <pre>{@code
 * RequestOptions options = new RequestOptions();
 * options.setTimeout(30000L);  // 30 second timeout
 * 
 * ApiResponse<Object> response = configAPI.getConfigValue(
 *     "mybrand", "myconfig", "mykey", options
 * );
 * }</pre>
 * 
 * <p><b>With Retries:</b>
 * <pre>{@code
 * RequestOptions options = new RequestOptions();
 * options.setRetries(3);  // Retry up to 3 times on failure
 * 
 * ApiResponse<Object> response = configAPI.getConfigValue(
 *     "mybrand", "myconfig", "mykey", options
 * );
 * }</pre>
 * 
 * <p><b>With Custom Headers:</b>
 * <pre>{@code
 * RequestOptions options = new RequestOptions();
 * options.setHeaders(Map.of(
 *     "X-Request-ID", UUID.randomUUID().toString(),
 *     "X-Custom-Header", "custom-value"
 * ));
 * 
 * ApiResponse<Object> response = configAPI.getConfigValue(
 *     "mybrand", "myconfig", "mykey", options
 * );
 * }</pre>
 * 
 * <p><b>Full Example:</b>
 * <pre>{@code
 * RequestOptions options = new RequestOptions();
 * options.setTimeout(30000L);  // 30 second timeout
 * options.setRetries(5);       // Retry up to 5 times
 * options.setHeaders(Map.of(
 *     "X-Request-ID", UUID.randomUUID().toString()
 * ));
 * 
 * ApiResponse<Object> response = configAPI.getConfigValue(
 *     "mybrand", "critical-config", "database-url", options
 * );
 * }</pre>
 * 
 * <p><b>Retry Behavior:</b>
 * <ul>
 *   <li>Only server errors (5xx) and network errors are retried</li>
 *   <li>Client errors (4xx) are NOT retried (except 429 rate limiting)</li>
 *   <li>Retries use exponential backoff: 1s, 2s, 4s, 8s, etc.</li>
 * </ul>
 * 
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public class RequestOptions {
    
    /**
     * Custom headers to include in this specific request.
     * 
     * <p>These headers are merged with the default headers. If a header
     * key exists in both, the value from this map takes precedence.
     */
    private Map<String, String> headers;
    
    /**
     * Request timeout in milliseconds.
     * 
     * <p>Overrides the default timeout set during SDK initialization.
     * If {@code null}, the SDK default timeout is used.
     */
    private Long timeout;
    
    /**
     * Number of retry attempts for failed requests.
     * 
     * <p>Uses exponential backoff between retries:
     * <ul>
     *   <li>1st retry: 1 second delay</li>
     *   <li>2nd retry: 2 seconds delay</li>
     *   <li>3rd retry: 4 seconds delay</li>
     *   <li>And so on...</li>
     * </ul>
     * 
     * <p>Default: {@code 0} (no retries)
     */
    private Integer retries;
    
    /**
     * Default constructor.
     * 
     * <p>Creates options with no customizations (uses SDK defaults).
     */
    public RequestOptions() {
    }
    
    /**
     * Constructor with all fields.
     * 
     * @param headers Custom headers for this request
     * @param timeout Request timeout in milliseconds
     * @param retries Number of retry attempts
     */
    public RequestOptions(Map<String, String> headers, Long timeout, Integer retries) {
        this.headers = headers;
        this.timeout = timeout;
        this.retries = retries;
    }
    
    /**
     * Returns the custom headers.
     * 
     * @return Map of header names to values, or {@code null} if not set
     */
    public Map<String, String> getHeaders() {
        return headers;
    }
    
    /**
     * Sets custom headers for this request.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * options.setHeaders(Map.of(
     *     "X-Request-ID", "unique-id-123",
     *     "X-Custom-Header", "custom-value"
     * ));
     * }</pre>
     * 
     * @param headers Map of header names to values
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions setHeaders(Map<String, String> headers) {
        this.headers = headers;
        return this;
    }
    
    /**
     * Adds a single header to this request.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * options.addHeader("X-Request-ID", "unique-id-123")
     *        .addHeader("X-Custom-Header", "value");
     * }</pre>
     * 
     * @param key Header name
     * @param value Header value
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions addHeader(String key, String value) {
        if (this.headers == null) {
            this.headers = new HashMap<>();
        }
        this.headers.put(key, value);
        return this;
    }
    
    /**
     * Returns the request timeout.
     * 
     * @return Timeout in milliseconds, or {@code null} to use SDK default
     */
    public Long getTimeout() {
        return timeout;
    }
    
    /**
     * Sets the request timeout.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * options.setTimeout(30000L);  // 30 second timeout
     * }</pre>
     * 
     * @param timeout Timeout in milliseconds
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions setTimeout(Long timeout) {
        this.timeout = timeout;
        return this;
    }
    
    /**
     * Returns the number of retry attempts.
     * 
     * @return Number of retries, or {@code null} to use SDK default (0)
     */
    public Integer getRetries() {
        return retries;
    }
    
    /**
     * Sets the number of retry attempts for failed requests.
     * 
     * <p><b>Note:</b> Only server errors (5xx) and network errors are retried.
     * Client errors (4xx) are not retried.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * options.setRetries(3);  // Retry up to 3 times
     * }</pre>
     * 
     * @param retries Number of retry attempts (0 = no retries)
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions setRetries(Integer retries) {
        this.retries = retries;
        return this;
    }
    
    /**
     * Creates a builder for fluent construction.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * RequestOptions options = RequestOptions.builder()
     *     .timeout(30000L)
     *     .retries(3)
     *     .addHeader("X-Request-ID", "unique-id")
     *     .build();
     * }</pre>
     * 
     * @return A new RequestOptions instance for fluent building
     */
    public static RequestOptions builder() {
        return new RequestOptions();
    }
    
    /**
     * Returns this instance (for builder pattern compatibility).
     * 
     * @return This RequestOptions instance
     */
    public RequestOptions build() {
        return this;
    }
    
    @Override
    public String toString() {
        return "RequestOptions{" +
                "headers=" + headers +
                ", timeout=" + timeout +
                ", retries=" + retries +
                '}';
    }
}
