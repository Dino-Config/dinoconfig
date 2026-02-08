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
    private String id;
    private String name;
    private String description;
    private int configCount;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getConfigCount() { return configCount; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
```

#### Example

```java
// Returns List<BrandInfo> directly - no wrapper!
List<BrandInfo> brands = sdk.getDiscoveryAPI().listBrands();

for (BrandInfo brand : brands) {
    System.out.printf("Brand: %s (%s)%n", brand.getName(), brand.getId());
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
    private String id;
    private String name;
    private String description;
    private List<String> keys;
    private int version;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public List<String> getKeys() { return keys; }
    public int getVersion() { return version; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
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
    private String name;
    private String description;
    private Map<String, SchemaField> fields;
    private int version;
    
    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Map<String, SchemaField> getFields() { return fields; }
    public int getVersion() { return version; }
}

public class SchemaField {
    private String type;
    private String description;
    private boolean required;
    private Object defaultValue;
    private List<String> enumValues;  // For enum types
    
    // Getters
    public String getType() { return type; }
    public String getDescription() { return description; }
    public boolean isRequired() { return required; }
    public Object getDefaultValue() { return defaultValue; }
    public List<String> getEnumValues() { return enumValues; }
}
```

#### Example

```java
// Returns ConfigSchema directly
ConfigSchema schema = sdk.getDiscoveryAPI().getSchema("MyBrand", "AppSettings");

System.out.printf("Schema: %s (v%d)%n", schema.getName(), schema.getVersion());
System.out.println("Fields:");

for (Map.Entry<String, SchemaField> entry : schema.getFields().entrySet()) {
    String fieldName = entry.getKey();
    SchemaField field = entry.getValue();
    
    System.out.printf("  %s: %s%n", fieldName, field.getType());
    System.out.printf("    Required: %b%n", field.isRequired());
    
    if (field.getDefaultValue() != null) {
        System.out.printf("    Default: %s%n", field.getDefaultValue());
    }
    
    if (field.getEnumValues() != null) {
        System.out.printf("    Allowed: %s%n", field.getEnumValues());
    }
}
```

---

### `introspect()` — API Key Introspection

Returns information about your API key's permissions and capabilities.

#### Signature

```java
IntrospectionResult introspect() throws IOException
IntrospectionResult introspect(RequestOptions options) throws IOException
```

#### Returns

```java
public class IntrospectionResult {
    private String keyId;
    private String keyName;
    private List<String> permissions;
    private List<String> allowedBrands;
    private Instant expiresAt;
    private boolean isAdmin;
    
    // Getters
    public String getKeyId() { return keyId; }
    public String getKeyName() { return keyName; }
    public List<String> getPermissions() { return permissions; }
    public List<String> getAllowedBrands() { return allowedBrands; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isAdmin() { return isAdmin; }
    
    // Helper methods
    public boolean hasPermission(String permission) { /* ... */ }
    public boolean canAccessBrand(String brandName) { /* ... */ }
}
```

#### Example

```java
// Returns IntrospectionResult directly
IntrospectionResult info = sdk.getDiscoveryAPI().introspect();

System.out.println("API Key Info:");
System.out.printf("  Key Name: %s%n", info.getKeyName());
System.out.printf("  Key ID: %s%n", info.getKeyId());
System.out.printf("  Is Admin: %b%n", info.isAdmin());
System.out.printf("  Expires: %s%n", info.getExpiresAt());
System.out.printf("  Permissions: %s%n", String.join(", ", info.getPermissions()));
System.out.printf("  Allowed Brands: %s%n", String.join(", ", info.getAllowedBrands()));

// Check specific permissions
if (info.hasPermission("config:read")) {
    System.out.println("This key can read configurations");
}

if (info.canAccessBrand("MyBrand")) {
    System.out.println("This key can access MyBrand");
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

### Validate Key Permissions

```java
public class PermissionValidator {
    public static void validateAccess(DinoConfigSDK sdk, String brandName) throws IOException {
        IntrospectionResult info = sdk.getDiscoveryAPI().introspect();
        
        if (!info.canAccessBrand(brandName)) {
            throw new SecurityException("API key cannot access brand: " + brandName);
        }
        
        if (!info.hasPermission("config:read")) {
            throw new SecurityException("API key lacks config:read permission");
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
    docs.append("# ").append(schema.getName()).append("\n\n");
    
    if (schema.getDescription() != null) {
        docs.append(schema.getDescription()).append("\n\n");
    }
    
    docs.append("## Fields\n\n");
    docs.append("| Field | Type | Required | Default |\n");
    docs.append("|-------|------|----------|--------|\n");
    
    for (Map.Entry<String, SchemaField> entry : schema.getFields().entrySet()) {
        String name = entry.getKey();
        SchemaField field = entry.getValue();
        
        docs.append(String.format("| %s | %s | %s | %s |\n",
            name,
            field.getType(),
            field.isRequired() ? "Yes" : "No",
            field.getDefaultValue() != null ? field.getDefaultValue() : "-"
        ));
    }
    
    return docs.toString();
}
```

## Error Handling

```java
import com.dinoconfig.sdk.exception.ApiError;

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

- **[Typed Configs →](typed-configs)** — Generate type-safe models
- **[Examples →](examples)** — Real-world usage patterns
- **[Configs API →](configs-api)** — Fetch configuration values
