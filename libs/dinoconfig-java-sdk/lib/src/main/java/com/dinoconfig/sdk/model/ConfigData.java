/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * Full configuration data returned by the API when fetching an entire configuration.
 *
 * <p>This class represents a complete configuration with all its values,
 * metadata, and version information. Use {@link #getValue(String)} or
 * {@link #getValues()} to access the configuration values.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * ApiResponse<ConfigData> response = configAPI.get("MyBrand", "AppSettings");
 * ConfigData config = response.getData();
 *
 * System.out.printf("Config: %s (v%d)%n", config.getName(), config.getVersion());
 *
 * // Get all values as a map
 * Map<String, Object> values = config.getValues();
 *
 * // Get a specific value with type casting
 * String theme = config.getValue("theme", String.class);
 * Boolean darkMode = config.getValue("darkMode", Boolean.class);
 * Integer maxUsers = config.getValue("maxUsers", Integer.class);
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class ConfigData {

    @JsonProperty("name")
    private final String name;

    @JsonProperty("description")
    private final String description;

    @JsonProperty("formData")
    private final Map<String, Object> values;

    @JsonProperty("version")
    private final int version;

    @JsonProperty("keys")
    private final List<String> keys;

    @JsonProperty("createdAt")
    private final Instant createdAt;

    @JsonProperty("updatedAt")
    private final Instant updatedAt;

    /**
     * Default constructor for Jackson deserialization.
     */
    public ConfigData() {
        this.name = null;
        this.description = null;
        this.values = Collections.emptyMap();
        this.version = 0;
        this.keys = Collections.emptyList();
        this.createdAt = null;
        this.updatedAt = null;
    }

    /**
     * Creates a new ConfigData instance with all fields.
     *
     * @param name        the configuration name (must not be null)
     * @param description optional description
     * @param values      the configuration values map
     * @param version     the configuration version
     * @param keys        list of key names
     * @param createdAt   creation timestamp
     * @param updatedAt   last update timestamp
     * @throws NullPointerException if name is null
     */
    public ConfigData(String name, String description, Map<String, Object> values,
                      int version, List<String> keys, Instant createdAt, Instant updatedAt) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.description = description;
        this.values = values != null ? Collections.unmodifiableMap(values) : Collections.emptyMap();
        this.version = version;
        this.keys = keys != null ? Collections.unmodifiableList(keys) : Collections.emptyList();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Returns the configuration name.
     *
     * @return the configuration name, never null
     */
    public String getName() {
        return name;
    }

    /**
     * Returns the optional configuration description.
     *
     * @return Optional containing the description, or empty if not set
     */
    public Optional<String> getDescription() {
        return Optional.ofNullable(description);
    }

    /**
     * Returns an immutable map of all configuration values.
     *
     * @return immutable map of values, never null
     */
    public Map<String, Object> getValues() {
        return values;
    }

    /**
     * Returns the configuration version.
     *
     * @return the version number
     */
    public int getVersion() {
        return version;
    }

    /**
     * Returns an immutable list of key names.
     *
     * @return immutable list of keys, never null
     */
    public List<String> getKeys() {
        return keys;
    }

    /**
     * Returns the creation timestamp.
     *
     * @return the creation timestamp, or null if not available
     */
    public Instant getCreatedAt() {
        return createdAt;
    }

    /**
     * Returns the last update timestamp.
     *
     * @return Optional containing the update timestamp, or empty if never updated
     */
    public Optional<Instant> getUpdatedAt() {
        return Optional.ofNullable(updatedAt);
    }

    /**
     * Gets a configuration value by key.
     *
     * @param key the key name
     * @return the value, or null if not found
     */
    public Object getValue(String key) {
        return values.get(key);
    }

    /**
     * Gets a configuration value by key with type casting.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * String theme = config.getValue("theme", String.class);
     * Boolean enabled = config.getValue("enabled", Boolean.class);
     * Integer count = config.getValue("count", Integer.class);
     * }</pre>
     *
     * @param <T>  the expected type
     * @param key  the key name
     * @param type the class of the expected type
     * @return the value cast to the specified type, or null if not found
     * @throws ClassCastException if the value cannot be cast to the specified type
     */
    @SuppressWarnings("unchecked")
    public <T> T getValue(String key, Class<T> type) {
        Object value = values.get(key);
        if (value == null) {
            return null;
        }
        return (T) value;
    }

    /**
     * Gets a configuration value by key with a default value.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * String theme = config.getValueOrDefault("theme", "light");
     * Boolean enabled = config.getValueOrDefault("enabled", false);
     * }</pre>
     *
     * @param <T>          the expected type
     * @param key          the key name
     * @param defaultValue the default value to return if key is not found
     * @return the value, or defaultValue if not found
     */
    @SuppressWarnings("unchecked")
    public <T> T getValueOrDefault(String key, T defaultValue) {
        Object value = values.get(key);
        if (value == null) {
            return defaultValue;
        }
        return (T) value;
    }

    /**
     * Checks if a key exists in this configuration.
     *
     * @param key the key name to check
     * @return true if the key exists, false otherwise
     */
    public boolean hasKey(String key) {
        return values.containsKey(key);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConfigData that = (ConfigData) o;
        return version == that.version
                && Objects.equals(name, that.name)
                && Objects.equals(description, that.description)
                && Objects.equals(values, that.values)
                && Objects.equals(keys, that.keys)
                && Objects.equals(createdAt, that.createdAt)
                && Objects.equals(updatedAt, that.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, description, values, version, keys, createdAt, updatedAt);
    }

    @Override
    public String toString() {
        return "ConfigData{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", version=" + version +
                ", keys=" + keys +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
