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
import java.util.Objects;

/**
 * Immutable information about a configuration in DinoConfig.
 *
 * <p>This class represents metadata about a configuration, including its name,
 * description, list of keys, version, and creation timestamp.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * ApiResponse<List<ConfigInfo>> response = discoveryAPI.listConfigs("MyBrand");
 * for (ConfigInfo config : response.getData()) {
 *     System.out.printf("Config: %s (v%d) - %d keys%n",
 *         config.getName(), config.getVersion(), config.getKeys().size());
 * }
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class ConfigInfo {

    @JsonProperty("name")
    private final String name;

    @JsonProperty("description")
    private final String description;

    @JsonProperty("keys")
    private final List<String> keys;

    @JsonProperty("version")
    private final int version;

    @JsonProperty("createdAt")
    private final Instant createdAt;

    /**
     * Default constructor for Jackson deserialization.
     */
    public ConfigInfo() {
        this.name = null;
        this.description = null;
        this.keys = Collections.emptyList();
        this.version = 0;
        this.createdAt = null;
    }

    /**
     * Creates a new ConfigInfo instance.
     *
     * @param name        the configuration name (must not be null)
     * @param description optional description of the configuration
     * @param keys        list of key names in this configuration
     * @param version     the configuration version
     * @param createdAt   timestamp when the configuration was created
     * @throws NullPointerException if name is null
     */
    public ConfigInfo(String name, String description, List<String> keys, int version, Instant createdAt) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.description = description;
        this.keys = keys != null ? Collections.unmodifiableList(keys) : Collections.emptyList();
        this.version = version;
        this.createdAt = createdAt;
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
     * @return the description, or null if not set
     */
    public String getDescription() {
        return description;
    }

    /**
     * Returns an immutable list of key names in this configuration.
     *
     * @return immutable list of keys, never null
     */
    public List<String> getKeys() {
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
     * Returns the creation timestamp.
     *
     * @return the creation timestamp, or null if not available
     */
    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConfigInfo that = (ConfigInfo) o;
        return version == that.version
                && Objects.equals(name, that.name)
                && Objects.equals(description, that.description)
                && Objects.equals(keys, that.keys)
                && Objects.equals(createdAt, that.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, description, keys, version, createdAt);
    }

    @Override
    public String toString() {
        return "ConfigInfo{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", keys=" + keys +
                ", version=" + version +
                ", createdAt=" + createdAt +
                '}';
    }
}
