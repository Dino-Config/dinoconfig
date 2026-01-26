---
sidebar_position: 4
title: Discovery API
description: Explore and introspect your DinoConfig brands, configurations, and schemas using the Java SDK Discovery API.
---

# Discovery API

The Discovery API allows you to explore and introspect your DinoConfig setup. Use it to list brands, discover configurations, examine schemas, and perform full introspection.

## Overview

Access the Discovery API through your initialized SDK instance:

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_...");
DiscoveryAPI discoveryApi = sdk.getDiscoveryAPI();
```

## Methods

### `listBrands()` — List All Brands

Returns all brands accessible with your API key.

#### Signature

```java
ApiResponse<List<BrandInfo>> listBrands()
ApiResponse<List<BrandInfo>> listBrands(RequestOptions options)
```

#### Returns

```java
public class BrandInfo {
    private String name;
    private String description;
    private int configCount;
    private Instant createdAt;
    
    // Getters
}
```

#### Example

```java
var response = sdk.getDiscoveryAPI().listBrands();

if (response.hasData()) {
    for (BrandInfo brand : response.getData()) {
        System.out.printf("%s: %d configurations%n", 
            brand.getName(), 
            brand.getConfigCount()
        );
        System.out.printf("  Description: %s%n", 
            brand.getDescription() != null ? brand.getDescription() : "N/A"
        );
        System.out.printf("  Created: %s%n", brand.getCreatedAt());
    }
}
```

**Output:**
```
MyApp: 5 configurations
  Description: Main application settings
  Created: 2024-01-15T10:30:00Z
FeatureFlags: 2 configurations
  Description: Feature toggle configurations
  Created: 2024-02-20T14:45:00Z
```

---

### `listConfigs()` — List Configurations for a Brand

Returns all configurations within a specific brand.

#### Signature

```java
ApiResponse<List<ConfigInfo>> listConfigs(String brandName)
ApiResponse<List<ConfigInfo>> listConfigs(String brandName, RequestOptions options)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `String` | Yes | The brand name to list configs for |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```java
public class ConfigInfo {
    private String name;
    private String description;
    private List<String> keys;
    private int version;
    private Instant createdAt;
    
    // Getters
}
```

#### Example

```java
var response = sdk.getDiscoveryAPI().listConfigs("MyApp");

if (response.hasData()) {
    for (ConfigInfo config : response.getData()) {
        System.out.printf("📁 %s (v%d)%n", config.getName(), config.getVersion());
        System.out.printf("   Keys: %s%n", String.join(", ", config.getKeys()));
    }
}
```

**Output:**
```
📁 Settings (v3)
   Keys: theme, maxItems, features, apiEndpoint
📁 Database (v1)
   Keys: host, port, name, poolSize
📁 Authentication (v2)
   Keys: provider, clientId, scopes, redirectUri
```

---

### `getSchema()` — Get Configuration Schema

Returns the schema definition for a specific configuration, including field types and validation rules.

#### Signature

```java
ApiResponse<ConfigSchema> getSchema(String brandName, String configName)
ApiResponse<ConfigSchema> getSchema(String brandName, String configName, RequestOptions options)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `String` | Yes | The brand name |
| `configName` | `String` | Yes | The configuration name |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```java
public class ConfigSchema {
    private String configName;
    private int version;
    private Map<String, FieldSchema> fields;
    
    // Getters
}

public class FieldSchema {
    private FieldType type;          // STRING, NUMBER, BOOLEAN, OBJECT, ARRAY
    private String description;
    private Object defaultValue;
    private Boolean required;
    private FieldValidation validation;
    
    // Getters
}

public class FieldValidation {
    private Number min;
    private Number max;
    private String pattern;
    private List<Object> enumValues;
    
    // Getters
}

public enum FieldType {
    STRING, NUMBER, BOOLEAN, OBJECT, ARRAY
}
```

#### Example

```java
var response = sdk.getDiscoveryAPI().getSchema("MyApp", "Settings");

if (response.hasData()) {
    ConfigSchema schema = response.getData();
    System.out.printf("Schema for %s (v%d):%n", 
        schema.getConfigName(), 
        schema.getVersion()
    );
    
    for (var entry : schema.getFields().entrySet()) {
        String key = entry.getKey();
        FieldSchema field = entry.getValue();
        
        System.out.printf("%n  %s:%n", key);
        System.out.printf("    Type: %s%n", field.getType());
        System.out.printf("    Required: %s%n", 
            field.getRequired() != null ? field.getRequired() : false
        );
        
        if (field.getDescription() != null) {
            System.out.printf("    Description: %s%n", field.getDescription());
        }
        
        if (field.getDefaultValue() != null) {
            System.out.printf("    Default: %s%n", field.getDefaultValue());
        }
        
        if (field.getValidation() != null) {
            System.out.printf("    Validation: %s%n", field.getValidation());
        }
    }
}
```

**Output:**
```
Schema for Settings (v3):

  theme:
    Type: STRING
    Required: true
    Description: Application color theme
    Default: light
    Validation: FieldValidation{enum=[light, dark, system]}

  maxItems:
    Type: NUMBER
    Required: false
    Description: Maximum items per page
    Default: 50
    Validation: FieldValidation{min=10, max=100}

  features:
    Type: ARRAY
    Required: false
    Description: Enabled feature flags
    Default: []
```

---

### `introspect()` — Full Introspection

Performs a complete introspection of all brands, configurations, and keys accessible with your API key.

#### Signature

```java
ApiResponse<IntrospectionResult> introspect()
ApiResponse<IntrospectionResult> introspect(RequestOptions options)
```

#### Returns

```java
public class IntrospectionResult {
    private String company;
    private List<BrandInfoDetail> brands;
    private Instant generatedAt;
    
    public Optional<BrandInfoDetail> getBrand(String brandName) { /* ... */ }
    public int getBrandCount() { /* ... */ }
    public int getTotalConfigCount() { /* ... */ }
    public int getTotalKeyCount() { /* ... */ }
}

public class BrandInfoDetail {
    private String name;
    private String description;
    private List<ConfigInfoDetail> configs;
    
    // Getters
}

public class ConfigInfoDetail {
    private String name;
    private String description;
    private int version;
    private List<KeyInfo> keys;
    
    // Getters
}

public class KeyInfo {
    private String name;
    private FieldType type;
    private String description;
    
    // Getters
}
```

#### Example

```java
var response = sdk.getDiscoveryAPI().introspect();

if (response.hasData()) {
    IntrospectionResult result = response.getData();
    
    System.out.printf("%n🏢 %s%n", result.getCompany());
    System.out.printf("Generated at: %s%n", result.getGeneratedAt());
    System.out.printf("Total: %d brands, %d configs, %d keys%n%n",
        result.getBrandCount(),
        result.getTotalConfigCount(),
        result.getTotalKeyCount()
    );
    
    for (BrandInfoDetail brand : result.getBrands()) {
        System.out.printf("📦 %s%n", brand.getName());
        
        for (ConfigInfoDetail config : brand.getConfigs()) {
            System.out.printf("  📁 %s (v%d)%n", 
                config.getName(), 
                config.getVersion()
            );
            
            for (KeyInfo key : config.getKeys()) {
                System.out.printf("    • %s: %s%n", 
                    key.getName(), 
                    key.getType()
                );
            }
        }
        
        System.out.println();
    }
}
```

**Output:**
```
🏢 Acme Corporation
Generated at: 2024-03-15T10:30:00Z
Total: 2 brands, 5 configs, 23 keys

📦 MyApp
  📁 Settings (v3)
    • theme: STRING
    • maxItems: NUMBER
    • features: ARRAY
  📁 Database (v1)
    • host: STRING
    • port: NUMBER
    • name: STRING

📦 FeatureFlags
  📁 Web (v2)
    • darkMode: BOOLEAN
    • newDashboard: BOOLEAN
    • betaFeatures: OBJECT
```

## Use Cases

### Dynamic Configuration Loading

Use discovery to dynamically load all configurations:

```java
public Map<String, Map<String, Object>> loadAllConfigs() {
    Map<String, Map<String, Object>> configs = new HashMap<>();
    
    var brands = sdk.getDiscoveryAPI().listBrands();
    
    for (BrandInfo brand : brands.getData()) {
        var brandConfigs = sdk.getDiscoveryAPI().listConfigs(brand.getName());
        
        for (ConfigInfo configInfo : brandConfigs.getData()) {
            String path = brand.getName() + "." + configInfo.getName();
            var config = sdk.getConfigAPI().get(path);
            
            if (config.hasData()) {
                configs.put(path, config.getData().getValues());
            }
        }
    }
    
    return configs;
}
```

### Configuration Documentation Generator

Auto-generate documentation from schemas:

```java
public String generateMarkdownDocs(String brandName) {
    StringBuilder markdown = new StringBuilder();
    markdown.append("# ").append(brandName).append(" Configuration\n\n");
    
    var configs = sdk.getDiscoveryAPI().listConfigs(brandName);
    
    for (ConfigInfo configInfo : configs.getData()) {
        var schema = sdk.getDiscoveryAPI().getSchema(brandName, configInfo.getName());
        
        if (!schema.hasData()) continue;
        
        markdown.append("## ").append(configInfo.getName()).append("\n\n");
        
        if (configInfo.getDescription() != null) {
            markdown.append(configInfo.getDescription()).append("\n\n");
        }
        
        markdown.append("| Key | Type | Required | Description |\n");
        markdown.append("|-----|------|----------|-------------|\n");
        
        for (var entry : schema.getData().getFields().entrySet()) {
            String key = entry.getKey();
            FieldSchema field = entry.getValue();
            
            markdown.append("| ")
                .append(key).append(" | ")
                .append(field.getType()).append(" | ")
                .append(field.getRequired() != null && field.getRequired() ? "Yes" : "No").append(" | ")
                .append(field.getDescription() != null ? field.getDescription() : "-")
                .append(" |\n");
        }
        
        markdown.append("\n");
    }
    
    return markdown.toString();
}
```

### Finding Specific Brands

```java
// Get specific brand from introspection
var result = sdk.getDiscoveryAPI().introspect();

result.getData().getBrand("MyApp").ifPresent(brand -> {
    System.out.println("Found brand: " + brand.getName());
    System.out.println("Configs: " + brand.getConfigs().size());
});
```

## Best Practices

### 1. Use Introspection for Initial Load

For applications that need all configs, use `introspect()` to get everything in one call:

```java
// ✅ Single call for everything
var all = sdk.getDiscoveryAPI().introspect();

// ❌ Multiple calls (slower)
var brands = sdk.getDiscoveryAPI().listBrands();
for (BrandInfo brand : brands.getData()) {
    var configs = sdk.getDiscoveryAPI().listConfigs(brand.getName());
    // ...
}
```

### 2. Cache Discovery Results

Discovery data changes infrequently—consider caching it:

```java
private IntrospectionResult cachedIntrospection;
private Instant cacheExpiry;

public IntrospectionResult getIntrospection() {
    if (cachedIntrospection == null || Instant.now().isAfter(cacheExpiry)) {
        var response = sdk.getDiscoveryAPI().introspect();
        if (response.hasData()) {
            cachedIntrospection = response.getData();
            cacheExpiry = Instant.now().plus(Duration.ofHours(1));
        }
    }
    return cachedIntrospection;
}
```

### 3. Handle Permissions Gracefully

Your API key may not have access to all brands:

```java
var brands = sdk.getDiscoveryAPI().listBrands();
System.out.printf("You have access to %d brands%n", brands.getData().size());
```

## Next Steps

- **[Typed Configs →](typed-configs)** — Generate type-safe models
- **[Examples →](examples)** — Real-world usage patterns
