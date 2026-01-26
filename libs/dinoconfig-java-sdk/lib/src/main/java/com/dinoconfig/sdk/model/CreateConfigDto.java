/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;

/**
 * Data Transfer Object for creating a new configuration.
 *
 * <p>This class is used when creating new configurations through the API.
 * It supports both traditional setter methods and a fluent builder pattern.
 *
 * <p><b>Builder Pattern (Recommended):</b>
 * <pre>{@code
 * CreateConfigDto dto = CreateConfigDto.builder()
 *     .name("AppSettings")
 *     .description("Application settings configuration")
 *     .formData(Map.of("theme", "dark", "maxUsers", 100))
 *     .build();
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class CreateConfigDto {

    @JsonProperty("name")
    private final String name;

    @JsonProperty("description")
    private final String description;

    @JsonProperty("formData")
    private final Map<String, Object> formData;

    @JsonProperty("schema")
    private final JsonNode schema;

    @JsonProperty("uiSchema")
    private final JsonNode uiSchema;

    /**
     * Default constructor for Jackson deserialization.
     */
    public CreateConfigDto() {
        this.name = null;
        this.description = null;
        this.formData = Collections.emptyMap();
        this.schema = null;
        this.uiSchema = null;
    }

    /**
     * Constructor with required fields.
     *
     * @param name     The configuration name (must not be null)
     * @param formData The configuration values
     */
    public CreateConfigDto(String name, Map<String, Object> formData) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.description = null;
        this.formData = formData != null ? Collections.unmodifiableMap(formData) : Collections.emptyMap();
        this.schema = null;
        this.uiSchema = null;
    }

    /**
     * Private constructor for builder.
     */
    private CreateConfigDto(Builder builder) {
        this.name = Objects.requireNonNull(builder.name, "name must not be null");
        this.description = builder.description;
        this.formData = builder.formData != null
                ? Collections.unmodifiableMap(builder.formData)
                : Collections.emptyMap();
        this.schema = builder.schema;
        this.uiSchema = builder.uiSchema;
    }

    /**
     * Creates a new builder for fluent construction.
     *
     * @return A new Builder instance
     */
    public static Builder builder() {
        return new Builder();
    }

    // Getters

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Map<String, Object> getFormData() {
        return formData;
    }

    public JsonNode getSchema() {
        return schema;
    }

    public JsonNode getUiSchema() {
        return uiSchema;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CreateConfigDto that = (CreateConfigDto) o;
        return Objects.equals(name, that.name)
                && Objects.equals(description, that.description)
                && Objects.equals(formData, that.formData);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, description, formData);
    }

    @Override
    public String toString() {
        return "CreateConfigDto{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", formData=" + formData +
                '}';
    }

    /**
     * Builder for creating CreateConfigDto instances.
     */
    public static final class Builder {
        private String name;
        private String description;
        private Map<String, Object> formData;
        private JsonNode schema;
        private JsonNode uiSchema;

        private Builder() {}

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder formData(Map<String, Object> formData) {
            this.formData = formData;
            return this;
        }

        public Builder schema(JsonNode schema) {
            this.schema = schema;
            return this;
        }

        public Builder uiSchema(JsonNode uiSchema) {
            this.uiSchema = uiSchema;
            return this;
        }

        public CreateConfigDto build() {
            return new CreateConfigDto(this);
        }
    }
}
