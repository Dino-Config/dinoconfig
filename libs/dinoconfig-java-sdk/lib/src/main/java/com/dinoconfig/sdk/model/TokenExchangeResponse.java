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
 * Immutable response model for token exchange API call.
 *
 * <p>This class represents the response from the API key to access token
 * exchange endpoint. It contains the access token and related metadata.
 *
 * <p><b>Note:</b> This class is used internally by the SDK during initialization
 * and is not typically used directly by SDK consumers.
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public final class TokenExchangeResponse {

    @JsonProperty("access_token")
    private final String accessToken;

    @JsonProperty("expires_in")
    private final Integer expiresIn;

    @JsonProperty("token_type")
    private final String tokenType;

    @JsonProperty("company")
    private final String company;

    @JsonProperty("scope")
    private final String scope;

    /**
     * Default constructor for Jackson deserialization.
     */
    public TokenExchangeResponse() {
        this.accessToken = null;
        this.expiresIn = null;
        this.tokenType = null;
        this.company = null;
        this.scope = null;
    }

    /**
     * Full constructor for creating TokenExchangeResponse instances.
     *
     * @param accessToken The JWT access token
     * @param expiresIn   Token expiration time in seconds
     * @param tokenType   The type of token (typically "Bearer")
     * @param company     The company associated with this token
     * @param scope       The scope of permissions granted
     */
    public TokenExchangeResponse(String accessToken, Integer expiresIn,
                                  String tokenType, String company, String scope) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.tokenType = tokenType;
        this.company = company;
        this.scope = scope;
    }

    /**
     * Returns the JWT access token.
     *
     * @return The access token, or null if not present
     */
    public String getAccessToken() {
        return accessToken;
    }

    /**
     * Returns the token expiration time in seconds.
     *
     * @return Optional containing the expiration time, or empty if not present
     */
    public Optional<Integer> getExpiresIn() {
        return Optional.ofNullable(expiresIn);
    }

    /**
     * Returns the token type (typically "Bearer").
     *
     * @return The token type, or null if not present
     */
    public String getTokenType() {
        return tokenType;
    }

    /**
     * Returns the company associated with this token.
     *
     * @return The company name, or null if not present
     */
    public String getCompany() {
        return company;
    }

    /**
     * Returns the scope of permissions granted.
     *
     * @return Optional containing the scope, or empty if not present
     */
    public Optional<String> getScope() {
        return Optional.ofNullable(scope);
    }

    /**
     * Checks if this response contains a valid access token.
     *
     * @return true if the access token is present and not empty
     */
    public boolean hasValidToken() {
        return accessToken != null && !accessToken.trim().isEmpty();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TokenExchangeResponse that = (TokenExchangeResponse) o;
        return Objects.equals(accessToken, that.accessToken)
                && Objects.equals(expiresIn, that.expiresIn)
                && Objects.equals(tokenType, that.tokenType)
                && Objects.equals(company, that.company)
                && Objects.equals(scope, that.scope);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accessToken, expiresIn, tokenType, company, scope);
    }

    @Override
    public String toString() {
        return "TokenExchangeResponse{" +
                "accessToken='" + (accessToken != null ? "****" : "null") + '\'' +
                ", expiresIn=" + expiresIn +
                ", tokenType='" + tokenType + '\'' +
                ", company='" + company + '\'' +
                ", scope='" + scope + '\'' +
                '}';
    }
}
