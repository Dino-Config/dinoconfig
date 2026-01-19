/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enumeration of supported field types in DinoConfig schemas.
 *
 * <p>Each type corresponds to a JSON/JavaScript type and is used
 * to define the expected data type for configuration fields.
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public enum FieldType {

    /**
     * String type for text values.
     */
    STRING("string"),

    /**
     * Number type for numeric values (integers and decimals).
     */
    NUMBER("number"),

    /**
     * Boolean type for true/false values.
     */
    BOOLEAN("boolean"),

    /**
     * Object type for nested JSON objects.
     */
    OBJECT("object"),

    /**
     * Array type for lists of values.
     */
    ARRAY("array");

    private final String value;

    FieldType(String value) {
        this.value = value;
    }

    /**
     * Returns the JSON value representation of this field type.
     *
     * @return the JSON value string
     */
    @JsonValue
    public String getValue() {
        return value;
    }

    /**
     * Parses a string value into a FieldType.
     *
     * @param value the string value to parse
     * @return the corresponding FieldType
     * @throws IllegalArgumentException if the value is not a valid field type
     */
    public static FieldType fromValue(String value) {
        for (FieldType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown field type: " + value);
    }

    @Override
    public String toString() {
        return value;
    }
}
