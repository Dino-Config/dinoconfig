---
sidebar_position: 3
title: Configs API Reference
description: Fetch configurations and values using the DinoConfig Java SDK Configs API. Learn to use get(), getAs(), and getValue() methods with direct return types.
keywords: [configs api, get configuration, getValue, getAs, fetch config, java sdk api, typed configs]
---

# Configs API

The Configs API is the primary interface for retrieving configuration values from DinoConfig. It provides methods to fetch entire configurations, individual values, and typed models. All methods return values directly — no wrapper objects needed.

## Overview

Access the Configs API through your initialized SDK instance:

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_...", "https://api.dinoconfig.com");
ConfigAPI configApi = sdk.getConfigAPI();
```

## Methods

### `get()` — Fetch Entire Configuration

Retrieves a complete configuration with all its values. Returns `ConfigData` directly.

#### Signatures

```java
// Using path notation
ConfigData get(String path) throws IOException
ConfigData get(String path, RequestOptions options) throws IOException

// Using separate parameters
ConfigData get(String brandName, String configName) throws IOException
ConfigData get(String brandName, String configName, RequestOptions options) throws IOException
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
// Using path notation (recommended) - returns ConfigData directly
ConfigData config = sdk.getConfigAPI().get("MyBrand.AppSettings");

System.out.println("Name: " + config.getName());           // "AppSettings"
System.out.println("Version: " + config.getVersion());     // 3
System.out.println("Keys: " + config.getKeys());           // [theme, maxItems, ...]

// Access values from the config
Map<String, Object> values = config.getValues();
System.out.println("Theme: " + values.get("theme"));       // "dark"

// Type-safe access within ConfigData
String theme = config.getValue("theme", String.class);
Integer maxItems = config.getValue("maxItems", Integer.class);

// With default value
Integer timeout = config.getValueOrDefault("timeout", 5000);

// Using separate parameters
ConfigData config = sdk.getConfigAPI().get("MyBrand", "AppSettings");
```

---

### `getAs()` — Fetch Typed Configuration

Retrieves a configuration and deserializes it to a custom model class. Returns your model type directly.

#### Signatures

```java
// Using path notation
<T> T getAs(String path, Class<T> modelClass) throws IOException
<T> T getAs(String path, Class<T> modelClass, RequestOptions options) throws IOException

// Using separate parameters
<T> T getAs(String brandName, String configName, Class<T> modelClass) throws IOException
<T> T getAs(String brandName, String configName, Class<T> modelClass, RequestOptions options) throws IOException
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
// Returns your typed model directly - no wrapper!
AppSettings settings = sdk.getConfigAPI().getAs("MyBrand.AppSettings", AppSettings.class);

System.out.println("Theme: " + settings.getTheme());
System.out.println("Max Items: " + settings.getMaxItems());
System.out.println("Features: " + settings.getFeatures());
System.out.println("DB Host: " + settings.getDatabase().getHost());
```

---

### `getValue()` — Fetch Single Value

Retrieves a specific configuration value by key with type safety. Returns the typed value directly.

#### Signatures

```java
// Using path notation with type
<T> T getValue(String path, Class<T> valueType) throws IOException
<T> T getValue(String path, Class<T> valueType, RequestOptions options) throws IOException

// Using separate parameters with type
<T> T getValue(String brandName, String configName, String keyName, Class<T> valueType) throws IOException
<T> T getValue(String brandName, String configName, String keyName, Class<T> valueType, RequestOptions options) throws IOException

// Untyped versions (returns Object)
Object getValue(String path) throws IOException
Object getValue(String brandName, String configName, String keyName) throws IOException
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `String` | Yes | Path in `Brand.Config.Key` format |
| `brandName` | `String` | Yes | Brand name |
| `configName` | `String` | Yes | Configuration name |
| `keyName` | `String` | Yes | Key name |
| `valueType` | `Class<T>` | No | Target type for the value |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

Returns the value directly with the specified type. No wrapper objects, no casting needed.

#### Examples

```java
// Type-safe value retrieval - no casting needed!
String theme = sdk.getConfigAPI().getValue("MyBrand.AppSettings.theme", String.class);
System.out.println("Theme: " + theme);  // "dark"

Integer maxItems = sdk.getConfigAPI().getValue("MyBrand.AppSettings.maxItems", Integer.class);
System.out.println("Max Items: " + maxItems);  // 100

Boolean darkMode = sdk.getConfigAPI().getValue("MyBrand.FeatureFlags.darkMode", Boolean.class);
System.out.println("Dark Mode: " + darkMode);  // true

// Using separate parameters
String theme = sdk.getConfigAPI().getValue("MyBrand", "AppSettings", "theme", String.class);

// Complex values - use appropriate types
@SuppressWarnings("unchecked")
List<String> features = sdk.getConfigAPI().getValue(
    "MyBrand.AppSettings.features", 
    List.class
);

@SuppressWarnings("unchecked")
Map<String, Object> database = sdk.getConfigAPI().getValue(
    "MyBrand.AppSettings.database", 
    Map.class
);
String host = (String) database.get("host");
```

## Request Options

All methods accept optional `RequestOptions`:

```java
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)              // 30 second timeout
    .retries(3)                   // Retry up to 3 times
    .addHeader("X-Request-ID", "abc123")
    .build();

ConfigData config = sdk.getConfigAPI().get("Brand.Config", options);
```

### Common Options

```java
// Extended timeout for large configs
ConfigData config = sdk.getConfigAPI().get("Brand.LargeConfig",
    RequestOptions.builder()
        .timeout(60000L)
        .build()
);

// Retry on failure
String value = sdk.getConfigAPI().getValue("Brand.Config.Key", String.class,
    RequestOptions.builder()
        .retries(5)
        .build()
);

// Custom headers for tracing
ConfigData traced = sdk.getConfigAPI().get("Brand.Config",
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
sdk.getConfigAPI().getValue("MyBrand.AppSettings.theme", String.class);
sdk.getConfigAPI().getValue("MyBrand", "AppSettings", "theme", String.class);
```

## Error Handling

All methods throw exceptions on failure — use try-catch:

```java
import com.dinoconfig.sdk.exception.ApiError;

try {
    ConfigData config = sdk.getConfigAPI().get("Brand.NonExistent");
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
} catch (IOException e) {
    System.err.println("Network error: " + e.getMessage());
}
```

## Best Practices

### 1. Use Path Notation

Path notation is more concise and readable:

```java
// Preferred
sdk.getConfigAPI().getValue("Brand.Config.Key", String.class);

// More verbose
sdk.getConfigAPI().getValue("Brand", "Config", "Key", String.class);
```

### 2. Use Typed `getValue()` or `getAs()`

```java
// Type-safe - no casting needed
String theme = sdk.getConfigAPI().getValue("Brand.Config.theme", String.class);
MyConfig config = sdk.getConfigAPI().getAs("Brand.Config", MyConfig.class);

// Avoid untyped access when possible
Object value = sdk.getConfigAPI().getValue("Brand.Config.theme");
String theme = (String) value;  // Requires casting
```

### 3. Handle Errors Gracefully

```java
public String getTheme() {
    try {
        return sdk.getConfigAPI().getValue("Brand.Settings.theme", String.class);
    } catch (ApiError e) {
        log.error("Failed to get theme: {}", e.getMessage());
        return "light"; // Default fallback
    } catch (IOException e) {
        log.error("Network error getting theme", e);
        return "light";
    }
}
```

### 4. Batch Related Values

Fetch entire configs when you need multiple values:

```java
// Single request for multiple values
ConfigData config = sdk.getConfigAPI().get("Brand.Settings");
String theme = config.getValue("theme", String.class);
Integer maxItems = config.getValue("maxItems", Integer.class);

// Avoid multiple requests when batching is possible
String theme = sdk.getConfigAPI().getValue("Brand.Settings.theme", String.class);
Integer maxItems = sdk.getConfigAPI().getValue("Brand.Settings.maxItems", Integer.class);
```

### 5. Use Default Values

```java
ConfigData config = sdk.getConfigAPI().get("Brand.Settings");

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
