---
sidebar_position: 2
title: SDK Configuration Options
description: Configure the DinoConfig Java SDK with custom options for authentication, timeouts, and request handling. Builder pattern and Spring Boot integration.
keywords: [java sdk configuration, timeout, api key, authentication, spring boot, quarkus, sdk options]
---

# Configuration

The DinoConfig Java SDK can be configured with various options to customize its behavior for your specific use case.

## Configuration Options

```java
public class DinoConfigSDKConfig {
    private String apiKey;      // Required
    private String baseUrl;     // Optional - default: "http://localhost:3000"
    private Long timeout;       // Optional - default: 10000L (10 seconds)
}
```

### Required Options

#### `apiKey`

Your DinoConfig API key. Keys are prefixed with `dino_`.

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_abc123xyz789");
```

:::tip Getting an API Key
You can generate API keys from the [DinoConfig Dashboard](https://dinoconfig.com). Each key can have different permission levels.
:::

### Optional Options

#### `baseUrl`

The base URL for the DinoConfig API. Defaults to `http://localhost:3000` for local development.

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com"  // Production URL
);
```

#### `timeout`

Request timeout in milliseconds. Defaults to `10000` (10 seconds).

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com",
    30000L  // 30 seconds
);
```

## Using the Builder Pattern

For more complex configurations, use the builder pattern:

```java
DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
    .apiKey("dino_your-api-key")
    .baseUrl("https://api.dinoconfig.com")
    .timeout(15000L)
    .build();

DinoConfigSDK sdk = DinoConfigSDKFactory.create(config);
```

## Request Options

Individual API calls can be customized with `RequestOptions`:

```java
public class RequestOptions {
    private Map<String, String> headers;  // Custom headers
    private Long timeout;                  // Per-request timeout
    private Integer retries;               // Retry attempts
    private Boolean cache;                 // Enable/disable caching
    private Boolean forceRefresh;          // Bypass cache
}
```

### Creating Request Options

```java
// Using builder
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)
    .retries(3)
    .addHeader("X-Custom-Header", "value")
    .build();

// Using fluent setters
RequestOptions options = new RequestOptions()
    .setTimeout(30000L)
    .setRetries(3)
    .addHeader("X-Custom-Header", "value");
```

### Per-Request Configuration

```java
// Custom timeout for a slow request
var config = sdk.getConfigAPI().get("Brand.Config", 
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

// Custom headers
var custom = sdk.getConfigAPI().get("Brand.Config",
    RequestOptions.builder()
        .addHeader("X-Request-ID", UUID.randomUUID().toString())
        .build()
);
```

## Configuration Patterns

### Development Environment

```java
DinoConfigSDKConfig devConfig = DinoConfigSDKConfig.builder()
    .apiKey(System.getenv("DINOCONFIG_API_KEY"))
    .baseUrl("http://localhost:3000")
    .timeout(5000L)  // Short timeout for fast feedback
    .build();

DinoConfigSDK sdk = DinoConfigSDKFactory.create(devConfig);
```

### Production Environment

```java
DinoConfigSDKConfig prodConfig = DinoConfigSDKConfig.builder()
    .apiKey(System.getenv("DINOCONFIG_API_KEY"))
    .baseUrl("https://api.dinoconfig.com")
    .timeout(15000L)  // Longer timeout for reliability
    .build();

DinoConfigSDK sdk = DinoConfigSDKFactory.create(prodConfig);
```

### Spring Boot Integration

```java title="application.properties"
dinoconfig.api-key=${DINOCONFIG_API_KEY}
dinoconfig.base-url=https://api.dinoconfig.com
dinoconfig.timeout=15000
```

```java title="DinoConfigConfiguration.java"
@Configuration
public class DinoConfigConfiguration {
    
    @Value("${dinoconfig.api-key}")
    private String apiKey;
    
    @Value("${dinoconfig.base-url}")
    private String baseUrl;
    
    @Value("${dinoconfig.timeout}")
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

### Micronaut Integration

```yaml title="application.yml"
dinoconfig:
  api-key: ${DINOCONFIG_API_KEY}
  base-url: https://api.dinoconfig.com
  timeout: 15000
```

```java title="DinoConfigFactory.java"
@Factory
public class DinoConfigFactory {
    
    @Singleton
    public DinoConfigSDK dinoConfigSDK(
        @Property(name = "dinoconfig.api-key") String apiKey,
        @Property(name = "dinoconfig.base-url") String baseUrl,
        @Property(name = "dinoconfig.timeout") Long timeout
    ) {
        return DinoConfigSDKFactory.create(apiKey, baseUrl, timeout);
    }
}
```

## Error Handling

The SDK throws `ApiError` for failed requests:

```java
import com.dinoconfig.sdk.exception.ApiError;

try {
    DinoConfigSDK sdk = DinoConfigSDKFactory.create("invalid_key");
    var config = sdk.getConfigAPI().get("Brand.Config");
} catch (ApiError e) {
    System.err.println("API Error: " + e.getMessage());
    System.err.println("Status: " + e.getStatus());
    System.err.println("Code: " + e.getCode());
    
    if (e.isClientError()) {
        // 4xx error - check your request
    } else if (e.isServerError()) {
        // 5xx error - retry may help
    }
    
    if (e.isRetryable()) {
        // Safe to retry this request
    }
}
```

### ApiError Properties

| Property | Type | Description |
|----------|------|-------------|
| `message` | `String` | Error message |
| `status` | `Integer` | HTTP status code |
| `code` | `String` | Optional error code |
| `isClientError()` | `boolean` | True if 4xx error |
| `isServerError()` | `boolean` | True if 5xx error |
| `isRetryable()` | `boolean` | True if retry may succeed |

## Connection Pooling

The SDK uses OkHttp which provides automatic connection pooling:

```java
// OkHttp maintains a connection pool automatically
// Connections are reused for multiple requests
// Default: 5 idle connections, 5 minute keep-alive

DinoConfigSDK sdk = DinoConfigSDKFactory.create(config);

// All these requests may reuse the same connection
sdk.getConfigAPI().get("Brand.Config1");
sdk.getConfigAPI().get("Brand.Config2");
sdk.getConfigAPI().get("Brand.Config3");
```

## Logging

The SDK uses SLF4J for logging. Configure your preferred logging implementation:

### Logback Configuration

```xml title="logback.xml"
<configuration>
    <logger name="com.dinoconfig.sdk" level="DEBUG"/>
    
    <root level="INFO">
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

### Log4j2 Configuration

```xml title="log4j2.xml"
<Configuration>
    <Loggers>
        <Logger name="com.dinoconfig.sdk" level="debug"/>
    </Loggers>
</Configuration>
```

## Best Practices

### 1. Create SDK Instance Once

```java
// ✅ Create once, reuse everywhere
public class AppConfig {
    private static final DinoConfigSDK SDK = DinoConfigSDKFactory.create(
        System.getenv("DINOCONFIG_API_KEY")
    );
    
    public static DinoConfigSDK getSdk() {
        return SDK;
    }
}

// ❌ Don't create new instances for each request
public void handleRequest() {
    DinoConfigSDK sdk = DinoConfigSDKFactory.create(...); // Wasteful!
}
```

### 2. Use Environment Variables

```java
// ✅ Load from environment
String apiKey = System.getenv("DINOCONFIG_API_KEY");

// ❌ Never hardcode
String apiKey = "dino_abc123"; // Security risk!
```

### 3. Handle Errors Gracefully

```java
public AppSettings getSettings() {
    try {
        var response = sdk.getConfigAPI().get("MyApp.Settings");
        return mapToSettings(response.getData());
    } catch (ApiError e) {
        log.error("Failed to fetch settings", e);
        return AppSettings.defaults();
    }
}
```

## Next Steps

- **[Configs API →](configs-api)** — Learn to fetch configurations
- **[Discovery API →](discovery-api)** — Explore available configurations
- **[Typed Configs →](typed-configs)** — Generate type-safe models
- **[Examples →](examples)** — Real-world usage patterns
