/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * Immutable model representing a configuration entity.
 *
 * <p>This class represents a full configuration object as stored in DinoConfig,
 * including metadata, form data, schema information, and version details.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * Config config = ...;
 * System.out.printf("Config: %s (v%d)%n", config.getName(), config.getVersion());
 *
 * Map<String, Object> formData = config.getFormData();
 * String theme = (String) formData.get("theme");
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class Config {

    @JsonProperty("id")
    private final Integer id;

    @JsonProperty("name")
    private final String name;

    @JsonProperty("description")
    private final String description;

    @JsonProperty("company")
    private final String company;

    @JsonProperty("formData")
    private final Map<String, Object> formData;

    @JsonProperty("schema")
    private final JsonNode schema;

    @JsonProperty("uiSchema")
    private final JsonNode uiSchema;

    @JsonProperty("version")
    private final Integer version;

    @JsonProperty("createdAt")
    private final Instant createdAt;

    @JsonProperty("brand")
    private final Brand brand;

    /**
     * Default constructor for Jackson deserialization.
     */
    public Config() {
        this.id = null;
        this.name = null;
        this.description = null;
        this.company = null;
        this.formData = Collections.emptyMap();
        this.schema = null;
        this.uiSchema = null;
        this.version = null;
        this.createdAt = null;
        this.brand = null;
    }

    /**
     * Full constructor for creating Config instances.
     *
     * @param id          The unique identifier
     * @param name        The configuration name
     * @param description Optional description
     * @param company     The company this config belongs to
     * @param formData    The configuration values
     * @param schema      JSON schema for validation
     * @param uiSchema    UI schema for rendering
     * @param version     Version number
     * @param createdAt   Creation timestamp
     * @param brand       The brand this config belongs to
     */
    public Config(Integer id, String name, String description, String company,
                  Map<String, Object> formData, JsonNode schema, JsonNode uiSchema,
                  Integer version, Instant createdAt, Brand brand) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.company = company;
        this.formData = formData != null ? Collections.unmodifiableMap(formData) : Collections.emptyMap();
        this.schema = schema;
        this.uiSchema = uiSchema;
        this.version = version;
        this.createdAt = createdAt;
        this.brand = brand;
    }

    /**
     * Returns the unique identifier of this configuration.
     *
     * @return The configuration ID, or null if not set
     */
    public Integer getId() {
        return id;
    }

    /**
     * Returns the name of this configuration.
     *
     * @return The configuration name, or null if not set
     */
    public String getName() {
        return name;
    }

    /**
     * Returns the optional description.
     *
     * @return Optional containing the description, or empty if not set
     */
    public Optional<String> getDescription() {
        return Optional.ofNullable(description);
    }

    /**
     * Returns the company this configuration belongs to.
     *
     * @return The company name, or null if not set
     */
    public String getCompany() {
        return company;
    }

    /**
     * Returns the configuration values as an immutable map.
     *
     * @return Immutable map of form data, never null
     */
    public Map<String, Object> getFormData() {
        return formData;
    }

    /**
     * Returns the JSON schema for validation.
     *
     * @return The schema as a JsonNode, or null if not set
     */
    public JsonNode getSchema() {
        return schema;
    }

    /**
     * Returns the UI schema for rendering.
     *
     * @return The UI schema as a JsonNode, or null if not set
     */
    public JsonNode getUiSchema() {
        return uiSchema;
    }

    /**
     * Returns the version number.
     *
     * @return The version number, or null if not set
     */
    public Integer getVersion() {
        return version;
    }

    /**
     * Returns the creation timestamp.
     *
     * @return The creation timestamp, or null if not set
     */
    public Instant getCreatedAt() {
        return createdAt;
    }

    /**
     * Returns the brand this configuration belongs to.
     *
     * @return The brand, or null if not set
     */
    public Brand getBrand() {
        return brand;
    }

    /**
     * Gets a specific value from the form data.
     *
     * @param key The key to look up
     * @return The value, or null if not found
     */
    public Object getValue(String key) {
        return formData.get(key);
    }

    /**
     * Gets a specific value with type casting.
     *
     * @param <T>  The expected type
     * @param key  The key to look up
     * @param type The class of the expected type
     * @return The value cast to the specified type, or null if not found
     */
    @SuppressWarnings("unchecked")
    public <T> T getValue(String key, Class<T> type) {
        Object value = formData.get(key);
        if (value == null) {
            return null;
        }
        return (T) value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Config config = (Config) o;
        return Objects.equals(id, config.id)
                && Objects.equals(name, config.name)
                && Objects.equals(description, config.description)
                && Objects.equals(company, config.company)
                && Objects.equals(formData, config.formData)
                && Objects.equals(version, config.version)
                && Objects.equals(createdAt, config.createdAt)
                && Objects.equals(brand, config.brand);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, description, company, formData, version, createdAt, brand);
    }

    @Override
    public String toString() {
        return "Config{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", company='" + company + '\'' +
                ", version=" + version +
                ", createdAt=" + createdAt +
                ", brand=" + brand +
                '}';
    }
}
