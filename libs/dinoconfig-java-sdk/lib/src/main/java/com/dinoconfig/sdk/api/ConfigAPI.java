/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.api;

import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.ConfigData;
import com.dinoconfig.sdk.model.RequestOptions;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
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
 * DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key");
 * ConfigAPI configAPI = sdk.getConfigAPI();
 *
 * // Get an entire configuration
 * ConfigData config = configAPI.get("MyBrand", "AppSettings");
 * Map<String, Object> values = config.getValues();
 *
 * // Get a typed configuration
 * MyConfig config = configAPI.getAs("MyBrand", "AppSettings", MyConfig.class);
 * String theme = config.getTheme();
 *
 * // Get a single value (typed)
 * String theme = configAPI.getValue("MyBrand", "AppSettings", "theme", String.class);
 * Integer maxUsers = configAPI.getValue("MyBrand.AppSettings.maxUsers", Integer.class);
 *
 * // Using path-based shorthand
 * ConfigData config = configAPI.get("MyBrand.AppSettings");
 * String theme = configAPI.getValue("MyBrand.AppSettings.theme", String.class);
 * }</pre>
 *
 * <p><b>Error Handling:</b> Methods throw {@link IOException} for network errors
 * and {@link com.dinoconfig.sdk.model.ApiError} for API errors (4xx, 5xx responses).
 *
 * <p><b>Thread Safety:</b> This class is thread-safe and can be used from
 * multiple threads concurrently.
 *
 * @author DinoConfig Team
 * @version 2.0.0
 * @since 1.0.0
 * @see com.dinoconfig.sdk.DinoConfigSDK#getConfigAPI()
 */
public class ConfigAPI {

    /** Base path for SDK API endpoints */
    private static final String API_BASE_PATH = "/api/sdk/brands";

    /** The HTTP client for making API requests */
    private final HttpClient httpClient;

    /** Shared ObjectMapper for JSON conversion */
    private final ObjectMapper objectMapper;

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
        this.objectMapper = httpClient.getObjectMapper();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Get Entire Configuration
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves an entire configuration with all its values.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * ConfigData config = configAPI.get("MyBrand", "AppSettings");
     * System.out.printf("Config: %s (v%d)%n", config.getName(), config.getVersion());
     *
     * // Get all values
     * Map<String, Object> values = config.getValues();
     *
     * // Get typed values
     * String theme = config.getValue("theme", String.class);
     * Boolean darkMode = config.getValue("darkMode", Boolean.class);
     * }</pre>
     *
     * @param brandName  The name of the brand containing the configuration.
     * @param configName The name of the configuration.
     * @return The {@link ConfigData} containing all configuration values
     * @throws IOException if a network error occurs or the request times out
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     * @throws IllegalArgumentException if any parameter is null or empty
     */
    public ConfigData get(String brandName, String configName) throws IOException {
        return get(brandName, configName, null);
    }

    /**
     * Retrieves an entire configuration with custom request options.
     *
     * @param brandName  The name of the brand.
     * @param configName The name of the configuration.
     * @param options    Request options for customizing the request (timeout, retries)
     * @return The {@link ConfigData} containing all configuration values
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     */
    public ConfigData get(String brandName, String configName, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        validateConfigName(configName);
        Object data = httpClient.get(buildConfigUrl(brandName, configName), options);
        return objectMapper.convertValue(data, ConfigData.class);
    }

    /**
     * Retrieves an entire configuration using path-based notation.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * // These are equivalent:
     * ConfigData config1 = configAPI.get("MyBrand", "AppSettings");
     * ConfigData config2 = configAPI.get("MyBrand.AppSettings");
     * }</pre>
     *
     * @param path The dot-separated path in format "brandName.configName".
     * @return The {@link ConfigData} containing all configuration values
     * @throws IOException if a network error occurs
     * @throws IllegalArgumentException if the path format is invalid
     */
    public ConfigData get(String path) throws IOException {
        return get(path, (RequestOptions) null);
    }

    /**
     * Retrieves an entire configuration using path-based notation with custom options.
     *
     * @param path    The dot-separated path in format "brandName.configName"
     * @param options Request options for customizing the request
     * @return The {@link ConfigData} containing all configuration values
     * @throws IOException if a network error occurs
     */
    public ConfigData get(String path, RequestOptions options) throws IOException {
        String[] parts = parseConfigPath(path);
        return get(parts[0], parts[1], options);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Get Configuration as Typed Model
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves a configuration and deserializes it directly to a typed model class.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * // Import your generated model
     * import org.example.models.demo.MyConfig;
     *
     * // Get config with full type safety
     * MyConfig config = configAPI.getAs("Demo", "MyConfig", MyConfig.class);
     * String test = config.getTest();
     * String novoPolje = config.getNovoPolje();
     * }</pre>
     *
     * @param <T>        The type of the model class
     * @param brandName  The name of the brand containing the configuration.
     * @param configName The name of the configuration.
     * @param modelClass The class to deserialize the configuration values into.
     * @return The typed model instance with configuration values
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     */
    public <T> T getAs(String brandName, String configName, Class<T> modelClass) throws IOException {
        return getAs(brandName, configName, modelClass, null);
    }

    /**
     * Retrieves a configuration as typed model with custom options.
     *
     * @param <T>        The type of the model class
     * @param brandName  The name of the brand.
     * @param configName The name of the configuration.
     * @param modelClass The class to deserialize into
     * @param options    Request options
     * @return The typed model instance
     * @throws IOException if a network error occurs
     */
    public <T> T getAs(String brandName, String configName, Class<T> modelClass, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        validateConfigName(configName);
        Objects.requireNonNull(modelClass, "Model class cannot be null");
        
        ConfigData configData = get(brandName, configName, options);
        return objectMapper.convertValue(configData.getValues(), modelClass);
    }

    /**
     * Retrieves a configuration using path notation and deserializes to typed model.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * // These are equivalent:
     * MyConfig config1 = configAPI.getAs("Demo", "MyConfig", MyConfig.class);
     * MyConfig config2 = configAPI.getAs("Demo.MyConfig", MyConfig.class);
     * }</pre>
     *
     * @param <T>        The type of the model class
     * @param path       The dot-separated path in format "brandName.configName".
     * @param modelClass The class to deserialize into
     * @return The typed model instance
     * @throws IOException if a network error occurs
     */
    public <T> T getAs(String path, Class<T> modelClass) throws IOException {
        return getAs(path, modelClass, null);
    }

    /**
     * Retrieves a configuration using path notation as typed model with custom options.
     *
     * @param <T>        The type of the model class
     * @param path       The dot-separated path in format "brandName.configName"
     * @param modelClass The class to deserialize into
     * @param options    Request options
     * @return The typed model instance
     * @throws IOException if a network error occurs
     */
    public <T> T getAs(String path, Class<T> modelClass, RequestOptions options) throws IOException {
        String[] parts = parseConfigPath(path);
        return getAs(parts[0], parts[1], modelClass, options);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Get Single Value (Typed)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves a specific configuration value with type safety.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * String theme = configAPI.getValue("MyBrand", "AppSettings", "theme", String.class);
     * Integer maxUsers = configAPI.getValue("MyBrand", "AppSettings", "maxUsers", Integer.class);
     * Boolean enabled = configAPI.getValue("MyBrand", "FeatureFlags", "darkMode", Boolean.class);
     * }</pre>
     *
     * @param <T>            The expected type of the value
     * @param brandName      The name of the brand.
     * @param configName     The name of the configuration.
     * @param configValueKey The key of the specific value to retrieve.
     * @param valueType      The class of the expected type
     * @return The configuration value cast to the specified type
     * @throws IOException if a network error occurs
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     */
    public <T> T getValue(String brandName, String configName, String configValueKey, Class<T> valueType) throws IOException {
        return getValue(brandName, configName, configValueKey, valueType, null);
    }

    /**
     * Retrieves a specific configuration value with type safety and custom options.
     *
     * @param <T>            The expected type of the value
     * @param brandName      The name of the brand.
     * @param configName     The name of the configuration.
     * @param configValueKey The key to retrieve.
     * @param valueType      The class of the expected type
     * @param options        Request options
     * @return The configuration value cast to the specified type
     * @throws IOException if a network error occurs
     */
    @SuppressWarnings("unchecked")
    public <T> T getValue(String brandName, String configName, String configValueKey, Class<T> valueType, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        validateConfigName(configName);
        validateKeyName(configValueKey);
        Objects.requireNonNull(valueType, "Value type cannot be null");
        
        Object data = httpClient.get(buildValueUrl(brandName, configName, configValueKey), options);
        
        // Extract value from {value: actualValue} wrapper
        Object actualValue = data;
        if (data instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) data;
            if (map.containsKey("value")) {
                actualValue = map.get("value");
            }
        }
        
        return objectMapper.convertValue(actualValue, valueType);
    }

    /**
     * Retrieves a specific configuration value using path notation with type safety.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * // These are equivalent:
     * String theme1 = configAPI.getValue("MyBrand", "AppSettings", "theme", String.class);
     * String theme2 = configAPI.getValue("MyBrand.AppSettings.theme", String.class);
     * }</pre>
     *
     * @param <T>       The expected type of the value
     * @param path      The dot-separated path in format "brandName.configName.keyName".
     * @param valueType The class of the expected type
     * @return The configuration value cast to the specified type
     * @throws IOException if a network error occurs
     */
    public <T> T getValue(String path, Class<T> valueType) throws IOException {
        return getValue(path, valueType, null);
    }

    /**
     * Retrieves a specific configuration value using path notation with type safety and options.
     *
     * @param <T>       The expected type of the value
     * @param path      The dot-separated path in format "brandName.configName.keyName"
     * @param valueType The class of the expected type
     * @param options   Request options
     * @return The configuration value cast to the specified type
     * @throws IOException if a network error occurs
     */
    public <T> T getValue(String path, Class<T> valueType, RequestOptions options) throws IOException {
        String[] parts = parseValuePath(path);
        return getValue(parts[0], parts[1], parts[2], valueType, options);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Get Single Value (Untyped - for backward compatibility)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves a specific configuration value as Object.
     *
     * <p>Consider using the typed version {@link #getValue(String, String, String, Class)}
     * for better type safety.
     *
     * @param brandName      The name of the brand.
     * @param configName     The name of the configuration.
     * @param configValueKey The key to retrieve.
     * @return The configuration value
     * @throws IOException if a network error occurs
     */
    public Object getValue(String brandName, String configName, String configValueKey) throws IOException {
        return getValue(brandName, configName, configValueKey, Object.class, null);
    }

    /**
     * Retrieves a specific configuration value using path notation as Object.
     *
     * @param path The dot-separated path in format "brandName.configName.keyName".
     * @return The configuration value
     * @throws IOException if a network error occurs
     */
    public Object getValue(String path) throws IOException {
        return getValue(path, Object.class, null);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────────

    private String buildConfigUrl(String brandName, String configName) {
        return String.format("%s/%s/configs/%s",
                API_BASE_PATH,
                encode(brandName),
                encode(configName)
        );
    }

    private String buildValueUrl(String brandName, String configName, String keyName) {
        return String.format("%s/%s/configs/%s/%s",
                API_BASE_PATH,
                encode(brandName),
                encode(configName),
                encode(keyName)
        );
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

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

    private void validatePath(String path) {
        if (path == null || path.trim().isEmpty()) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
    }

    private void validateBrandName(String brandName) {
        if (brandName == null || brandName.trim().isEmpty()) {
            throw new IllegalArgumentException("Brand name cannot be null or empty");
        }
    }

    private void validateConfigName(String configName) {
        if (configName == null || configName.trim().isEmpty()) {
            throw new IllegalArgumentException("Config name cannot be null or empty");
        }
    }

    private void validateKeyName(String keyName) {
        if (keyName == null || keyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Key name cannot be null or empty");
        }
    }
}
