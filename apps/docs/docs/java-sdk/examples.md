---
sidebar_position: 6
title: Examples
description: Real-world examples and patterns for using the DinoConfig Java SDK.
---

# Examples

This page provides real-world examples and patterns for common use cases with the DinoConfig Java SDK.

## Basic Usage

### Simple Configuration Fetch

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;

public class App {
    public static void main(String[] args) {
        DinoConfigSDK sdk = DinoConfigSDKFactory.create(
            System.getenv("DINOCONFIG_API_KEY"),
            "https://api.dinoconfig.com"
        );
        
        var config = sdk.getConfigAPI().get("MyApp.Settings");
        
        if (config.hasData()) {
            System.out.println("Theme: " + config.getData().getValue("theme"));
            System.out.println("Max Items: " + config.getData().getValue("maxItems"));
        }
    }
}
```

### Feature Flags

```java
public class FeatureFlagService {
    
    private final DinoConfigSDK sdk;
    
    public FeatureFlagService(DinoConfigSDK sdk) {
        this.sdk = sdk;
    }
    
    public boolean isFeatureEnabled(String featureName) {
        try {
            var response = sdk.getConfigAPI().getValue(
                "MyApp.FeatureFlags." + featureName
            );
            return Boolean.TRUE.equals(response.getData());
        } catch (Exception e) {
            // Default to disabled if fetch fails
            return false;
        }
    }
    
    public FeatureFlags getAllFlags() {
        var response = sdk.getConfigAPI().getAs(
            "MyApp.FeatureFlags",
            FeatureFlags.class
        );
        return response.hasData() ? response.getData() : FeatureFlags.defaults();
    }
}

// Usage
FeatureFlagService flags = new FeatureFlagService(sdk);

if (flags.isFeatureEnabled("darkMode")) {
    enableDarkMode();
}

if (flags.isFeatureEnabled("newDashboard")) {
    renderNewDashboard();
} else {
    renderLegacyDashboard();
}
```

## Spring Boot Integration

### Configuration Class

```java title="src/main/java/com/example/config/DinoConfigConfiguration.java"
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.DinoConfigSDKConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DinoConfigConfiguration {
    
    @Value("${dinoconfig.api-key}")
    private String apiKey;
    
    @Value("${dinoconfig.base-url:https://api.dinoconfig.com}")
    private String baseUrl;
    
    @Value("${dinoconfig.timeout:15000}")
    private Long timeout;
    
    @Bean
    public DinoConfigSDK dinoConfigSDK() {
        DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
            .apiKey(apiKey)
            .baseUrl(baseUrl)
            .timeout(timeout)
            .build();
            
        return DinoConfigSDKFactory.create(config);
    }
}
```

### Configuration Service

```java title="src/main/java/com/example/service/ConfigService.java"
import com.dinoconfig.sdk.DinoConfigSDK;
import com.example.config.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ConfigService {
    
    private final DinoConfigSDK sdk;
    
    public ConfigService(DinoConfigSDK sdk) {
        this.sdk = sdk;
    }
    
    @Cacheable(value = "appSettings", unless = "#result == null")
    public AppSettings getAppSettings() {
        var response = sdk.getConfigAPI().getAs(
            "MyApp.Settings",
            AppSettings.class
        );
        return response.hasData() ? response.getData() : null;
    }
    
    @Cacheable(value = "featureFlags", unless = "#result == null")
    public FeatureFlags getFeatureFlags() {
        var response = sdk.getConfigAPI().getAs(
            "MyApp.FeatureFlags",
            FeatureFlags.class
        );
        return response.hasData() ? response.getData() : FeatureFlags.defaults();
    }
    
    public void evictCache() {
        // Implement cache eviction logic
    }
}
```

### REST Controller

```java title="src/main/java/com/example/controller/ConfigController.java"
import com.example.service.ConfigService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(api/config")
public class ConfigController {
    
    private final ConfigService configService;
    
    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }
    
    @GetMapping(settings")
    public AppSettings getSettings() {
        return configService.getAppSettings();
    }
    
    @GetMapping(features")
    public FeatureFlags getFeatures() {
        return configService.getFeatureFlags();
    }
    
    @PostMapping(refresh")
    public void refreshConfig() {
        configService.evictCache();
    }
}
```

### Application Properties

```yaml title="src/main/resources/application.yml"
dinoconfig:
  api-key: ${DINOCONFIG_API_KEY}
  base-url: https://api.dinoconfig.com
  timeout: 15000

spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=500,expireAfterWrite=300s
```

## Quarkus Integration

### CDI Producer

```java title="src/main/java/com/example/config/DinoConfigProducer.java"
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class DinoConfigProducer {
    
    @ConfigProperty(name = "dinoconfig.api-key")
    String apiKey;
    
    @ConfigProperty(name = "dinoconfig.base-url", defaultValue = "https://api.dinoconfig.com")
    String baseUrl;
    
    @ConfigProperty(name = "dinoconfig.timeout", defaultValue = "15000")
    Long timeout;
    
    @Produces
    @ApplicationScoped
    public DinoConfigSDK dinoConfigSDK() {
        return DinoConfigSDKFactory.create(apiKey, baseUrl, timeout);
    }
}
```

### Service

```java title="src/main/java/com/example/service/ConfigService.java"
import com.dinoconfig.sdk.DinoConfigSDK;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class ConfigService {
    
    @Inject
    DinoConfigSDK sdk;
    
    public AppSettings getAppSettings() {
        var response = sdk.getConfigAPI().getAs(
            "MyApp.Settings",
            AppSettings.class
        );
        return response.hasData() ? response.getData() : null;
    }
}
```

## Error Handling Patterns

### Retry with Fallback

```java
import com.dinoconfig.sdk.exception.ApiError;

public class ResilientConfigService {
    
    private final DinoConfigSDK sdk;
    private static final AppSettings DEFAULT_SETTINGS = new AppSettings();
    
    static {
        DEFAULT_SETTINGS.setTheme("light");
        DEFAULT_SETTINGS.setMaxItems(50);
    }
    
    public AppSettings getSettingsWithFallback() {
        try {
            var response = sdk.getConfigAPI().getAs(
                "MyApp.Settings",
                AppSettings.class,
                RequestOptions.builder()
                    .retries(3)
                    .timeout(10000L)
                    .build()
            );
            
            return response.hasData() ? response.getData() : DEFAULT_SETTINGS;
            
        } catch (ApiError e) {
            log.error("API error fetching settings: {} (status: {})", 
                e.getMessage(), e.getStatus());
            return DEFAULT_SETTINGS;
            
        } catch (Exception e) {
            log.error("Unexpected error fetching settings", e);
            return DEFAULT_SETTINGS;
        }
    }
}
```

### Circuit Breaker Pattern

```java
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;

public class CircuitBreakerConfigService {
    
    private final DinoConfigSDK sdk;
    private final CircuitBreaker circuitBreaker;
    
    public CircuitBreakerConfigService(DinoConfigSDK sdk) {
        this.sdk = sdk;
        
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .waitDurationInOpenState(Duration.ofMinutes(1))
            .permittedNumberOfCallsInHalfOpenState(3)
            .slidingWindowSize(10)
            .build();
            
        this.circuitBreaker = CircuitBreaker.of("dinoconfig", config);
    }
    
    public AppSettings getSettings() {
        return circuitBreaker.executeSupplier(() -> {
            var response = sdk.getConfigAPI().getAs(
                "MyApp.Settings",
                AppSettings.class
            );
            
            if (!response.hasData()) {
                throw new RuntimeException("No data in response");
            }
            
            return response.getData();
        });
    }
    
    public AppSettings getSettingsWithFallback() {
        try {
            return getSettings();
        } catch (Exception e) {
            log.warn("Circuit breaker triggered, using fallback");
            return AppSettings.defaults();
        }
    }
}
```

## Caching Patterns

### Local Cache with Caffeine

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

public class CachedConfigService {
    
    private final DinoConfigSDK sdk;
    private final Cache<String, Object> cache;
    
    public CachedConfigService(DinoConfigSDK sdk) {
        this.sdk = sdk;
        this.cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(5))
            .maximumSize(100)
            .build();
    }
    
    @SuppressWarnings("unchecked")
    public <T> T getConfig(String path, Class<T> type) {
        String cacheKey = path + ":" + type.getName();
        
        return (T) cache.get(cacheKey, key -> {
            var response = sdk.getConfigAPI().getAs(path, type);
            return response.hasData() ? response.getData() : null;
        });
    }
    
    public void invalidate(String path) {
        cache.asMap().keySet().stream()
            .filter(key -> key.startsWith(path))
            .forEach(cache::invalidate);
    }
    
    public void invalidateAll() {
        cache.invalidateAll();
    }
}
```

### Scheduled Cache Refresh

```java
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class RefreshingConfigService {
    
    private final DinoConfigSDK sdk;
    private final ScheduledExecutorService scheduler;
    private volatile AppSettings cachedSettings;
    
    public RefreshingConfigService(DinoConfigSDK sdk) {
        this.sdk = sdk;
        this.scheduler = Executors.newSingleThreadScheduledExecutor();
        
        // Initial load
        refreshSettings();
        
        // Schedule refresh every 5 minutes
        scheduler.scheduleAtFixedRate(
            this::refreshSettings,
            5, 5, TimeUnit.MINUTES
        );
    }
    
    private void refreshSettings() {
        try {
            var response = sdk.getConfigAPI().getAs(
                "MyApp.Settings",
                AppSettings.class
            );
            
            if (response.hasData()) {
                cachedSettings = response.getData();
                log.info("Configuration refreshed successfully");
            }
        } catch (Exception e) {
            log.error("Failed to refresh configuration", e);
        }
    }
    
    public AppSettings getSettings() {
        return cachedSettings;
    }
    
    public void shutdown() {
        scheduler.shutdown();
    }
}
```

## Multi-Tenant Configuration

```java
public class MultiTenantConfigService {
    
    private final DinoConfigSDK sdk;
    
    public MultiTenantConfigService(DinoConfigSDK sdk) {
        this.sdk = sdk;
    }
    
    public TenantSettings getTenantSettings(String tenantId) {
        // Each tenant has their own brand
        String brandName = "tenant-" + tenantId;
        
        var response = sdk.getConfigAPI().getAs(
            brandName + ".Settings",
            TenantSettings.class
        );
        
        if (response.hasData()) {
            return response.getData();
        }
        
        // Fall back to default tenant settings
        return getDefaultSettings();
    }
    
    public TenantSettings getDefaultSettings() {
        var response = sdk.getConfigAPI().getAs(
            "default-tenant.Settings",
            TenantSettings.class
        );
        
        return response.hasData() 
            ? response.getData() 
            : TenantSettings.defaults();
    }
}

// Usage with Spring request context
@RestController
public class TenantController {
    
    @Autowired
    private MultiTenantConfigService configService;
    
    @GetMapping(settings")
    public TenantSettings getSettings(
        @RequestHeader("X-Tenant-ID") String tenantId
    ) {
        return configService.getTenantSettings(tenantId);
    }
}
```

## Testing

### Unit Testing with Mocks

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class ConfigServiceTest {
    
    @Mock
    private DinoConfigSDK sdk;
    
    @Mock
    private ConfigAPI configApi;
    
    private ConfigService configService;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(sdk.getConfigAPI()).thenReturn(configApi);
        configService = new ConfigService(sdk);
    }
    
    @Test
    void shouldReturnAppSettings() {
        // Arrange
        AppSettings expected = new AppSettings();
        expected.setTheme("dark");
        expected.setMaxItems(100);
        
        ApiResponse<AppSettings> response = new ApiResponse<>();
        response.setData(expected);
        response.setSuccess(true);
        
        when(configApi.getAs("MyApp.Settings", AppSettings.class))
            .thenReturn(response);
        
        // Act
        AppSettings result = configService.getAppSettings();
        
        // Assert
        assertNotNull(result);
        assertEquals("dark", result.getTheme());
        assertEquals(100, result.getMaxItems());
    }
    
    @Test
    void shouldReturnNullWhenNoData() {
        // Arrange
        ApiResponse<AppSettings> response = new ApiResponse<>();
        response.setSuccess(false);
        
        when(configApi.getAs("MyApp.Settings", AppSettings.class))
            .thenReturn(response);
        
        // Act
        AppSettings result = configService.getAppSettings();
        
        // Assert
        assertNull(result);
    }
}
```

### Integration Testing

```java
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class ConfigServiceIntegrationTest {
    
    private static DinoConfigSDK sdk;
    
    @BeforeAll
    static void setUp() {
        sdk = DinoConfigSDKFactory.create(
            System.getenv("DINOCONFIG_TEST_API_KEY"),
            "https://api.staging.dinoconfig.com"
        );
    }
    
    @Test
    void shouldFetchRealConfiguration() {
        var response = sdk.getConfigAPI().get("TestBrand.TestConfig");
        
        assertTrue(response.hasData());
        assertNotNull(response.getData().getName());
    }
}
```

## Logging and Monitoring

```java
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;

public class InstrumentedConfigService {
    
    private final DinoConfigSDK sdk;
    private final Timer configFetchTimer;
    private final Counter errorCounter;
    
    public InstrumentedConfigService(
        DinoConfigSDK sdk, 
        MeterRegistry registry
    ) {
        this.sdk = sdk;
        this.configFetchTimer = registry.timer("dinoconfig.fetch.time");
        this.errorCounter = registry.counter("dinoconfig.fetch.errors");
    }
    
    public AppSettings getSettings() {
        return configFetchTimer.record(() -> {
            try {
                var response = sdk.getConfigAPI().getAs(
                    "MyApp.Settings",
                    AppSettings.class
                );
                return response.hasData() ? response.getData() : null;
            } catch (Exception e) {
                errorCounter.increment();
                throw e;
            }
        });
    }
}
```

## Related Resources

- **[Getting Started →](getting-started)** — Initial setup guide
- **[Configuration →](configuration)** — SDK configuration options
- **[Typed Configs →](typed-configs)** — Generate type-safe models
