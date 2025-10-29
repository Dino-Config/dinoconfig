package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Configuration model representing a configuration entity.
 */
public class Config {
    
    @JsonProperty("id")
    private Integer id;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("company")
    private String company;
    
    @JsonProperty("formData")
    private Map<String, Object> formData;
    
    @JsonProperty("schema")
    private JsonNode schema;
    
    @JsonProperty("uiSchema")
    private JsonNode uiSchema;
    
    @JsonProperty("version")
    private Integer version;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("brand")
    private Brand brand;
    
    /**
     * Default constructor
     */
    public Config() {}
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
    public Map<String, Object> getFormData() {
        return formData;
    }
    
    public void setFormData(Map<String, Object> formData) {
        this.formData = formData;
    }
    
    public JsonNode getSchema() {
        return schema;
    }
    
    public void setSchema(JsonNode schema) {
        this.schema = schema;
    }
    
    public JsonNode getUiSchema() {
        return uiSchema;
    }
    
    public void setUiSchema(JsonNode uiSchema) {
        this.uiSchema = uiSchema;
    }
    
    public Integer getVersion() {
        return version;
    }
    
    public void setVersion(Integer version) {
        this.version = version;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Brand getBrand() {
        return brand;
    }
    
    public void setBrand(Brand brand) {
        this.brand = brand;
    }
}
