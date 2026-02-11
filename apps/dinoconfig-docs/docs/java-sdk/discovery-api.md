---
sidebar_position: 4
title: Discovery API Reference
description: Explore available brands, configurations, and schemas using the DinoConfig Java SDK Discovery API. Introspect API permissions and capabilities.
keywords: [discovery api, list brands, list configs, schema, introspection, java sdk api, api exploration]
---

# Discovery API

The Discovery API allows you to explore what brands and configurations are available to your API key. All methods return values directly — no wrapper objects needed.

## Overview

Access the Discovery API through your initialized SDK instance:

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_...", "https://api.dinoconfig.com");
DiscoveryAPI discoveryApi = sdk.getDiscoveryAPI();
```

## Methods

### `listBrands()` — List Available Brands

Returns a list of all brands accessible to your API key.

#### Signature

```java
List<BrandInfo> listBrands() throws IOException
List<BrandInfo> listBrands(RequestOptions options) throws IOException
```

#### Returns

```java
public class BrandInfo {
    private String name;
    private String description;
    private int configCount;
    private Instant createdAt;
    
    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getConfigCount() { return configCount; }
    public Instant getCreatedAt() { return createdAt; }
}
```

#### Example

```java
// Returns List<BrandInfo> directly - no wrapper!
List<BrandInfo> brands = sdk.getDiscoveryAPI().listBrands();

for (BrandInfo brand : brands) {
    System.out.printf("Brand: %s%n", brand.getName());
    System.out.printf("  Description: %s%n", brand.getDescription());
    System.out.printf("  Configurations: %d%n", brand.getConfigCount());
}
```

---

### `listConfigs()` — List Brand Configurations

Returns all configurations for a specific brand.

#### Signature

```java
List<ConfigInfo> listConfigs(String brandName) throws IOException
List<ConfigInfo> listConfigs(String brandName, RequestOptions options) throws IOException
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `String` | Yes | Name of the brand |
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
    public String getName() { return name; }
    public String getDescription() { return description; }
    public List<String> getKeys() { return keys; }
    public int getVersion() { return version; }
    public Instant getCreatedAt() { return createdAt; }
}
```

#### Example

```java
// Returns List<ConfigInfo> directly
List<ConfigInfo> configs = sdk.getDiscoveryAPI().listConfigs("MyBrand");

for (ConfigInfo config : configs) {
    System.out.printf("Config: %s (v%d)%n", config.getName(), config.getVersion());
    System.out.printf("  Description: %s%n", config.getDescription());
    System.out.printf("  Keys: %s%n", String.join(", ", config.getKeys()));
}
```

---

### `getSchema()` — Get Configuration Schema

Retrieves the detailed schema for a specific configuration, including field types and constraints.

#### Signature

```java
ConfigSchema getSchema(String brandName, String configName) throws IOException
ConfigSchema getSchema(String brandName, String configName, RequestOptions options) throws IOException
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `String` | Yes | Name of the brand |
| `configName` | `String` | Yes | Name of the configuration |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```java
public class ConfigSchema {
    private String configName;
    private int version;
    private Map<String, FieldSchema> fields;
    
    // Getters
    public String getConfigName() { return configName; }
    public int getVersion() { return version; }
    public Map<String, FieldSchema> getFields() { return fields; }
}

public class FieldSchema {
    private FieldType type;
    private String description;
    private Object defaultValue;
    private Boolean required;
    private FieldValidation validation;
    
    // Getters
    public FieldType getType() { return type; }
    public Optional<String> getDescription() { return Optional.ofNullable(description); }
    public Optional<Object> getDefaultValue() { return Optional.ofNullable(defaultValue); }
    public boolean isRequired() { return Boolean.TRUE.equals(required); }
    public Optional<FieldValidation> getValidation() { return Optional.ofNullable(validation); }
}
```

#### Example

```java
// Returns ConfigSchema directly
ConfigSchema schema = sdk.getDiscoveryAPI().getSchema("MyBrand", "AppSettings");

System.out.printf("Schema: %s (v%d)%n", schema.getConfigName(), schema.getVersion());
System.out.println("Fields:");

for (Map.Entry<String, FieldSchema> entry : schema.getFields().entrySet()) {
    String fieldName = entry.getKey();
    FieldSchema field = entry.getValue();
    
    System.out.printf("  %s: %s%n", fieldName, field.getType());
    System.out.printf("    Required: %b%n", field.isRequired());
    
    field.getDefaultValue().ifPresent(d -> 
        System.out.printf("    Default: %s%n", d));
}
```

---

### `introspect()` — Full Introspection

Returns a complete snapshot of all brands, configurations, and keys accessible to your API key. Useful for code generation, documentation, and understanding your configuration hierarchy.

#### Signature

```java
IntrospectionResult introspect() throws IOException
IntrospectionResult introspect(RequestOptions options) throws IOException
```

#### Returns

```java
public class IntrospectionResult {
    private String company;
    private List<BrandInfoDetail> brands;
    private Instant generatedAt;
    
    // Getters
    public String getCompany() { return company; }
    public List<BrandInfoDetail> getBrands() { return brands; }
    public Instant getGeneratedAt() { return generatedAt; }
    
    // Helper methods
    public Optional<BrandInfoDetail> getBrand(String brandName) { /* ... */ }
    public int getBrandCount() { /* ... */ }
    public int getTotalConfigCount() { /* ... */ }
    public int getTotalKeyCount() { /* ... */ }
}
```

#### Example

```java
// Returns IntrospectionResult directly
IntrospectionResult info = sdk.getDiscoveryAPI().introspect();

System.out.printf("Company: %s%n", info.getCompany());
System.out.printf("Total brands: %d%n", info.getBrandCount());
System.out.printf("Total configs: %d%n", info.getTotalConfigCount());
System.out.printf("Total keys: %d%n", info.getTotalKeyCount());

// Check brand access
if (info.getBrand("MyBrand").isPresent()) {
    System.out.println("This key can access MyBrand");
}

for (BrandInfoDetail brand : info.getBrands()) {
    System.out.printf("Brand: %s%n", brand.getName());
    for (ConfigInfoDetail config : brand.getConfigs()) {
        System.out.printf("  Config: %s (v%d)%n", config.getName(), config.getVersion());
    }
}
```

## Request Options

All methods accept optional `RequestOptions`:

```java
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)
    .build();

List<BrandInfo> brands = sdk.getDiscoveryAPI().listBrands(options);
```

## Use Cases

### Build Configuration Browser

```java
public class ConfigBrowser {
    private final DiscoveryAPI discovery;
    
    public ConfigBrowser(DinoConfigSDK sdk) {
        this.discovery = sdk.getDiscoveryAPI();
    }
    
    public void printAll() throws IOException {
        List<BrandInfo> brands = discovery.listBrands();
        
        for (BrandInfo brand : brands) {
            System.out.printf("%n=== %s ===%n", brand.getName());
            
            List<ConfigInfo> configs = discovery.listConfigs(brand.getName());
            
            for (ConfigInfo config : configs) {
                System.out.printf("  %s (v%d)%n", config.getName(), config.getVersion());
                System.out.printf("    Keys: %s%n", String.join(", ", config.getKeys()));
            }
        }
    }
}
```

### Validate Brand Access

```java
public class PermissionValidator {
    public static void validateAccess(DinoConfigSDK sdk, String brandName) throws IOException {
        IntrospectionResult info = sdk.getDiscoveryAPI().introspect();
        
        if (info.getBrand(brandName).isEmpty()) {
            throw new SecurityException("API key cannot access brand: " + brandName);
        }
        
        System.out.println("Access validated for brand: " + brandName);
    }
}
```

### Generate Documentation

```java
public String generateConfigDocs(String brandName, String configName) throws IOException {
    ConfigSchema schema = sdk.getDiscoveryAPI().getSchema(brandName, configName);
    
    StringBuilder docs = new StringBuilder();
    docs.append("# ").append(schema.getConfigName()).append("\n\n");
    
    docs.append("## Fields\n\n");
    docs.append("| Field | Type | Required | Default |\n");
    docs.append("|-------|------|----------|--------|\n");
    
    for (Map.Entry<String, FieldSchema> entry : schema.getFields().entrySet()) {
        String name = entry.getKey();
        FieldSchema field = entry.getValue();
        
        docs.append(String.format("| %s | %s | %s | %s |\n",
            name,
            field.getType(),
            field.isRequired() ? "Yes" : "No",
            field.getDefaultValue().map(Object::toString).orElse("-")
        ));
    }
    
    return docs.toString();
}
```

## Error Handling

```java
import com.dinoconfig.sdk.model.ApiError;

try {
    List<BrandInfo> brands = sdk.getDiscoveryAPI().listBrands();
} catch (ApiError e) {
    switch (e.getStatus()) {
        case 401:
            System.err.println("Invalid or expired API key");
            break;
        case 403:
            System.err.println("Key lacks discovery permissions");
            break;
        default:
            System.err.println("API error: " + e.getMessage());
    }
} catch (IOException e) {
    System.err.println("Network error: " + e.getMessage());
}
```

## Next Steps

- **[Typed Configs →](typed-configs)** — Type-safe models with `getAs()`
- **[DinoConfig CLI →](../cli/getting-started)** — Generate Java models from introspection
- **[Examples →](examples)** — Real-world usage patterns
- **[Configs API →](configs-api)** — Fetch configuration values
