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
import java.util.Optional;

/**
 * Full introspection result containing all brands, configs, and keys.
 *
 * <p>This class represents the complete structure of all configurations
 * accessible via the current API key. It's useful for code generation,
 * documentation, and understanding the full configuration hierarchy.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * ApiResponse<IntrospectionResult> response = discoveryAPI.introspect();
 * IntrospectionResult result = response.getData();
 *
 * System.out.printf("Company: %s%n", result.getCompany());
 * System.out.printf("Generated at: %s%n", result.getGeneratedAt());
 *
 * for (BrandInfoDetail brand : result.getBrands()) {
 *     System.out.printf("Brand: %s%n", brand.getName());
 *     for (ConfigInfoDetail config : brand.getConfigs()) {
 *         System.out.printf("  Config: %s (v%d)%n",
 *             config.getName(), config.getVersion());
 *         for (KeyInfo key : config.getKeys()) {
 *             System.out.printf("    %s: %s = %s%n",
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
public final class IntrospectionResult {

    @JsonProperty("company")
    private final String company;

    @JsonProperty("brands")
    private final List<BrandInfoDetail> brands;

    @JsonProperty("generatedAt")
    private final Instant generatedAt;

    /**
     * Default constructor for Jackson deserialization.
     */
    public IntrospectionResult() {
        this.company = null;
        this.brands = Collections.emptyList();
        this.generatedAt = null;
    }

    /**
     * Creates a new IntrospectionResult instance.
     *
     * @param company     the company name (must not be null)
     * @param brands      list of brand details
     * @param generatedAt timestamp when the introspection was generated
     * @throws NullPointerException if company is null
     */
    public IntrospectionResult(String company, List<BrandInfoDetail> brands, Instant generatedAt) {
        this.company = Objects.requireNonNull(company, "company must not be null");
        this.brands = brands != null ? Collections.unmodifiableList(brands) : Collections.emptyList();
        this.generatedAt = generatedAt;
    }

    /**
     * Returns the company name.
     *
     * @return the company name, never null
     */
    public String getCompany() {
        return company;
    }

    /**
     * Returns an immutable list of brand details.
     *
     * @return immutable list of BrandInfoDetail, never null
     */
    public List<BrandInfoDetail> getBrands() {
        return brands;
    }

    /**
     * Returns the timestamp when this introspection was generated.
     *
     * @return the generation timestamp, or null if not available
     */
    public Instant getGeneratedAt() {
        return generatedAt;
    }

    /**
     * Gets a specific brand by name.
     *
     * @param brandName the brand name to look up
     * @return Optional containing the BrandInfoDetail, or empty if not found
     */
    public Optional<BrandInfoDetail> getBrand(String brandName) {
        return brands.stream()
                .filter(b -> b.getName().equals(brandName))
                .findFirst();
    }

    /**
     * Returns the total number of brands.
     *
     * @return the brand count
     */
    public int getBrandCount() {
        return brands.size();
    }

    /**
     * Returns the total number of configurations across all brands.
     *
     * @return the total configuration count
     */
    public int getTotalConfigCount() {
        return brands.stream()
                .mapToInt(BrandInfoDetail::getConfigCount)
                .sum();
    }

    /**
     * Returns the total number of keys across all configurations.
     *
     * @return the total key count
     */
    public int getTotalKeyCount() {
        return brands.stream()
                .flatMap(b -> b.getConfigs().stream())
                .mapToInt(c -> c.getKeys().size())
                .sum();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IntrospectionResult that = (IntrospectionResult) o;
        return Objects.equals(company, that.company)
                && Objects.equals(brands, that.brands)
                && Objects.equals(generatedAt, that.generatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(company, brands, generatedAt);
    }

    @Override
    public String toString() {
        return "IntrospectionResult{" +
                "company='" + company + '\'' +
                ", brands=" + brands.size() + " brands" +
                ", generatedAt=" + generatedAt +
                '}';
    }
}
