/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

/**
 * Information about a configuration key, including its type and value.
 *
 * <p>This class is used in introspection results to provide detailed
 * information about each key in a configuration.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * IntrospectionResult result = discoveryAPI.introspect().getData();
 * for (BrandInfoDetail brand : result.getBrands()) {
 *     for (ConfigInfoDetail config : brand.getConfigs()) {
 *         for (KeyInfo key : config.getKeys()) {
 *             System.out.printf("%s: %s = %s%n",
 *                 key.getName(), key.getType(), key.getValue());
 *         }
 *     }
 * }
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public final class KeyInfo {

    @JsonProperty("name")
    private final String name;

    @JsonProperty("type")
    private final String type;

    @JsonProperty("value")
    private final Object value;

    /**
     * Default constructor for Jackson deserialization.
     */
    public KeyInfo() {
        this.name = null;
        this.type = null;
        this.value = null;
    }

    /**
     * Creates a new KeyInfo instance.
     *
     * @param name  the key name (must not be null)
     * @param type  the value type (e.g., "string", "number", "boolean")
     * @param value the current value
     * @throws NullPointerException if name is null
     */
    public KeyInfo(String name, String type, Object value) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.type = type;
        this.value = value;
    }

    /**
     * Returns the key name.
     *
     * @return the key name, never null
     */
    public String getName() {
        return name;
    }

    /**
     * Returns the value type as a string.
     *
     * @return the type string (e.g., "string", "number", "boolean")
     */
    public String getType() {
        return type;
    }

    /**
     * Returns the current value.
     *
     * @return the value, may be null
     */
    public Object getValue() {
        return value;
    }

    /**
     * Returns the value cast to the specified type.
     *
     * @param <T>  the expected type
     * @param type the class of the expected type
     * @return the value cast to the specified type
     * @throws ClassCastException if the value cannot be cast to the specified type
     */
    @SuppressWarnings("unchecked")
    public <T> T getValueAs(Class<T> type) {
        return (T) value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        KeyInfo keyInfo = (KeyInfo) o;
        return Objects.equals(name, keyInfo.name)
                && Objects.equals(type, keyInfo.type)
                && Objects.equals(value, keyInfo.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, type, value);
    }

    @Override
    public String toString() {
        return "KeyInfo{" +
                "name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", value=" + value +
                '}';
    }
}
