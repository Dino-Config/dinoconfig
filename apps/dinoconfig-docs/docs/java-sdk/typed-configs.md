---
sidebar_position: 5
title: Typed Configurations
description: Create type-safe configuration models for the DinoConfig Java SDK. Generate POJOs from schemas for compile-time safety.
keywords: [typed configs, pojo, type safety, jackson, deserialization, code generation, java models]
---

# Typed Configurations

Type-safe configurations provide compile-time safety and IDE autocompletion. Instead of working with generic `ConfigData` objects, you can deserialize configurations directly into your own Java classes.

## Overview

The v2.0 SDK makes typed configurations simple:

```java
// Define your model
public class AppSettings {
    private String theme;
    private int maxItems;
    // getters/setters
}

// Fetch with type safety - returns your model directly!
AppSettings settings = sdk.getConfigAPI().getAs("MyBrand.AppSettings", AppSettings.class);
System.out.println(settings.getTheme());  // IDE autocompletion works!
```

## Creating Model Classes

### Basic Model

```java
public class AppSettings {
    private String theme;
    private int maxItems;
    private boolean debugMode;
    private List<String> features;
    
    // Default constructor (required for Jackson)
    public AppSettings() {}
    
    // Getters
    public String getTheme() { return theme; }
    public int getMaxItems() { return maxItems; }
    public boolean isDebugMode() { return debugMode; }
    public List<String> getFeatures() { return features; }
    
    // Setters
    public void setTheme(String theme) { this.theme = theme; }
    public void setMaxItems(int maxItems) { this.maxItems = maxItems; }
    public void setDebugMode(boolean debugMode) { this.debugMode = debugMode; }
    public void setFeatures(List<String> features) { this.features = features; }
}
```

### With Jackson Annotations

Use Jackson annotations for field name mapping and customization:

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AppSettings {
    @JsonProperty("theme_name")
    private String theme;
    
    @JsonProperty("max_items")
    private int maxItems;
    
    @JsonProperty("debug_mode")
    private boolean debugMode;
    
    @JsonProperty("enabled_features")
    private List<String> features;
    
    // Default constructor
    public AppSettings() {}
    
    // Getters and setters...
}
```

### Immutable Model (Recommended)

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public final class AppSettings {
    @JsonProperty("theme") private final String theme;
    @JsonProperty("max_items") private final int maxItems;
    @JsonProperty("debug_mode") private final boolean debugMode;
    @JsonProperty("features") private final List<String> features;
    
    // Default constructor for Jackson
    public AppSettings() {
        this.theme = null;
        this.maxItems = 0;
        this.debugMode = false;
        this.features = List.of();
    }
    
    // Full constructor
    public AppSettings(String theme, int maxItems, boolean debugMode, List<String> features) {
        this.theme = theme;
        this.maxItems = maxItems;
        this.debugMode = debugMode;
        this.features = features != null ? List.copyOf(features) : List.of();
    }
    
    // Getters only (immutable)
    public String getTheme() { return theme; }
    public int getMaxItems() { return maxItems; }
    public boolean isDebugMode() { return debugMode; }
    public List<String> getFeatures() { return features; }
}
```

### Java Records (Java 16+)

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AppSettings(
    @JsonProperty("theme") String theme,
    @JsonProperty("max_items") int maxItems,
    @JsonProperty("debug_mode") boolean debugMode,
    @JsonProperty("features") List<String> features
) {}
```

## Using Typed Configs

### Basic Usage

```java
// Fetch as typed model - returns directly, no wrapper!
AppSettings settings = sdk.getConfigAPI().getAs("MyBrand.AppSettings", AppSettings.class);

// Use with full IDE support
System.out.println("Theme: " + settings.getTheme());
System.out.println("Max Items: " + settings.getMaxItems());
System.out.println("Debug: " + settings.isDebugMode());
settings.getFeatures().forEach(System.out::println);
```

### Nested Objects

Create nested models for complex configurations:

```java
public class AppSettings {
    private String theme;
    private DatabaseConfig database;
    private CacheConfig cache;
    
    // Getters and setters
}

public class DatabaseConfig {
    private String host;
    private int port;
    private String name;
    private PoolConfig pool;
    
    // Getters and setters
}

public class PoolConfig {
    private int minSize;
    private int maxSize;
    private long timeout;
    
    // Getters and setters
}

public class CacheConfig {
    private boolean enabled;
    private int ttlSeconds;
    
    // Getters and setters
}
```

Usage:

```java
AppSettings settings = sdk.getConfigAPI().getAs("MyBrand.AppSettings", AppSettings.class);

// Access nested objects
DatabaseConfig db = settings.getDatabase();
System.out.println("DB Host: " + db.getHost());
System.out.println("Pool Max: " + db.getPool().getMaxSize());

if (settings.getCache().isEnabled()) {
    System.out.println("Cache TTL: " + settings.getCache().getTtlSeconds());
}
```

### Collections and Maps

```java
public class FeatureFlags {
    private Map<String, Boolean> flags;
    private List<Experiment> experiments;
    private Set<String> enabledRegions;
    
    // Getters and setters
}

public class Experiment {
    private String name;
    private double rolloutPercentage;
    private List<String> targetGroups;
    
    // Getters and setters
}
```

## getValue() with Types

For individual values, use the typed `getValue()` method:

```java
// Type-safe single value retrieval
String theme = sdk.getConfigAPI().getValue("MyBrand.Settings.theme", String.class);
Integer maxItems = sdk.getConfigAPI().getValue("MyBrand.Settings.maxItems", Integer.class);
Boolean darkMode = sdk.getConfigAPI().getValue("MyBrand.Flags.darkMode", Boolean.class);

// Complex types
@SuppressWarnings("unchecked")
List<String> features = sdk.getConfigAPI().getValue("MyBrand.Settings.features", List.class);

@SuppressWarnings("unchecked")
Map<String, Object> nested = sdk.getConfigAPI().getValue("MyBrand.Settings.database", Map.class);
```

## Date and Time Fields

Handle date/time fields with proper Java types:

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public class ScheduleConfig {
    @JsonProperty("start_date")
    private LocalDate startDate;
    
    @JsonProperty("end_date")
    private LocalDate endDate;
    
    @JsonProperty("daily_start_time")
    private LocalTime dailyStartTime;
    
    @JsonProperty("created_at")
    private Instant createdAt;
    
    // Getters and setters
}
```

:::tip
The SDK includes `JavaTimeModule` for Jackson. Standard ISO-8601 date formats are supported out of the box.
:::

## Handling Unknown Fields

Use `@JsonIgnoreProperties` to gracefully handle extra fields:

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppSettings {
    // Only fields you care about
    private String theme;
    private int maxItems;
    
    // Extra fields from API are ignored
}
```

## Validation

Add validation to your models:

```java
public class AppSettings {
    private String theme;
    private int maxItems;
    
    public void setMaxItems(int maxItems) {
        if (maxItems < 0) {
            throw new IllegalArgumentException("maxItems must be non-negative");
        }
        this.maxItems = maxItems;
    }
    
    public boolean isValid() {
        return theme != null && !theme.isEmpty() && maxItems > 0;
    }
}
```

### With Bean Validation (JSR-380)

```java
import jakarta.validation.constraints.*;

public class AppSettings {
    @NotBlank
    private String theme;
    
    @Min(1) @Max(1000)
    private int maxItems;
    
    @NotEmpty
    private List<String> features;
    
    // Getters and setters
}

// Usage with validation
AppSettings settings = sdk.getConfigAPI().getAs("Brand.Config", AppSettings.class);

ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
Validator validator = factory.getValidator();
Set<ConstraintViolation<AppSettings>> violations = validator.validate(settings);

if (!violations.isEmpty()) {
    throw new ValidationException("Invalid configuration: " + violations);
}
```

## Organizing Models

### Package Structure

```
src/main/java/com/myapp/
├── config/
│   ├── models/
│   │   ├── AppSettings.java
│   │   ├── DatabaseConfig.java
│   │   ├── FeatureFlags.java
│   │   └── CacheConfig.java
│   └── ConfigService.java
└── Application.java
```

### Configuration Service

```java
@Service
public class ConfigService {
    private final ConfigAPI configApi;
    
    public ConfigService(DinoConfigSDK sdk) {
        this.configApi = sdk.getConfigAPI();
    }
    
    public AppSettings getAppSettings() throws IOException {
        return configApi.getAs("MyApp.Settings", AppSettings.class);
    }
    
    public FeatureFlags getFeatureFlags() throws IOException {
        return configApi.getAs("MyApp.FeatureFlags", FeatureFlags.class);
    }
    
    public DatabaseConfig getDatabaseConfig() throws IOException {
        return configApi.getAs("MyApp.Database", DatabaseConfig.class);
    }
}
```

## Code Generation

For the best experience, use the **[DinoConfig CLI](../cli/getting-started)** to generate Java model classes from your configuration schemas. The CLI creates POJO classes with Jackson annotations, proper package structure, and type-safe getters.

```bash
npx @dinoconfig/cli javagen --api-key=dino_your-key --output=./src/main/java/com/myapp/config
```

See the [DinoConfig CLI documentation](../cli/getting-started#javagen--generate-java-models) for installation, all options, and CI/CD integration.

## Best Practices

### 1. Use Immutable Models

```java
// Preferred: Immutable
public final class AppSettings {
    private final String theme;
    public AppSettings(String theme) { this.theme = theme; }
    public String getTheme() { return theme; }
}

// Or use records (Java 16+)
public record AppSettings(String theme, int maxItems) {}
```

### 2. Always Handle Unknown Fields

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppSettings {
    // Fields may be added to config without breaking your app
}
```

### 3. Provide Defaults

```java
public class AppSettings {
    private String theme = "light";  // Default value
    private int maxItems = 100;       // Default value
    
    // ...
}
```

### 4. Document Your Models

```java
/**
 * Application settings from DinoConfig.
 * Brand: MyApp, Config: Settings
 * 
 * @see <a href="https://dinoconfig.com/brands/MyApp/Settings">Dashboard</a>
 */
public class AppSettings {
    /** UI theme (light, dark, auto) */
    private String theme;
    
    /** Maximum items per page (1-1000) */
    private int maxItems;
}
```

## Next Steps

- **[DinoConfig CLI →](../cli/getting-started)** — Generate Java models from your schemas
- **[Examples →](examples)** — Real-world usage patterns
- **[Configs API →](configs-api)** — API method reference
- **[Configuration →](configuration)** — SDK setup options
