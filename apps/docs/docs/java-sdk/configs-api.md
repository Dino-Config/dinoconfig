---
sidebar_position: 3
title: Configs API
description: Fetch configurations and values using the DinoConfig Java SDK Configs API.
---

# Configs API

The Configs API is the primary interface for retrieving configuration values from DinoConfig. It provides methods to fetch entire configurations, individual values, and typed models.

## Overview

Access the Configs API through your initialized SDK instance:

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_...");
ConfigAPI configApi = sdk.getConfigAPI();
```

## Methods

### `get()` — Fetch Entire Configuration

Retrieves a complete configuration with all its values.

#### Signatures

```java
// Using path notation
ApiResponse<ConfigData> get(String path)
ApiResponse<ConfigData> get(String path, RequestOptions options)

// Using separate parameters
ApiResponse<ConfigData> get(String brandName, String configName)
ApiResponse<ConfigData> get(String brandName, String configName, RequestOptions options)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `String` | Yes | Path in `Brand.Config` format |
| `brandName` | `String` | Yes | Brand name |
| `configName` | `String` | Yes | Configuration name |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```java
public class ApiResponse<T> {
    private T data;
    private Boolean success;
    private String message;
    
    public boolean hasData() { /* ... */ }
}

public class ConfigData {
    private String name;
    private String description;
    private Map<String, Object> values;
    private int version;
    private List<String> keys;
    private Instant createdAt;
    private Instant updatedAt;
    
    public Object getValue(String key) { /* ... */ }
    public <T> T getValue(String key, Class<T> type) { /* ... */ }
    public <T> T getValueOrDefault(String key, T defaultValue) { /* ... */ }
    public boolean hasKey(String key) { /* ... */ }
}
```

#### Examples

```java
// Using path notation (recommended)
var response = sdk.getConfigAPI().get("MyBrand.AppSettings");

if (response.hasData()) {
    ConfigData config = response.getData();
    
    System.out.println("Name: " + config.getName());           // "AppSettings"
    System.out.println("Version: " + config.getVersion());     // 3
    System.out.println("Keys: " + config.getKeys());           // [theme, maxItems, ...]
    
    // Access values
    Map<String, Object> values = config.getValues();
    System.out.println("Theme: " + values.get("theme"));       // "dark"
    
    // Type-safe access
    String theme = config.getValue("theme", String.class);
    Integer maxItems = config.getValue("maxItems", Integer.class);
    
    // With default value
    Integer timeout = config.getValueOrDefault("timeout", 5000);
}

// Using separate parameters
var response = sdk.getConfigAPI().get("MyBrand", "AppSettings");
```

---

### `getAs()` — Fetch Typed Configuration

Retrieves a configuration and deserializes it to a custom model class.

#### Signatures

```java
// Using path notation
<T> ApiResponse<T> getAs(String path, Class<T> modelClass)
<T> ApiResponse<T> getAs(String path, Class<T> modelClass, RequestOptions options)

// Using separate parameters
<T> ApiResponse<T> getAs(String brandName, String configName, Class<T> modelClass)
<T> ApiResponse<T> getAs(String brandName, String configName, Class<T> modelClass, RequestOptions options)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `String` | Yes | Path in `Brand.Config` format |
| `brandName` | `String` | Yes | Brand name |
| `configName` | `String` | Yes | Configuration name |
| `modelClass` | `Class<T>` | Yes | Target class for deserialization |
| `options` | `RequestOptions` | No | Request customization |

#### Example

First, define your model class:

```java
public class AppSettings {
    private String theme;
    private int maxItems;
    private List<String> features;
    private DatabaseConfig database;
    
    // Getters and setters
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    // ... etc
}

public class DatabaseConfig {
    private String host;
    private int port;
    private String name;
    
    // Getters and setters
}
```

Then use `getAs()`:

```java
var response = sdk.getConfigAPI().getAs("MyBrand.AppSettings", AppSettings.class);

if (response.hasData()) {
    AppSettings settings = response.getData();
    
    System.out.println("Theme: " + settings.getTheme());
    System.out.println("Max Items: " + settings.getMaxItems());
    System.out.println("Features: " + settings.getFeatures());
    System.out.println("DB Host: " + settings.getDatabase().getHost());
}
```

---

### `getValue()` — Fetch Single Value

Retrieves a specific configuration value by key.

#### Signatures

```java
// Using path notation
ApiResponse<Object> getValue(String path)
ApiResponse<Object> getValue(String path, RequestOptions options)

// Using separate parameters
ApiResponse<Object> getValue(String brandName, String configName, String keyName)
ApiResponse<Object> getValue(String brandName, String configName, String keyName, RequestOptions options)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `String` | Yes | Path in `Brand.Config.Key` format |
| `brandName` | `String` | Yes | Brand name |
| `configName` | `String` | Yes | Configuration name |
| `keyName` | `String` | Yes | Key name |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```java
ApiResponse<Object>  // Value type varies based on configuration
```

#### Examples

```java
// Using path notation (recommended)
var themeResponse = sdk.getConfigAPI().getValue("MyBrand.AppSettings.theme");
String theme = (String) themeResponse.getData();
System.out.println("Theme: " + theme);  // "dark"

var maxItemsResponse = sdk.getConfigAPI().getValue("MyBrand.AppSettings.maxItems");
Integer maxItems = (Integer) maxItemsResponse.getData();
System.out.println("Max Items: " + maxItems);  // 100

// Using separate parameters
var response = sdk.getConfigAPI().getValue("MyBrand", "AppSettings", "theme");

// Complex values (objects/arrays) come back as Maps/Lists
var featuresResponse = sdk.getConfigAPI().getValue("MyBrand.AppSettings.features");
@SuppressWarnings("unchecked")
List<String> features = (List<String>) featuresResponse.getData();

var dbResponse = sdk.getConfigAPI().getValue("MyBrand.AppSettings.database");
@SuppressWarnings("unchecked")
Map<String, Object> database = (Map<String, Object>) dbResponse.getData();
String host = (String) database.get("host");
```

## Request Options

Both methods accept optional `RequestOptions`:

```java
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)              // 30 second timeout
    .retries(3)                   // Retry up to 3 times
    .addHeader("X-Request-ID", "abc123")
    .build();

var config = sdk.getConfigAPI().get("Brand.Config", options);
```

### Common Options

```java
// Extended timeout for large configs
var config = sdk.getConfigAPI().get("Brand.LargeConfig",
    RequestOptions.builder()
        .timeout(60000L)
        .build()
);

// Retry on failure
var reliable = sdk.getConfigAPI().getValue("Brand.Config.Key",
    RequestOptions.builder()
        .retries(5)
        .build()
);

// Custom headers for tracing
var traced = sdk.getConfigAPI().get("Brand.Config",
    RequestOptions.builder()
        .addHeader("X-Trace-ID", traceId)
        .addHeader("X-Span-ID", spanId)
        .build()
);
```

## Path Notation

The SDK supports a convenient dot-notation syntax:

| Format | Description | Example |
|--------|-------------|---------|
| `Brand.Config` | Full configuration | `MyApp.Settings` |
| `Brand.Config.Key` | Single value | `MyApp.Settings.theme` |

```java
// These are equivalent:
sdk.getConfigAPI().get("MyBrand.AppSettings");
sdk.getConfigAPI().get("MyBrand", "AppSettings");

// These are equivalent:
sdk.getConfigAPI().getValue("MyBrand.AppSettings.theme");
sdk.getConfigAPI().getValue("MyBrand", "AppSettings", "theme");
```

## Error Handling

```java
import com.dinoconfig.sdk.exception.ApiError;

try {
    var config = sdk.getConfigAPI().get("Brand.NonExistent");
} catch (ApiError e) {
    switch (e.getStatus()) {
        case 404:
            System.err.println("Configuration not found");
            break;
        case 401:
            System.err.println("Invalid API key");
            break;
        case 403:
            System.err.println("Access denied to this configuration");
            break;
        default:
            System.err.println("API error: " + e.getMessage());
    }
}
```

## Best Practices

### 1. Use Path Notation

Path notation is more concise and readable:

```java
// ✅ Preferred
sdk.getConfigAPI().getValue("Brand.Config.Key");

// ❌ More verbose
sdk.getConfigAPI().getValue("Brand", "Config", "Key");
```

### 2. Use `getAs()` for Type Safety

```java
// ✅ Type-safe with custom model
var config = sdk.getConfigAPI().getAs("Brand.Config", MyConfig.class);

// ❌ Requires casting
var config = sdk.getConfigAPI().get("Brand.Config");
String theme = (String) config.getData().getValue("theme");
```

### 3. Check Response Success

```java
var response = sdk.getConfigAPI().get("Brand.Config");

if (response.hasData()) {
    // Safe to use response.getData()
    processConfig(response.getData());
} else {
    log.warn("Failed to get config: " + response.getMessage());
}
```

### 4. Batch Related Values

Fetch entire configs when you need multiple values:

```java
// ✅ Single request for multiple values
var config = sdk.getConfigAPI().get("Brand.Settings");
String theme = config.getData().getValue("theme", String.class);
Integer maxItems = config.getData().getValue("maxItems", Integer.class);

// ❌ Multiple requests (slower)
var theme = sdk.getConfigAPI().getValue("Brand.Settings.theme");
var maxItems = sdk.getConfigAPI().getValue("Brand.Settings.maxItems");
```

### 5. Use Default Values

```java
ConfigData config = response.getData();

// With explicit default
int timeout = config.getValueOrDefault("timeout", 5000);

// Check existence first
if (config.hasKey("optionalFeature")) {
    Boolean enabled = config.getValue("optionalFeature", Boolean.class);
}
```

## Next Steps

- **[Discovery API →](discovery-api)** — Explore available configurations
- **[Typed Configs →](typed-configs)** — Generate type-safe models
- **[Examples →](examples)** — Real-world usage patterns
