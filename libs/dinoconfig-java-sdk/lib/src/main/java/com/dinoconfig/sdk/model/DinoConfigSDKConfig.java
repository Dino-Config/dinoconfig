/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

/**
 * Configuration class for initializing the DinoConfig SDK.
 *
 * <p>This class contains all necessary settings for SDK initialization,
 * including authentication credentials and connection parameters.
 * It supports both traditional setter methods and a fluent builder pattern.
 *
 * <p><b>Builder Pattern (Recommended):</b>
 * <pre>{@code
 * DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
 *     .apiKey("dino_your-api-key")
 *     .baseUrl("https://api.dinoconfig.com")
 *     .timeout(15000L)
 *     .build();
 *
 * DinoConfigSDK sdk = DinoConfigSDKFactory.create(config);
 * }</pre>
 *
 * <p><b>Traditional Style:</b>
 * <pre>{@code
 * DinoConfigSDKConfig config = new DinoConfigSDKConfig("dino_your-api-key");
 * config.setBaseUrl("https://api.dinoconfig.com");
 * config.setTimeout(15000L);
 * }</pre>
 *
 * <p><b>Default Values:</b>
 * <ul>
 *   <li>{@code baseUrl}: {@code "http://localhost:3000"}</li>
 *   <li>{@code timeout}: {@code 10000} milliseconds (10 seconds)</li>
 * </ul>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 * @see com.dinoconfig.sdk.DinoConfigSDKFactory
 */
public final class DinoConfigSDKConfig {

    /** Default base URL */
    public static final String DEFAULT_BASE_URL = "http://localhost:3000";

    /** Default timeout in milliseconds */
    public static final long DEFAULT_TIMEOUT = 10000L;

    @JsonProperty("apiKey")
    private String apiKey;

    @JsonProperty("baseUrl")
    private String baseUrl;

    @JsonProperty("timeout")
    private Long timeout;

    /**
     * Default constructor with default values.
     *
     * <p>Initializes the configuration with:
     * <ul>
     *   <li>{@code baseUrl}: {@code "http://localhost:3000"}</li>
     *   <li>{@code timeout}: {@code 10000} ms</li>
     *   <li>{@code apiKey}: {@code null} (must be set before use)</li>
     * </ul>
     */
    public DinoConfigSDKConfig() {
        this.baseUrl = DEFAULT_BASE_URL;
        this.timeout = DEFAULT_TIMEOUT;
    }

    /**
     * Constructor with API key only.
     *
     * <p>Uses default values for {@code baseUrl} and {@code timeout}.
     *
     * @param apiKey The API key for authentication. Must not be {@code null} or empty.
     * @throws IllegalArgumentException if apiKey is null or empty
     */
    public DinoConfigSDKConfig(String apiKey) {
        this();
        setApiKey(apiKey);
    }

    /**
     * Full constructor with all parameters.
     *
     * @param apiKey  The API key for authentication. Must not be {@code null} or empty.
     * @param baseUrl The base URL of the DinoConfig API. Can be {@code null} to use default.
     * @param timeout Request timeout in milliseconds. Can be {@code null} to use default.
     */
    public DinoConfigSDKConfig(String apiKey, String baseUrl, Long timeout) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl != null ? baseUrl : DEFAULT_BASE_URL;
        this.timeout = timeout != null ? timeout : DEFAULT_TIMEOUT;
    }

    /**
     * Private constructor for builder.
     */
    private DinoConfigSDKConfig(Builder builder) {
        this.apiKey = builder.apiKey;
        this.baseUrl = builder.baseUrl != null ? builder.baseUrl : DEFAULT_BASE_URL;
        this.timeout = builder.timeout != null ? builder.timeout : DEFAULT_TIMEOUT;
    }

    /**
     * Creates a new builder for fluent construction.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
     *     .apiKey("dino_your-api-key")
     *     .baseUrl("https://api.dinoconfig.com")
     *     .timeout(15000L)
     *     .build();
     * }</pre>
     *
     * @return A new Builder instance
     */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Creates a config with just an API key (using defaults for other settings).
     *
     * @param apiKey The API key for authentication
     * @return New DinoConfigSDKConfig with the specified API key
     */
    public static DinoConfigSDKConfig withApiKey(String apiKey) {
        return builder().apiKey(apiKey).build();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Getters
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Returns the API key for authentication.
     *
     * @return The API key, or {@code null} if not set
     */
    public String getApiKey() {
        return apiKey;
    }

    /**
     * Returns the base URL of the DinoConfig API.
     *
     * @return The base URL, defaults to {@code "http://localhost:3000"}
     */
    public String getBaseUrl() {
        return baseUrl;
    }

    /**
     * Returns the request timeout in milliseconds.
     *
     * @return The timeout in milliseconds, defaults to {@code 10000}
     */
    public Long getTimeout() {
        return timeout;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Fluent Setters
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Sets the API key for authentication.
     *
     * @param apiKey The API key. Typically prefixed with {@code "dino_"}.
     * @return This configuration instance for method chaining
     * @throws IllegalArgumentException if apiKey is null or empty
     */
    public DinoConfigSDKConfig setApiKey(String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        this.apiKey = apiKey;
        return this;
    }

    /**
     * Sets the base URL of the DinoConfig API.
     *
     * @param baseUrl The base URL (e.g., {@code "https://api.dinoconfig.com"})
     * @return This configuration instance for method chaining
     */
    public DinoConfigSDKConfig setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl != null ? baseUrl : DEFAULT_BASE_URL;
        return this;
    }

    /**
     * Sets the request timeout in milliseconds.
     *
     * @param timeout The timeout in milliseconds. Recommended range: 5000-60000.
     * @return This configuration instance for method chaining
     */
    public DinoConfigSDKConfig setTimeout(Long timeout) {
        this.timeout = timeout != null ? timeout : DEFAULT_TIMEOUT;
        return this;
    }

    /**
     * Validates this configuration.
     *
     * @throws IllegalStateException if the configuration is invalid
     */
    public void validate() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("API key is required");
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DinoConfigSDKConfig that = (DinoConfigSDKConfig) o;
        return Objects.equals(apiKey, that.apiKey)
                && Objects.equals(baseUrl, that.baseUrl)
                && Objects.equals(timeout, that.timeout);
    }

    @Override
    public int hashCode() {
        return Objects.hash(apiKey, baseUrl, timeout);
    }

    @Override
    public String toString() {
        return "DinoConfigSDKConfig{" +
                "apiKey='" + (apiKey != null ? "****" : "null") + '\'' +
                ", baseUrl='" + baseUrl + '\'' +
                ", timeout=" + timeout +
                '}';
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Builder
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Builder for creating DinoConfigSDKConfig instances.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
     *     .apiKey("dino_your-api-key")
     *     .baseUrl("https://api.dinoconfig.com")
     *     .timeout(15000L)
     *     .build();
     * }</pre>
     */
    public static final class Builder {
        private String apiKey;
        private String baseUrl;
        private Long timeout;

        private Builder() {}

        /**
         * Sets the API key for authentication.
         *
         * @param apiKey The API key
         * @return This builder
         */
        public Builder apiKey(String apiKey) {
            this.apiKey = apiKey;
            return this;
        }

        /**
         * Sets the base URL of the DinoConfig API.
         *
         * @param baseUrl The base URL
         * @return This builder
         */
        public Builder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }

        /**
         * Sets the request timeout in milliseconds.
         *
         * @param timeout The timeout in milliseconds
         * @return This builder
         */
        public Builder timeout(long timeout) {
            this.timeout = timeout;
            return this;
        }

        /**
         * Builds the DinoConfigSDKConfig instance.
         *
         * @return New DinoConfigSDKConfig instance
         * @throws IllegalArgumentException if apiKey is null or empty
         */
        public DinoConfigSDKConfig build() {
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new IllegalArgumentException("API key is required");
            }
            return new DinoConfigSDKConfig(this);
        }
    }
}
