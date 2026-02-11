/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Detailed configuration information including key details.
 *
 * <p>This class extends basic configuration metadata with detailed
 * information about each key, including types and values.
 * Used in introspection results.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * IntrospectionResult result = discoveryAPI.introspect().getData();
 * for (BrandInfoDetail brand : result.getBrands()) {
 *     for (ConfigInfoDetail config : brand.getConfigs()) {
 *         System.out.printf("Config: %s (v%d)%n",
 *             config.getName(), config.getVersion());
 *         for (KeyInfo key : config.getKeys()) {
 *             System.out.printf("  %s = %s%n", key.getName(), key.getValue());
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
public final class ConfigInfoDetail {

    @JsonProperty("name")
    private final String name;

    @JsonProperty("description")
    private final String description;

    @JsonProperty("keys")
    private final List<KeyInfo> keys;

    @JsonProperty("version")
    private final int version;

    /**
     * Default constructor for Jackson deserialization.
     */
    public ConfigInfoDetail() {
        this.name = null;
        this.description = null;
        this.keys = Collections.emptyList();
        this.version = 0;
    }

    /**
     * Creates a new ConfigInfoDetail instance.
     *
     * @param name        the configuration name (must not be null)
     * @param description optional description
     * @param keys        list of key information
     * @param version     the configuration version
     * @throws NullPointerException if name is null
     */
    public ConfigInfoDetail(String name, String description, List<KeyInfo> keys, int version) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.description = description;
        this.keys = keys != null ? Collections.unmodifiableList(keys) : Collections.emptyList();
        this.version = version;
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
     * Returns an immutable list of key information.
     *
     * @return immutable list of KeyInfo, never null
     */
    public List<KeyInfo> getKeys() {
        return keys;
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
     * Gets a specific key by name.
     *
     * @param keyName the key name to look up
     * @return Optional containing the KeyInfo, or empty if not found
     */
    public Optional<KeyInfo> getKey(String keyName) {
        return keys.stream()
                .filter(k -> k.getName().equals(keyName))
                .findFirst();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConfigInfoDetail that = (ConfigInfoDetail) o;
        return version == that.version
                && Objects.equals(name, that.name)
                && Objects.equals(description, that.description)
                && Objects.equals(keys, that.keys);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, description, keys, version);
    }

    @Override
    public String toString() {
        return "ConfigInfoDetail{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", keys=" + keys.size() + " keys" +
                ", version=" + version +
                '}';
    }
}
