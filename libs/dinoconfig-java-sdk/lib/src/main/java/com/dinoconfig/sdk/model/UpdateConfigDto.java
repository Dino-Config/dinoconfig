package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.Map;

/**
 * Data Transfer Object for updating an existing configuration.
 */
public class UpdateConfigDto {
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("formData")
    private Map<String, Object> formData;
    
    @JsonProperty("schema")
    private JsonNode schema;
    
    @JsonProperty("uiSchema")
    private JsonNode uiSchema;
    
    /**
     * Default constructor
     */
    public UpdateConfigDto() {}
    
    // Getters and Setters
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
}
