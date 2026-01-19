/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Validation rules for a configuration field.
 *
 * <p>This class contains various validation constraints that can be applied
 * to configuration fields, such as minimum/maximum values, length constraints,
 * patterns, and enumerated values.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * FieldSchema field = schema.getFields().get("maxConnections");
 * FieldValidation validation = field.getValidation();
 * if (validation != null) {
 *     validation.getMin().ifPresent(min ->
 *         System.out.println("Minimum value: " + min));
 *     validation.getMax().ifPresent(max ->
 *         System.out.println("Maximum value: " + max));
 * }
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class FieldValidation {

    @JsonProperty("min")
    private final Number min;

    @JsonProperty("max")
    private final Number max;

    @JsonProperty("minLength")
    private final Integer minLength;

    @JsonProperty("maxLength")
    private final Integer maxLength;

    @JsonProperty("pattern")
    private final String pattern;

    @JsonProperty("enum")
    private final List<Object> enumValues;

    /**
     * Default constructor for Jackson deserialization.
     */
    public FieldValidation() {
        this.min = null;
        this.max = null;
        this.minLength = null;
        this.maxLength = null;
        this.pattern = null;
        this.enumValues = null;
    }

    /**
     * Creates a new FieldValidation with all validation rules.
     *
     * @param min        minimum numeric value
     * @param max        maximum numeric value
     * @param minLength  minimum string length
     * @param maxLength  maximum string length
     * @param pattern    regex pattern for validation
     * @param enumValues list of allowed values
     */
    public FieldValidation(Number min, Number max, Integer minLength, Integer maxLength,
                          String pattern, List<Object> enumValues) {
        this.min = min;
        this.max = max;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.pattern = pattern;
        this.enumValues = enumValues != null ? Collections.unmodifiableList(enumValues) : null;
    }

    /**
     * Returns the minimum numeric value constraint.
     *
     * @return Optional containing the minimum value, or empty if not set
     */
    public Optional<Number> getMin() {
        return Optional.ofNullable(min);
    }

    /**
     * Returns the maximum numeric value constraint.
     *
     * @return Optional containing the maximum value, or empty if not set
     */
    public Optional<Number> getMax() {
        return Optional.ofNullable(max);
    }

    /**
     * Returns the minimum string length constraint.
     *
     * @return Optional containing the minimum length, or empty if not set
     */
    public Optional<Integer> getMinLength() {
        return Optional.ofNullable(minLength);
    }

    /**
     * Returns the maximum string length constraint.
     *
     * @return Optional containing the maximum length, or empty if not set
     */
    public Optional<Integer> getMaxLength() {
        return Optional.ofNullable(maxLength);
    }

    /**
     * Returns the regex pattern for validation.
     *
     * @return Optional containing the pattern, or empty if not set
     */
    public Optional<String> getPattern() {
        return Optional.ofNullable(pattern);
    }

    /**
     * Returns the list of allowed enumerated values.
     *
     * @return Optional containing an immutable list of allowed values, or empty if not set
     */
    public Optional<List<Object>> getEnumValues() {
        return Optional.ofNullable(enumValues);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FieldValidation that = (FieldValidation) o;
        return Objects.equals(min, that.min)
                && Objects.equals(max, that.max)
                && Objects.equals(minLength, that.minLength)
                && Objects.equals(maxLength, that.maxLength)
                && Objects.equals(pattern, that.pattern)
                && Objects.equals(enumValues, that.enumValues);
    }

    @Override
    public int hashCode() {
        return Objects.hash(min, max, minLength, maxLength, pattern, enumValues);
    }

    @Override
    public String toString() {
        return "FieldValidation{" +
                "min=" + min +
                ", max=" + max +
                ", minLength=" + minLength +
                ", maxLength=" + maxLength +
                ", pattern='" + pattern + '\'' +
                ", enumValues=" + enumValues +
                '}';
    }
}
