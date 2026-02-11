---
sidebar_position: 6
title: Examples
description: Real-world examples of using the DinoConfig Java SDK. Spring Boot integration, caching patterns, and production best practices.
keywords: [examples, spring boot, caching, best practices, production, java sdk patterns]
---

# Examples

This page contains practical examples demonstrating common DinoConfig Java SDK usage patterns. All examples use the v2.0 API with direct return types.

## Basic Examples

### Simple Value Retrieval

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;

public class BasicExample {
    public static void main(String[] args) {
        DinoConfigSDK sdk = DinoConfigSDKFactory.create(
            System.getenv("DINOCONFIG_API_KEY"),
            "https://api.dinoconfig.com"
        );
        
        try {
            // Get a single value with type safety
            String theme = sdk.getConfigAPI().getValue("MyApp.Settings.theme", String.class);
            System.out.println("Theme: " + theme);
            
            // Get an integer value
            Integer maxUsers = sdk.getConfigAPI().getValue("MyApp.Settings.maxUsers", Integer.class);
            System.out.println("Max Users: " + maxUsers);
            
            // Get a boolean flag
            Boolean maintenanceMode = sdk.getConfigAPI().getValue(
                "MyApp.FeatureFlags.maintenanceMode", 
                Boolean.class
            );
            if (Boolean.TRUE.equals(maintenanceMode)) {
                System.out.println("App is in maintenance mode!");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

### Typed Configuration

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
record AppSettings(
    @JsonProperty("theme") String theme,
    @JsonProperty("max_users") int maxUsers,
    @JsonProperty("features") List<String> features
) {}

public class TypedExample {
    public static void main(String[] args) {
        DinoConfigSDK sdk = DinoConfigSDKFactory.create(
            System.getenv("DINOCONFIG_API_KEY"),
            "https://api.dinoconfig.com"
        );
        
        try {
            // Get typed configuration - returns directly!
            AppSettings settings = sdk.getConfigAPI().getAs(
                "MyApp.Settings", 
                AppSettings.class
            );
            
            System.out.println("Theme: " + settings.theme());
            System.out.println("Max Users: " + settings.maxUsers());
            System.out.println("Features: " + settings.features());
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

---

## Spring Boot Integration

### Configuration Class

```java
package com.example.config;

import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.api.DiscoveryAPI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DinoConfigConfiguration {
    
    @Value("${dinoconfig.api-key}")
    private String apiKey;
    
    @Value("${dinoconfig.base-url:https://api.dinoconfig.com}")
    private String baseUrl;
    
    @Value("${dinoconfig.timeout:10000}")
    private Long timeout;
    
    @Bean
    public DinoConfigSDK dinoConfigSDK() {
        return DinoConfigSDKFactory.create(apiKey, baseUrl, timeout);
    }
    
    @Bean
    public ConfigAPI configAPI(DinoConfigSDK sdk) {
        return sdk.getConfigAPI();
    }
    
    @Bean
    public DiscoveryAPI discoveryAPI(DinoConfigSDK sdk) {
        return sdk.getDiscoveryAPI();
    }
}
```

### Configuration Properties

```yaml
# application.yml
dinoconfig:
  api-key: ${DINOCONFIG_API_KEY}
  base-url: https://api.dinoconfig.com
  timeout: 10000
```

### Feature Flag Service

```java
package com.example.service;

import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.model.ConfigData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class FeatureFlagService {
    private static final Logger log = LoggerFactory.getLogger(FeatureFlagService.class);
    private final ConfigAPI configApi;
    
    public FeatureFlagService(ConfigAPI configApi) {
        this.configApi = configApi;
    }
    
    @Cacheable(value = "featureFlags", key = "#flagName")
    public boolean isEnabled(String flagName) {
        try {
            Boolean value = configApi.getValue(
                "MyApp.FeatureFlags." + flagName, 
                Boolean.class
            );
            return Boolean.TRUE.equals(value);
        } catch (Exception e) {
            log.warn("Failed to check feature flag '{}', defaulting to false", flagName, e);
            return false;
        }
    }
    
    @Cacheable("allFeatureFlags")
    public FeatureFlags getAllFlags() {
        try {
            return configApi.getAs("MyApp.FeatureFlags", FeatureFlags.class);
        } catch (Exception e) {
            log.error("Failed to load feature flags", e);
            return FeatureFlags.defaults();
        }
    }
}
```

### Using in Controllers

```java
package com.example.controller;

import com.example.service.FeatureFlagService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final FeatureFlagService featureFlags;
    
    public ApiController(FeatureFlagService featureFlags) {
        this.featureFlags = featureFlags;
    }
    
    @GetMapping("/dashboard")
    public DashboardResponse getDashboard() {
        DashboardResponse response = new DashboardResponse();
        
        if (featureFlags.isEnabled("newDashboard")) {
            response.setVersion("v2");
            response.setWidgets(getNewWidgets());
        } else {
            response.setVersion("v1");
            response.setWidgets(getLegacyWidgets());
        }
        
        return response;
    }
}
```

---

## Caching Patterns

### In-Memory Cache with TTL

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.model.ConfigData;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

public class CachedConfigService {
    private final DinoConfigSDK sdk;
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final Duration ttl;
    
    public CachedConfigService(DinoConfigSDK sdk, Duration ttl) {
        this.sdk = sdk;
        this.ttl = ttl;
    }
    
    public <T> T get(String path, Class<T> type) {
        String cacheKey = path + ":" + type.getName();
        CacheEntry entry = cache.get(cacheKey);
        
        if (entry != null && !entry.isExpired()) {
            return type.cast(entry.value);
        }
        
        try {
            T value = sdk.getConfigAPI().getAs(path, type);
            cache.put(cacheKey, new CacheEntry(value, ttl));
            return value;
        } catch (Exception e) {
            // Return stale value if available
            if (entry != null) {
                return type.cast(entry.value);
            }
            throw new RuntimeException("Failed to fetch config: " + path, e);
        }
    }
    
    public void invalidate(String path) {
        cache.entrySet().removeIf(e -> e.getKey().startsWith(path));
    }
    
    private static class CacheEntry {
        final Object value;
        final Instant expiresAt;
        
        CacheEntry(Object value, Duration ttl) {
            this.value = value;
            this.expiresAt = Instant.now().plus(ttl);
        }
        
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }
}

// Usage
CachedConfigService configService = new CachedConfigService(sdk, Duration.ofMinutes(5));
AppSettings settings = configService.get("MyApp.Settings", AppSettings.class);
```

### Caffeine Cache Integration

```java
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;

public class CaffeineCachedConfig {
    private final DinoConfigSDK sdk;
    private final LoadingCache<String, Object> cache;
    
    public CaffeineCachedConfig(DinoConfigSDK sdk) {
        this.sdk = sdk;
        this.cache = Caffeine.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(Duration.ofMinutes(5))
            .refreshAfterWrite(Duration.ofMinutes(1))
            .build(this::loadConfig);
    }
    
    private Object loadConfig(String path) {
        try {
            return sdk.getConfigAPI().get(path);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load: " + path, e);
        }
    }
    
    public ConfigData get(String path) {
        return (ConfigData) cache.get(path);
    }
}
```

---

## Error Handling Patterns

### Robust Configuration Loader

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.exception.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RobustConfigLoader {
    private static final Logger log = LoggerFactory.getLogger(RobustConfigLoader.class);
    private final DinoConfigSDK sdk;
    
    public RobustConfigLoader(DinoConfigSDK sdk) {
        this.sdk = sdk;
    }
    
    public <T> T loadWithFallback(String path, Class<T> type, T fallback) {
        try {
            return sdk.getConfigAPI().getAs(path, type);
        } catch (ApiError e) {
            handleApiError(path, e);
            return fallback;
        } catch (Exception e) {
            log.error("Unexpected error loading config '{}': {}", path, e.getMessage());
            return fallback;
        }
    }
    
    public <T> T loadRequired(String path, Class<T> type) throws ConfigurationException {
        try {
            return sdk.getConfigAPI().getAs(path, type);
        } catch (ApiError e) {
            throw new ConfigurationException("Required config '" + path + "' unavailable", e);
        } catch (Exception e) {
            throw new ConfigurationException("Failed to load required config: " + path, e);
        }
    }
    
    private void handleApiError(String path, ApiError e) {
        switch (e.getStatus()) {
            case 401:
                log.error("Invalid API key when loading '{}'", path);
                break;
            case 403:
                log.error("Access denied to config '{}'", path);
                break;
            case 404:
                log.warn("Config '{}' not found, using fallback", path);
                break;
            case 429:
                log.warn("Rate limited when loading '{}', using fallback", path);
                break;
            default:
                log.error("API error loading '{}': {} {}", path, e.getStatus(), e.getMessage());
        }
    }
}
```

### Retry Pattern

```java
import java.time.Duration;

public class RetryableConfigLoader {
    private final DinoConfigSDK sdk;
    private final int maxRetries;
    private final Duration retryDelay;
    
    public RetryableConfigLoader(DinoConfigSDK sdk, int maxRetries, Duration retryDelay) {
        this.sdk = sdk;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }
    
    public <T> T load(String path, Class<T> type) throws ConfigurationException {
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return sdk.getConfigAPI().getAs(path, type);
            } catch (Exception e) {
                lastException = e;
                
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelay.toMillis() * attempt); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new ConfigurationException("Interrupted during retry", ie);
                    }
                }
            }
        }
        
        throw new ConfigurationException(
            "Failed to load config after " + maxRetries + " attempts: " + path, 
            lastException
        );
    }
}
```

---

## Discovery Examples

### Configuration Explorer

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.model.*;

public class ConfigExplorer {
    private final DinoConfigSDK sdk;
    
    public ConfigExplorer(DinoConfigSDK sdk) {
        this.sdk = sdk;
    }
    
    public void exploreAll() throws Exception {
        System.out.println("=== DinoConfig Explorer ===\n");
        
        // List all brands
        List<BrandInfo> brands = sdk.getDiscoveryAPI().listBrands();
        System.out.printf("Found %d brands:%n%n", brands.size());
        
        for (BrandInfo brand : brands) {
            System.out.printf("Brand: %s%n", brand.getName());
            System.out.printf("  Description: %s%n", brand.getDescription());
            System.out.printf("  Configs: %d%n%n", brand.getConfigCount());
            
            // List configs for each brand
            List<ConfigInfo> configs = sdk.getDiscoveryAPI().listConfigs(brand.getName());
            
            for (ConfigInfo config : configs) {
                System.out.printf("  Config: %s (v%d)%n", config.getName(), config.getVersion());
                System.out.printf("    Keys: %s%n", String.join(", ", config.getKeys()));
                
                // Get schema
                ConfigSchema schema = sdk.getDiscoveryAPI().getSchema(
                    brand.getName(), 
                    config.getName()
                );
                
                System.out.println("    Fields:");
                for (var entry : schema.getFields().entrySet()) {
                    SchemaField field = entry.getValue();
                    System.out.printf("      - %s: %s%s%n", 
                        entry.getKey(), 
                        field.getType(),
                        field.isRequired() ? " (required)" : ""
                    );
                }
                System.out.println();
            }
        }
    }
}
```

### API Key Validator

```java
public class ApiKeyValidator {
    private final DinoConfigSDK sdk;
    
    public ApiKeyValidator(DinoConfigSDK sdk) {
        this.sdk = sdk;
    }
    
    public ValidationResult validate(String... requiredBrands) {
        try {
            IntrospectionResult info = sdk.getDiscoveryAPI().introspect();
            
            List<String> missingBrands = new ArrayList<>();
            for (String brand : requiredBrands) {
                if (info.getBrand(brand).isEmpty()) {
                    missingBrands.add(brand);
                }
            }
            
            if (!missingBrands.isEmpty()) {
                return ValidationResult.failed(
                    "Missing access to brands: " + String.join(", ", missingBrands)
                );
            }
            
            return ValidationResult.success(info);
        } catch (Exception e) {
            return ValidationResult.failed("Validation failed: " + e.getMessage());
        }
    }
    
    public record ValidationResult(boolean valid, String error, IntrospectionResult info) {
        public static ValidationResult success(IntrospectionResult info) {
            return new ValidationResult(true, null, info);
        }
        
        public static ValidationResult failed(String error) {
            return new ValidationResult(false, error, null);
        }
    }
}
```

---

## Complete Application Example

### Multi-Tenant Configuration Service

```java
package com.example;

import com.dinoconfig.sdk.*;
import com.dinoconfig.sdk.api.*;
import com.dinoconfig.sdk.model.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;

public class TenantConfigService {
    private final DinoConfigSDK sdk;
    private final Map<String, TenantConfig> cache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService refresher;
    
    public TenantConfigService(String apiKey) {
        this.sdk = DinoConfigSDKFactory.create(apiKey, "https://api.dinoconfig.com");
        this.refresher = Executors.newSingleThreadScheduledExecutor();
        
        // Refresh configs every 5 minutes
        refresher.scheduleAtFixedRate(
            this::refreshAllTenants,
            5, 5, TimeUnit.MINUTES
        );
    }
    
    public TenantConfig getConfig(String tenantId) {
        return cache.computeIfAbsent(tenantId, this::loadTenantConfig);
    }
    
    private TenantConfig loadTenantConfig(String tenantId) {
        try {
            return sdk.getConfigAPI().getAs(
                "Tenants." + tenantId,
                TenantConfig.class
            );
        } catch (Exception e) {
            return TenantConfig.defaults();
        }
    }
    
    private void refreshAllTenants() {
        for (String tenantId : cache.keySet()) {
            try {
                TenantConfig fresh = loadTenantConfig(tenantId);
                cache.put(tenantId, fresh);
            } catch (Exception e) {
                // Keep stale config on refresh failure
            }
        }
    }
    
    public void shutdown() {
        refresher.shutdown();
    }
}

// Model
@JsonIgnoreProperties(ignoreUnknown = true)
record TenantConfig(
    @JsonProperty("name") String name,
    @JsonProperty("max_users") int maxUsers,
    @JsonProperty("features") List<String> features,
    @JsonProperty("theme") ThemeConfig theme
) {
    public static TenantConfig defaults() {
        return new TenantConfig("Default", 10, List.of(), ThemeConfig.defaults());
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
record ThemeConfig(
    @JsonProperty("primary_color") String primaryColor,
    @JsonProperty("logo_url") String logoUrl
) {
    public static ThemeConfig defaults() {
        return new ThemeConfig("#000000", null);
    }
}

// Usage
public class Application {
    public static void main(String[] args) {
        TenantConfigService configService = new TenantConfigService(
            System.getenv("DINOCONFIG_API_KEY")
        );
        
        // Get tenant config
        TenantConfig config = configService.getConfig("acme-corp");
        
        System.out.println("Tenant: " + config.name());
        System.out.println("Max Users: " + config.maxUsers());
        System.out.println("Primary Color: " + config.theme().primaryColor());
        
        if (config.features().contains("advanced-analytics")) {
            System.out.println("Advanced analytics enabled!");
        }
        
        // Cleanup on shutdown
        Runtime.getRuntime().addShutdownHook(new Thread(configService::shutdown));
    }
}
```

## Next Steps

- **[Getting Started →](getting-started)** — Initial setup guide
- **[Configs API →](configs-api)** — Full API reference
- **[Discovery API →](discovery-api)** — Explore configurations
- **[Typed Configs →](typed-configs)** — Type-safe models with `getAs()`
- **[DinoConfig CLI →](../cli/getting-started)** — Generate Java models from your schemas
