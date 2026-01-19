/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.api;

import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.ApiResponse;
import com.dinoconfig.sdk.model.ConfigData;
import com.dinoconfig.sdk.model.RequestOptions;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

/**
 * Configuration API client for retrieving configuration values from DinoConfig.
 *
 * <p>This class provides methods for fetching configuration values from the
 * DinoConfig API. It handles request formatting, error handling, and response
 * parsing automatically.
 *
 * <p><b>Usage:</b> Access this class through {@link com.dinoconfig.sdk.DinoConfigSDK#getConfigAPI()}.
 *
 * <pre>{@code
 * // Get SDK instance
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
 *
 * // Get ConfigAPI instance
 * ConfigAPI configAPI = dinoconfig.getConfigAPI();
 *
 * // Get an entire configuration
 * ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings");
 * Map<String, Object> values = config.getData().getValues();
 *
 * // Get a single configuration value
 * ApiResponse<Object> response = configAPI.getValue("MyBrand", "AppSettings", "theme");
 * String theme = (String) response.getData();
 *
 * // Using path-based shorthand
 * ApiResponse<ConfigData> config2 = configAPI.get("MyBrand.AppSettings");
 * ApiResponse<Object> value = configAPI.getValue("MyBrand.AppSettings.theme");
 * }</pre>
 *
 * <p><b>Error Handling:</b> Methods throw {@link IOException} for network errors
 * and {@link com.dinoconfig.sdk.model.ApiError} for API errors (4xx, 5xx responses).
 *
 * <p><b>Thread Safety:</b> This class is thread-safe and can be used from
 * multiple threads concurrently.
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 * @see com.dinoconfig.sdk.DinoConfigSDK#getConfigAPI()
 * @see ApiResponse
 * @see RequestOptions
 */
public class ConfigAPI {

    /** Base path for SDK API endpoints */
    private static final String API_BASE_PATH = "/api/sdk/brands";

    /** The HTTP client for making API requests */
    private final HttpClient httpClient;

    /**
     * Constructs a new ConfigAPI instance.
     *
     * <p><b>Note:</b> This constructor is intended for internal use.
     * Use {@link com.dinoconfig.sdk.DinoConfigSDK#getConfigAPI()} to obtain
     * a ConfigAPI instance.
     *
     * @param httpClient The HTTP client instance for making API requests.
     *                   Must not be {@code null}.
     * @throws NullPointerException if {@code httpClient} is {@code null}
     */
    public ConfigAPI(HttpClient httpClient) {
        this.httpClient = Objects.requireNonNull(httpClient, "HttpClient cannot be null");
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Get Entire Configuration
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves an entire configuration with all its values.
     *
     * <p>This method fetches all values from a configuration at once,
     * returning them in a {@link ConfigData} object.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * ConfigAPI configAPI = dinoconfig.getConfigAPI();
     *
     * ApiResponse<ConfigData> response = configAPI.get("MyBrand", "AppSettings");
     * if (response.getSuccess()) {
     *     ConfigData config = response.getData();
     *     System.out.printf("Config: %s (v%d)%n",
     *         config.getName(), config.getVersion());
     *
     *     // Get all values
     *     Map<String, Object> values = config.getValues();
     *
     *     // Get typed values
     *     String theme = config.getValue("theme", String.class);
     *     Boolean darkMode = config.getValue("darkMode", Boolean.class);
     * }
     * }</pre>
     *
     * @param brandName  The name of the brand containing the configuration.
     *                   Must not be {@code null} or empty.
     * @param configName The name of the configuration.
     *                   Must not be {@code null} or empty.
     * @return An {@link ApiResponse} containing the {@link ConfigData}
     * @throws IOException if a network error occurs or the request times out
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if any parameter is null or empty
     * @see ConfigData
     */
    public ApiResponse<ConfigData> get(String brandName, String configName) throws IOException {
        return get(brandName, configName, new RequestOptions());
    }

    /**
     * Retrieves an entire configuration with custom request options.
     *
     * <p><b>Example with custom options:</b>
     * <pre>{@code
     * RequestOptions options = new RequestOptions();
     * options.setTimeout(30000L);  // 30 second timeout
     * options.setRetries(3);       // Retry up to 3 times
     *
     * ApiResponse<ConfigData> response = configAPI.get("MyBrand", "AppSettings", options);
     * }</pre>
     *
     * @param brandName  The name of the brand. Must not be {@code null} or empty.
     * @param configName The name of the configuration. Must not be {@code null} or empty.
     * @param options    Request options for customizing the request
     * @return An {@link ApiResponse} containing the {@link ConfigData}
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if any parameter is null or empty
     */
    public ApiResponse<ConfigData> get(String brandName, String configName, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        validateConfigName(configName);
        return httpClient.get(buildConfigUrl(brandName, configName), options);
    }

    /**
     * Retrieves an entire configuration using path-based notation.
     *
     * <p>This is a convenient shorthand that accepts a dot-separated path
     * in the format "brandName.configName".
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * // These are equivalent:
     * ApiResponse<ConfigData> response1 = configAPI.get("MyBrand", "AppSettings");
     * ApiResponse<ConfigData> response2 = configAPI.get("MyBrand.AppSettings");
     * }</pre>
     *
     * @param path The dot-separated path in format "brandName.configName".
     *             Must not be {@code null} or empty.
     * @return An {@link ApiResponse} containing the {@link ConfigData}
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if the path format is invalid
     */
    public ApiResponse<ConfigData> get(String path) throws IOException {
        return get(path, new RequestOptions());
    }

    /**
     * Retrieves an entire configuration using path-based notation with custom options.
     *
     * @param path    The dot-separated path in format "brandName.configName"
     * @param options Request options for customizing the request
     * @return An {@link ApiResponse} containing the {@link ConfigData}
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if the path format is invalid
     */
    public ApiResponse<ConfigData> get(String path, RequestOptions options) throws IOException {
        String[] parts = parseConfigPath(path);
        return get(parts[0], parts[1], options);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Get Single Value
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves a specific configuration value from DinoConfig.
     *
     * <p>This method fetches a single value from a configuration by specifying
     * the brand name, configuration name, and the key within the configuration.
     *
     * <p><b>Basic Example:</b>
     * <pre>{@code
     * ConfigAPI configAPI = dinoconfig.getConfigAPI();
     *
     * ApiResponse<Object> response = configAPI.getValue("MyBrand", "AppSettings", "theme");
     * if (response.getSuccess()) {
     *     String theme = (String) response.getData();
     *     System.out.println("Theme: " + theme);
     * }
     * }</pre>
     *
     * <p><b>Feature Flag Example:</b>
     * <pre>{@code
     * ApiResponse<Object> response = configAPI.getValue("MyApp", "FeatureFlags", "enableBeta");
     * if (response.getSuccess() && response.getData() instanceof Boolean) {
     *     boolean isBetaEnabled = (Boolean) response.getData();
     *     if (isBetaEnabled) {
     *         // Show beta features
     *     }
     * }
     * }</pre>
     *
     * @param brandName      The name of the brand containing the configuration.
     *                       Must not be {@code null} or empty.
     * @param configName     The name of the configuration.
     *                       Must not be {@code null} or empty.
     * @param configValueKey The key of the specific value to retrieve.
     *                       Must not be {@code null} or empty.
     * @return An {@link ApiResponse} containing the configuration value.
     *         The data can be any JSON-compatible type (String, Boolean, Number, Map, List, etc.).
     * @throws IOException if a network error occurs or the request times out
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if any parameter is null or empty
     * @see ApiResponse
     */
    public ApiResponse<Object> getValue(String brandName, String configName, String configValueKey) throws IOException {
        return getValue(brandName, configName, configValueKey, new RequestOptions());
    }

    /**
     * Retrieves a specific configuration value with custom request options.
     *
     * <p><b>Example with custom options:</b>
     * <pre>{@code
     * RequestOptions options = new RequestOptions();
     * options.setTimeout(30000L);  // 30 second timeout
     * options.setRetries(5);       // Retry up to 5 times
     * options.setHeaders(Map.of(
     *     "X-Request-ID", UUID.randomUUID().toString()
     * ));
     *
     * ApiResponse<Object> response = configAPI.getValue(
     *     "MyBrand", "CriticalConfig", "databaseUrl", options
     * );
     * }</pre>
     *
     * @param brandName      The name of the brand. Must not be {@code null} or empty.
     * @param configName     The name of the configuration. Must not be {@code null} or empty.
     * @param configValueKey The key to retrieve. Must not be {@code null} or empty.
     * @param options        Request options for customizing the request (timeout, retries, headers)
     * @return An {@link ApiResponse} containing the configuration value
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if any parameter is null or empty
     */
    public ApiResponse<Object> getValue(String brandName, String configName, String configValueKey, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        validateConfigName(configName);
        validateKeyName(configValueKey);
        return httpClient.get(buildValueUrl(brandName, configName, configValueKey), options);
    }

    /**
     * Retrieves a specific configuration value using path-based notation.
     *
     * <p>This is a convenient shorthand that accepts a dot-separated path
     * in the format "brandName.configName.keyName".
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * // These are equivalent:
     * ApiResponse<Object> response1 = configAPI.getValue("MyBrand", "AppSettings", "theme");
     * ApiResponse<Object> response2 = configAPI.getValue("MyBrand.AppSettings.theme");
     *
     * if (response2.getSuccess()) {
     *     String theme = (String) response2.getData();
     *     System.out.println("Theme: " + theme);
     * }
     * }</pre>
     *
     * @param path The dot-separated path in format "brandName.configName.keyName".
     *             Must not be {@code null} or empty.
     * @return An {@link ApiResponse} containing the configuration value
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if the path format is invalid
     */
    public ApiResponse<Object> getValue(String path) throws IOException {
        return getValue(path, new RequestOptions());
    }

    /**
     * Retrieves a specific configuration value using path-based notation with custom options.
     *
     * @param path    The dot-separated path in format "brandName.configName.keyName"
     * @param options Request options for customizing the request
     * @return An {@link ApiResponse} containing the configuration value
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if the path format is invalid
     */
    public ApiResponse<Object> getValue(String path, RequestOptions options) throws IOException {
        String[] parts = parseValuePath(path);
        return getValue(parts[0], parts[1], parts[2], options);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Deprecated methods (for backward compatibility)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves a specific configuration value from DinoConfig.
     *
     * @deprecated Use {@link #getValue(String, String, String, RequestOptions)} instead.
     *             This method will be removed in a future version.
     *
     * @param brandName      The name of the brand
     * @param configName     The name of the configuration
     * @param configValueKey The key of the specific value to retrieve
     * @param options        Request options
     * @return An {@link ApiResponse} containing the configuration value
     * @throws IOException if a network error occurs
     */
    @Deprecated(since = "1.1.0", forRemoval = true)
    public ApiResponse<Object> getConfigValue(String brandName, String configName, String configValueKey, RequestOptions options) throws IOException {
        return getValue(brandName, configName, configValueKey, options);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Builds the URL for fetching an entire config.
     */
    private String buildConfigUrl(String brandName, String configName) {
        return String.format("%s/%s/configs/%s",
                API_BASE_PATH,
                encode(brandName),
                encode(configName)
        );
    }

    /**
     * Builds the URL for fetching a single value.
     */
    private String buildValueUrl(String brandName, String configName, String keyName) {
        return String.format("%s/%s/configs/%s/%s",
                API_BASE_PATH,
                encode(brandName),
                encode(configName),
                encode(keyName)
        );
    }

    /**
     * URL-encodes a path segment.
     */
    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    /**
     * Parses a config path (brandName.configName) into its components.
     */
    private String[] parseConfigPath(String path) {
        validatePath(path);
        String[] parts = path.split("\\.", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException(
                    String.format("Invalid config path format '%s'. Expected 'brandName.configName'", path)
            );
        }
        return parts;
    }

    /**
     * Parses a value path (brandName.configName.keyName) into its components.
     */
    private String[] parseValuePath(String path) {
        validatePath(path);
        String[] parts = path.split("\\.", 3);
        if (parts.length != 3) {
            throw new IllegalArgumentException(
                    String.format("Invalid value path format '%s'. Expected 'brandName.configName.keyName'", path)
            );
        }
        return parts;
    }

    /**
     * Validates the path is not null or empty.
     */
    private void validatePath(String path) {
        if (path == null || path.trim().isEmpty()) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
    }

    /**
     * Validates the brand name parameter.
     */
    private void validateBrandName(String brandName) {
        if (brandName == null || brandName.trim().isEmpty()) {
            throw new IllegalArgumentException("Brand name cannot be null or empty");
        }
    }

    /**
     * Validates the config name parameter.
     */
    private void validateConfigName(String configName) {
        if (configName == null || configName.trim().isEmpty()) {
            throw new IllegalArgumentException("Config name cannot be null or empty");
        }
    }

    /**
     * Validates the key name parameter.
     */
    private void validateKeyName(String keyName) {
        if (keyName == null || keyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Key name cannot be null or empty");
        }
    }
}
