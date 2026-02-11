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
 * Detailed brand information including configuration details.
 *
 * <p>This class extends basic brand metadata with detailed information
 * about each configuration and its keys. Used in introspection results.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * IntrospectionResult result = discoveryAPI.introspect().getData();
 * for (BrandInfoDetail brand : result.getBrands()) {
 *     System.out.printf("Brand: %s%n", brand.getName());
 *     for (ConfigInfoDetail config : brand.getConfigs()) {
 *         System.out.printf("  Config: %s%n", config.getName());
 *     }
 * }
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public final class BrandInfoDetail {

    @JsonProperty("name")
    private final String name;

    @JsonProperty("description")
    private final String description;

    @JsonProperty("configs")
    private final List<ConfigInfoDetail> configs;

    /**
     * Default constructor for Jackson deserialization.
     */
    public BrandInfoDetail() {
        this.name = null;
        this.description = null;
        this.configs = Collections.emptyList();
    }

    /**
     * Creates a new BrandInfoDetail instance.
     *
     * @param name        the brand name (must not be null)
     * @param description optional description
     * @param configs     list of configuration details
     * @throws NullPointerException if name is null
     */
    public BrandInfoDetail(String name, String description, List<ConfigInfoDetail> configs) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.description = description;
        this.configs = configs != null ? Collections.unmodifiableList(configs) : Collections.emptyList();
    }

    /**
     * Returns the brand name.
     *
     * @return the brand name, never null
     */
    public String getName() {
        return name;
    }

    /**
     * Returns the optional brand description.
     *
     * @return Optional containing the description, or empty if not set
     */
    public Optional<String> getDescription() {
        return Optional.ofNullable(description);
    }

    /**
     * Returns an immutable list of configuration details.
     *
     * @return immutable list of ConfigInfoDetail, never null
     */
    public List<ConfigInfoDetail> getConfigs() {
        return configs;
    }

    /**
     * Gets a specific configuration by name.
     *
     * @param configName the configuration name to look up
     * @return Optional containing the ConfigInfoDetail, or empty if not found
     */
    public Optional<ConfigInfoDetail> getConfig(String configName) {
        return configs.stream()
                .filter(c -> c.getName().equals(configName))
                .findFirst();
    }

    /**
     * Returns the number of configurations in this brand.
     *
     * @return the configuration count
     */
    public int getConfigCount() {
        return configs.size();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BrandInfoDetail that = (BrandInfoDetail) o;
        return Objects.equals(name, that.name)
                && Objects.equals(description, that.description)
                && Objects.equals(configs, that.configs);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, description, configs);
    }

    @Override
    public String toString() {
        return "BrandInfoDetail{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", configs=" + configs.size() + " configs" +
                '}';
    }
}
