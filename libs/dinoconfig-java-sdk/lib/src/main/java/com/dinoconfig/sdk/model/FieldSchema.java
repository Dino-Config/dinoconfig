/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;
import java.util.Optional;

/**
 * Schema definition for a configuration field.
 *
 * <p>This class describes the structure and constraints of a single
 * configuration field, including its type, description, default value,
 * required status, and validation rules.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * ConfigSchema schema = discoveryAPI.getSchema("MyBrand", "AppSettings").getData();
 * for (Map.Entry<String, FieldSchema> entry : schema.getFields().entrySet()) {
 *     FieldSchema field = entry.getValue();
 *     System.out.printf("Field '%s': type=%s, required=%s%n",
 *         entry.getKey(), field.getType(), field.isRequired());
 * }
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class FieldSchema {

    @JsonProperty("type")
    private final FieldType type;

    @JsonProperty("description")
    private final String description;

    @JsonProperty("defaultValue")
    private final Object defaultValue;

    @JsonProperty("required")
    private final Boolean required;

    @JsonProperty("validation")
    private final FieldValidation validation;

    /**
     * Default constructor for Jackson deserialization.
     */
    public FieldSchema() {
        this.type = null;
        this.description = null;
        this.defaultValue = null;
        this.required = null;
        this.validation = null;
    }

    /**
     * Creates a new FieldSchema instance.
     *
     * @param type         the field type (must not be null)
     * @param description  optional field description
     * @param defaultValue optional default value
     * @param required     whether the field is required
     * @param validation   optional validation rules
     * @throws NullPointerException if type is null
     */
    public FieldSchema(FieldType type, String description, Object defaultValue,
                       Boolean required, FieldValidation validation) {
        this.type = Objects.requireNonNull(type, "type must not be null");
        this.description = description;
        this.defaultValue = defaultValue;
        this.required = required;
        this.validation = validation;
    }

    /**
     * Returns the field type.
     *
     * @return the field type, never null
     */
    public FieldType getType() {
        return type;
    }

    /**
     * Returns the optional field description.
     *
     * @return Optional containing the description, or empty if not set
     */
    public Optional<String> getDescription() {
        return Optional.ofNullable(description);
    }

    /**
     * Returns the optional default value.
     *
     * @return Optional containing the default value, or empty if not set
     */
    public Optional<Object> getDefaultValue() {
        return Optional.ofNullable(defaultValue);
    }

    /**
     * Returns whether this field is required.
     *
     * @return true if required, false otherwise (defaults to false)
     */
    public boolean isRequired() {
        return Boolean.TRUE.equals(required);
    }

    /**
     * Returns the optional validation rules.
     *
     * @return Optional containing the validation rules, or empty if not set
     */
    public Optional<FieldValidation> getValidation() {
        return Optional.ofNullable(validation);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FieldSchema that = (FieldSchema) o;
        return type == that.type
                && Objects.equals(description, that.description)
                && Objects.equals(defaultValue, that.defaultValue)
                && Objects.equals(required, that.required)
                && Objects.equals(validation, that.validation);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, description, defaultValue, required, validation);
    }

    @Override
    public String toString() {
        return "FieldSchema{" +
                "type=" + type +
                ", description='" + description + '\'' +
                ", defaultValue=" + defaultValue +
                ", required=" + required +
                ", validation=" + validation +
                '}';
    }
}
