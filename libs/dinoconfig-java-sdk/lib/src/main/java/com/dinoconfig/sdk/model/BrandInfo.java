/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Objects;

/**
 * Immutable information about a brand in DinoConfig.
 *
 * <p>This record represents metadata about a brand, including its name,
 * description, number of configurations, and creation timestamp.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * ApiResponse<List<BrandInfo>> response = discoveryAPI.listBrands();
 * for (BrandInfo brand : response.getData()) {
 *     System.out.printf("Brand: %s (%d configs)%n",
 *         brand.getName(), brand.getConfigCount());
 * }
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class BrandInfo {

    @JsonProperty("name")
    private final String name;

    @JsonProperty("description")
    private final String description;

    @JsonProperty("configCount")
    private final int configCount;

    @JsonProperty("createdAt")
    private final Instant createdAt;

    /**
     * Default constructor for Jackson deserialization.
     */
    public BrandInfo() {
        this.name = null;
        this.description = null;
        this.configCount = 0;
        this.createdAt = null;
    }

    /**
     * Creates a new BrandInfo instance.
     *
     * @param name        the brand name (must not be null)
     * @param description optional description of the brand
     * @param configCount number of configurations in this brand
     * @param createdAt   timestamp when the brand was created
     * @throws NullPointerException if name is null
     */
    public BrandInfo(String name, String description, int configCount, Instant createdAt) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.description = description;
        this.configCount = configCount;
        this.createdAt = createdAt;
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
     * @return the description, or null if not set
     */
    public String getDescription() {
        return description;
    }

    /**
     * Returns the number of configurations in this brand.
     *
     * @return the configuration count
     */
    public int getConfigCount() {
        return configCount;
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
        BrandInfo brandInfo = (BrandInfo) o;
        return configCount == brandInfo.configCount
                && Objects.equals(name, brandInfo.name)
                && Objects.equals(description, brandInfo.description)
                && Objects.equals(createdAt, brandInfo.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, description, configCount, createdAt);
    }

    @Override
    public String toString() {
        return "BrandInfo{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", configCount=" + configCount +
                ", createdAt=" + createdAt +
                '}';
    }
}
