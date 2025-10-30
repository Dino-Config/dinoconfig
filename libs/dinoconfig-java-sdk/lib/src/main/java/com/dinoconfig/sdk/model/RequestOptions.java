package com.dinoconfig.sdk.model;

import java.util.Map;

/**
 * Request options for API calls.
 */
public class RequestOptions {
    
    private Map<String, String> headers;
    private Long timeout;
    private Integer retries;
    
    /**
     * Default constructor
     */
    public RequestOptions() {}
    
    /**
     * Constructor with all fields
     */
    public RequestOptions(Map<String, String> headers, Long timeout, Integer retries) {
        this.headers = headers;
        this.timeout = timeout;
        this.retries = retries;
    }
    
    // Getters and Setters
    public Map<String, String> getHeaders() {
        return headers;
    }
    
    public void setHeaders(Map<String, String> headers) {
        this.headers = headers;
    }
    
    public Long getTimeout() {
        return timeout;
    }
    
    public void setTimeout(Long timeout) {
        this.timeout = timeout;
    }
    
    public Integer getRetries() {
        return retries;
    }
    
    public void setRetries(Integer retries) {
        this.retries = retries;
    }
}
