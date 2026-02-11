/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Options for customizing individual API requests.
 *
 * <p>This class allows you to customize request behavior on a per-request basis,
 * including timeouts, retries, and custom headers. It supports both traditional
 * setter methods and a fluent builder pattern.
 *
 * <p><b>Builder Pattern (Recommended):</b>
 * <pre>{@code
 * RequestOptions options = RequestOptions.builder()
 *     .timeout(30000L)
 *     .retries(3)
 *     .header("X-Request-ID", UUID.randomUUID().toString())
 *     .build();
 *
 * ApiResponse<Object> response = configAPI.getValue(
 *     "MyBrand", "MyConfig", "myKey", options
 * );
 * }</pre>
 *
 * <p><b>Traditional Setter Style:</b>
 * <pre>{@code
 * RequestOptions options = new RequestOptions();
 * options.setTimeout(30000L);
 * options.setRetries(3);
 * options.addHeader("X-Request-ID", "unique-id");
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
public final class RequestOptions {

    private Map<String, String> headers;
    private Long timeout;
    private Integer retries;
    private Boolean cache;
    private Boolean forceRefresh;

    /**
     * Default constructor.
     *
     * <p>Creates options with no customizations (uses SDK defaults).
     */
    public RequestOptions() {
        this.headers = new HashMap<>();
    }

    /**
     * Private constructor for builder.
     */
    private RequestOptions(Builder builder) {
        this.headers = builder.headers != null ? new HashMap<>(builder.headers) : new HashMap<>();
        this.timeout = builder.timeout;
        this.retries = builder.retries;
        this.cache = builder.cache;
        this.forceRefresh = builder.forceRefresh;
    }

    /**
     * Creates a new builder for fluent construction.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * RequestOptions options = RequestOptions.builder()
     *     .timeout(30000L)
     *     .retries(3)
     *     .header("X-Request-ID", "unique-id")
     *     .build();
     * }</pre>
     *
     * @return A new Builder instance
     */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Creates RequestOptions with just a timeout.
     *
     * @param timeout The timeout in milliseconds
     * @return New RequestOptions with the specified timeout
     */
    public static RequestOptions withTimeout(long timeout) {
        return builder().timeout(timeout).build();
    }

    /**
     * Creates RequestOptions with just retries.
     *
     * @param retries The number of retry attempts
     * @return New RequestOptions with the specified retries
     */
    public static RequestOptions withRetries(int retries) {
        return builder().retries(retries).build();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Getters
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Returns the custom headers.
     *
     * @return Map of header names to values, never null
     */
    public Map<String, String> getHeaders() {
        return Collections.unmodifiableMap(headers);
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
     * Returns the number of retry attempts.
     *
     * @return Number of retries, or {@code null} to use SDK default (0)
     */
    public Integer getRetries() {
        return retries;
    }

    /**
     * Returns whether caching is enabled.
     *
     * @return true if caching is enabled, false if disabled, null for default behavior
     */
    public Boolean getCache() {
        return cache;
    }

    /**
     * Returns whether to force refresh (bypass cache).
     *
     * @return true to force refresh, false otherwise
     */
    public Boolean getForceRefresh() {
        return forceRefresh;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Fluent Setters (for backward compatibility and chaining)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Sets custom headers for this request.
     *
     * @param headers Map of header names to values
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions setHeaders(Map<String, String> headers) {
        this.headers = headers != null ? new HashMap<>(headers) : new HashMap<>();
        return this;
    }

    /**
     * Adds a single header to this request.
     *
     * @param key   Header name
     * @param value Header value
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions addHeader(String key, String value) {
        Objects.requireNonNull(key, "Header key cannot be null");
        this.headers.put(key, value);
        return this;
    }

    /**
     * Sets the request timeout.
     *
     * @param timeout Timeout in milliseconds
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions setTimeout(Long timeout) {
        this.timeout = timeout;
        return this;
    }

    /**
     * Sets the number of retry attempts for failed requests.
     *
     * @param retries Number of retry attempts (0 = no retries)
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions setRetries(Integer retries) {
        this.retries = retries;
        return this;
    }

    /**
     * Sets whether caching is enabled for this request.
     *
     * @param cache true to enable caching, false to disable
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions setCache(Boolean cache) {
        this.cache = cache;
        return this;
    }

    /**
     * Sets whether to force refresh (bypass cache).
     *
     * @param forceRefresh true to bypass cache and fetch fresh data
     * @return This RequestOptions instance for method chaining
     */
    public RequestOptions setForceRefresh(Boolean forceRefresh) {
        this.forceRefresh = forceRefresh;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RequestOptions that = (RequestOptions) o;
        return Objects.equals(headers, that.headers)
                && Objects.equals(timeout, that.timeout)
                && Objects.equals(retries, that.retries)
                && Objects.equals(cache, that.cache)
                && Objects.equals(forceRefresh, that.forceRefresh);
    }

    @Override
    public int hashCode() {
        return Objects.hash(headers, timeout, retries, cache, forceRefresh);
    }

    @Override
    public String toString() {
        return "RequestOptions{" +
                "headers=" + headers +
                ", timeout=" + timeout +
                ", retries=" + retries +
                ", cache=" + cache +
                ", forceRefresh=" + forceRefresh +
                '}';
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Builder
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Builder for creating RequestOptions instances.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * RequestOptions options = RequestOptions.builder()
     *     .timeout(30000L)
     *     .retries(3)
     *     .header("X-Request-ID", "unique-id")
     *     .header("X-Custom-Header", "value")
     *     .cache(true)
     *     .build();
     * }</pre>
     */
    public static final class Builder {
        private Map<String, String> headers = new HashMap<>();
        private Long timeout;
        private Integer retries;
        private Boolean cache;
        private Boolean forceRefresh;

        private Builder() {}

        /**
         * Sets all headers at once.
         *
         * @param headers Map of header names to values
         * @return This builder
         */
        public Builder headers(Map<String, String> headers) {
            this.headers = headers != null ? new HashMap<>(headers) : new HashMap<>();
            return this;
        }

        /**
         * Adds a single header.
         *
         * @param key   Header name
         * @param value Header value
         * @return This builder
         */
        public Builder header(String key, String value) {
            Objects.requireNonNull(key, "Header key cannot be null");
            this.headers.put(key, value);
            return this;
        }

        /**
         * Adds a single header. Alias for {@link #header(String, String)} for API consistency.
         *
         * @param key   Header name
         * @param value Header value
         * @return This builder
         */
        public Builder addHeader(String key, String value) {
            return header(key, value);
        }

        /**
         * Sets the request timeout.
         *
         * @param timeout Timeout in milliseconds
         * @return This builder
         */
        public Builder timeout(long timeout) {
            this.timeout = timeout;
            return this;
        }

        /**
         * Sets the number of retry attempts.
         *
         * @param retries Number of retries (0 = no retries)
         * @return This builder
         */
        public Builder retries(int retries) {
            this.retries = retries;
            return this;
        }

        /**
         * Sets whether caching is enabled.
         *
         * @param cache true to enable caching
         * @return This builder
         */
        public Builder cache(boolean cache) {
            this.cache = cache;
            return this;
        }

        /**
         * Sets whether to force refresh (bypass cache).
         *
         * @param forceRefresh true to bypass cache
         * @return This builder
         */
        public Builder forceRefresh(boolean forceRefresh) {
            this.forceRefresh = forceRefresh;
            return this;
        }

        /**
         * Builds the RequestOptions instance.
         *
         * @return New RequestOptions instance
         */
        public RequestOptions build() {
            return new RequestOptions(this);
        }
    }
}
