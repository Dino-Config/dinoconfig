/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;

/**
 * Complete schema for a configuration.
 *
 * <p>This class represents the full schema definition for a configuration,
 * including the configuration name, version, and all field definitions.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * ApiResponse<ConfigSchema> response = discoveryAPI.getSchema("MyBrand", "FeatureFlags");
 * ConfigSchema schema = response.getData();
 *
 * System.out.printf("Config: %s (v%d)%n", schema.getConfigName(), schema.getVersion());
 * schema.getFields().forEach((name, field) -> {
 *     System.out.printf("  %s: %s%s%n",
 *         name, field.getType(), field.isRequired() ? " (required)" : "");
 * });
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class ConfigSchema {

    @JsonProperty("configName")
    private final String configName;

    @JsonProperty("version")
    private final int version;

    @JsonProperty("fields")
    private final Map<String, FieldSchema> fields;

    /**
     * Default constructor for Jackson deserialization.
     */
    public ConfigSchema() {
        this.configName = null;
        this.version = 0;
        this.fields = Collections.emptyMap();
    }

    /**
     * Creates a new ConfigSchema instance.
     *
     * @param configName the configuration name (must not be null)
     * @param version    the schema version
     * @param fields     map of field names to field schemas
     * @throws NullPointerException if configName is null
     */
    public ConfigSchema(String configName, int version, Map<String, FieldSchema> fields) {
        this.configName = Objects.requireNonNull(configName, "configName must not be null");
        this.version = version;
        this.fields = fields != null ? Collections.unmodifiableMap(fields) : Collections.emptyMap();
    }

    /**
     * Returns the configuration name.
     *
     * @return the configuration name, never null
     */
    public String getConfigName() {
        return configName;
    }

    /**
     * Returns the schema version.
     *
     * @return the version number
     */
    public int getVersion() {
        return version;
    }

    /**
     * Returns an immutable map of field names to field schemas.
     *
     * @return immutable map of fields, never null
     */
    public Map<String, FieldSchema> getFields() {
        return fields;
    }

    /**
     * Gets a specific field schema by name.
     *
     * @param fieldName the field name to look up
     * @return the FieldSchema, or null if not found
     */
    public FieldSchema getField(String fieldName) {
        return fields.get(fieldName);
    }

    /**
     * Checks if a field exists in this schema.
     *
     * @param fieldName the field name to check
     * @return true if the field exists, false otherwise
     */
    public boolean hasField(String fieldName) {
        return fields.containsKey(fieldName);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConfigSchema that = (ConfigSchema) o;
        return version == that.version
                && Objects.equals(configName, that.configName)
                && Objects.equals(fields, that.fields);
    }

    @Override
    public int hashCode() {
        return Objects.hash(configName, version, fields);
    }

    @Override
    public String toString() {
        return "ConfigSchema{" +
                "configName='" + configName + '\'' +
                ", version=" + version +
                ", fields=" + fields.keySet() +
                '}';
    }
}
