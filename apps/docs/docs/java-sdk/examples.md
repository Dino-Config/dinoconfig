---
sidebar_position: 6
title: Examples
description: Real-world examples for the DinoConfig Java SDK.
---

# Examples

Common patterns and integrations for the DinoConfig Java SDK.

## Basic Usage

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create(
    System.getenv("DINOCONFIG_API_KEY"),
    "https://api.dinoconfig.com"
);

var config = sdk.getConfigAPI().get("MyApp.Settings");

if (config.hasData()) {
    System.out.println("Theme: " + config.getData().getValue("theme"));
}
```

## Feature Flags

```java
public class FeatureFlagService {
    private final DinoConfigSDK sdk;
    
    public FeatureFlagService(DinoConfigSDK sdk) {
        this.sdk = sdk;
    }
    
    public boolean isEnabled(String featureName) {
        try {
            var response = sdk.getConfigAPI().getValue("MyApp.FeatureFlags." + featureName);
            return Boolean.TRUE.equals(response.getData());
        } catch (Exception e) {
            return false;
        }
    }
}

// Usage
if (flags.isEnabled("darkMode")) {
    enableDarkMode();
}
```

## Spring Boot

```java
@Configuration
public class DinoConfigConfiguration {
    
    @Value("${dinoconfig.api-key}")
    private String apiKey;
    
    @Bean
    public DinoConfigSDK dinoConfigSDK() {
        return DinoConfigSDKFactory.create(apiKey, "https://api.dinoconfig.com");
    }
}

@Service
public class ConfigService {
    private final DinoConfigSDK sdk;
    
    public ConfigService(DinoConfigSDK sdk) {
        this.sdk = sdk;
    }
    
    @Cacheable("appSettings")
    public AppSettings getAppSettings() {
        var response = sdk.getConfigAPI().getAs("MyApp.Settings", AppSettings.class);
        return response.hasData() ? response.getData() : null;
    }
}
```

```yaml
# application.yml
dinoconfig:
  api-key: ${DINOCONFIG_API_KEY}
```

## Quarkus

```java
@ApplicationScoped
public class DinoConfigProducer {
    
    @ConfigProperty(name = "dinoconfig.api-key")
    String apiKey;
    
    @Produces
    @ApplicationScoped
    public DinoConfigSDK dinoConfigSDK() {
        return DinoConfigSDKFactory.create(apiKey);
    }
}
```

## Error Handling with Fallback

```java
public class ResilientConfigService {
    private final DinoConfigSDK sdk;
    private static final AppSettings DEFAULT = new AppSettings("light", 50);
    
    public AppSettings getSettings() {
        try {
            var response = sdk.getConfigAPI().getAs(
                "MyApp.Settings",
                AppSettings.class,
                RequestOptions.builder().retries(3).build()
            );
            return response.hasData() ? response.getData() : DEFAULT;
        } catch (Exception e) {
            log.error("Config fetch failed", e);
            return DEFAULT;
        }
    }
}
```

## Caching with Caffeine

```java
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
    
    public <T> T getConfig(String path, Class<T> type) {
        return (T) cache.get(path, k -> {
            var response = sdk.getConfigAPI().getAs(path, type);
            return response.hasData() ? response.getData() : null;
        });
    }
}
```

## Testing with Mocks

```java
@ExtendWith(MockitoExtension.class)
class ConfigServiceTest {
    
    @Mock DinoConfigSDK sdk;
    @Mock ConfigAPI configApi;
    
    @BeforeEach
    void setup() {
        when(sdk.getConfigAPI()).thenReturn(configApi);
    }
    
    @Test
    void shouldReturnSettings() {
        var expected = new AppSettings("dark", 100);
        var response = new ApiResponse<>(expected, true, null);
        
        when(configApi.getAs("MyApp.Settings", AppSettings.class))
            .thenReturn(response);
        
        var service = new ConfigService(sdk);
        var result = service.getAppSettings();
        
        assertEquals("dark", result.getTheme());
    }
}
```
