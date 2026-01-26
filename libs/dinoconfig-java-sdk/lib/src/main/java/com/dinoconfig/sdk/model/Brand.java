/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

/**
 * Immutable model representing a brand entity.
 *
 * <p>A brand is a logical grouping of configurations in DinoConfig.
 * Organizations typically create brands to separate configurations
 * by product, environment, or business unit.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * ApiResponse<List<BrandInfo>> response = discoveryAPI.listBrands();
 * for (BrandInfo brand : response.getData()) {
 *     System.out.printf("Brand ID: %d, Name: %s%n",
 *         brand.getId(), brand.getName());
 * }
 * }</pre>
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class Brand {

    @JsonProperty("id")
    private final Integer id;

    @JsonProperty("name")
    private final String name;

    /**
     * Default constructor for Jackson deserialization.
     */
    public Brand() {
        this.id = null;
        this.name = null;
    }

    /**
     * Constructs a new Brand with the specified id and name.
     *
     * @param id   The unique identifier for this brand
     * @param name The name of the brand
     */
    public Brand(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    /**
     * Returns the unique identifier of this brand.
     *
     * @return The brand ID, or null if not set
     */
    public Integer getId() {
        return id;
    }

    /**
     * Returns the name of this brand.
     *
     * @return The brand name, or null if not set
     */
    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Brand brand = (Brand) o;
        return Objects.equals(id, brand.id) && Objects.equals(name, brand.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }

    @Override
    public String toString() {
        return "Brand{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
