---
sidebar_position: 2
title: SDK Configuration
description: Configure the DinoConfig Java SDK with custom settings including timeouts, logging, and HTTP client options.
keywords: [configuration, sdk config, timeout, logging, http client, java sdk settings, customization]
---

# SDK Configuration

The DinoConfig Java SDK can be customized to fit your application's needs. This guide covers all configuration options.

## Configuration Methods

### Simple Initialization

For most use cases, use the factory methods:

```java
// API key only (uses default base URL)
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-key");

// With base URL
DinoConfigSDK sdk = DinoConfigSDKFactory.create(
    "dino_your-key",
    "https://api.dinoconfig.com"
);

// With timeout
DinoConfigSDK sdk = DinoConfigSDKFactory.create(
    "dino_your-key",
    "https://api.dinoconfig.com",
    15000L  // 15 seconds
);
```

### Builder Configuration

For advanced configuration, use the configuration builder:

```java
DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
    .apiKey("dino_your-key")
    .baseUrl("https://api.dinoconfig.com")
    .timeout(30000L)
    .retries(3)
    .build();

DinoConfigSDK sdk = DinoConfigSDKFactory.create(config);
```

## Configuration Options

### Core Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `String` | **Required** | Your DinoConfig API key |
| `baseUrl` | `String` | `http://localhost:3000` | API base URL |
| `timeout` | `Long` | `10000` | Request timeout in milliseconds |
| `retries` | `Integer` | `0` | Number of retry attempts |

```java
DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
    .apiKey("dino_your-key")
    .baseUrl("https://api.dinoconfig.com")
    .timeout(30000L)   // 30 second timeout
    .retries(3)        // Retry failed requests 3 times
    .build();
```

### HTTP Client Settings

#### Connection Pool

```java
DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
    .apiKey("dino_key")
    .baseUrl("https://api.dinoconfig.com")
    .maxIdleConnections(5)       // Connection pool size
    .keepAliveDuration(300000L)  // 5 minutes
    .build();
```

#### Timeouts

```java
DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
    .apiKey("dino_key")
    .baseUrl("https://api.dinoconfig.com")
    .connectTimeout(5000L)   // Connection timeout
    .readTimeout(10000L)     // Read timeout
    .writeTimeout(10000L)    // Write timeout
    .build();
```

## Environment-Based Configuration

### Using Environment Variables

```java
public class SDKConfig {
    public static DinoConfigSDK create() {
        String apiKey = System.getenv("DINOCONFIG_API_KEY");
        String baseUrl = System.getenv().getOrDefault(
            "DINOCONFIG_BASE_URL", 
            "https://api.dinoconfig.com"
        );
        String timeout = System.getenv().getOrDefault(
            "DINOCONFIG_TIMEOUT", 
            "10000"
        );
        
        return DinoConfigSDKFactory.create(
            apiKey,
            baseUrl,
            Long.parseLong(timeout)
        );
    }
}
```

### Per-Environment Settings

```java
public class SDKConfig {
    public static DinoConfigSDK create(String environment) {
        DinoConfigSDKConfig.Builder builder = DinoConfigSDKConfig.builder()
            .apiKey(System.getenv("DINOCONFIG_API_KEY"));
        
        switch (environment) {
            case "development":
                builder
                    .baseUrl("http://localhost:3000")
                    .timeout(30000L)
                    .retries(0);
                break;
            case "staging":
                builder
                    .baseUrl("https://staging-api.dinoconfig.com")
                    .timeout(15000L)
                    .retries(2);
                break;
            case "production":
                builder
                    .baseUrl("https://api.dinoconfig.com")
                    .timeout(10000L)
                    .retries(3);
                break;
        }
        
        return DinoConfigSDKFactory.create(builder.build());
    }
}
```

## Logging

The SDK uses SLF4J for logging. Configure your logging framework to control SDK output.

### Logback Example

```xml
<!-- logback.xml -->
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- SDK logging level -->
    <logger name="com.dinoconfig.sdk" level="DEBUG" />
    
    <!-- HTTP client logging (verbose) -->
    <logger name="com.dinoconfig.sdk.http" level="TRACE" />
    
    <root level="INFO">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

### Log4j2 Example

```xml
<!-- log4j2.xml -->
<Configuration>
    <Loggers>
        <Logger name="com.dinoconfig.sdk" level="debug" />
        <Root level="info">
            <AppenderRef ref="Console" />
        </Root>
    </Loggers>
</Configuration>
```

## Request Options

Override configuration per-request using `RequestOptions`:

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_key", "https://api.dinoconfig.com");

// Default timeout from SDK config
ConfigData config1 = sdk.getConfigAPI().get("Brand.Config");

// Extended timeout for this specific request
ConfigData config2 = sdk.getConfigAPI().get("Brand.LargeConfig",
    RequestOptions.builder()
        .timeout(60000L)
        .build()
);

// Custom headers for tracing
ConfigData config3 = sdk.getConfigAPI().get("Brand.Config",
    RequestOptions.builder()
        .addHeader("X-Request-ID", UUID.randomUUID().toString())
        .addHeader("X-Trace-ID", traceId)
        .build()
);
```

## Singleton Pattern

For most applications, create a single SDK instance:

```java
public class DinoConfig {
    private static volatile DinoConfigSDK instance;
    
    public static DinoConfigSDK getInstance() {
        if (instance == null) {
            synchronized (DinoConfig.class) {
                if (instance == null) {
                    instance = DinoConfigSDKFactory.create(
                        System.getenv("DINOCONFIG_API_KEY"),
                        "https://api.dinoconfig.com"
                    );
                }
            }
        }
        return instance;
    }
}

// Usage
ConfigData config = DinoConfig.getInstance().getConfigAPI().get("Brand.Config");
```

## Spring Boot Integration

### Configuration Class

```java
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

### Application Properties

```properties
# application.properties
dinoconfig.api-key=${DINOCONFIG_API_KEY}
dinoconfig.base-url=https://api.dinoconfig.com
dinoconfig.timeout=10000
```

### Using in Services

```java
@Service
public class SettingsService {
    private final ConfigAPI configApi;
    
    public SettingsService(ConfigAPI configApi) {
        this.configApi = configApi;
    }
    
    public AppSettings getSettings() {
        try {
            return configApi.getAs("MyApp.Settings", AppSettings.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load settings", e);
        }
    }
}
```

## Best Practices

### 1. Store API Key Securely

```java
// Good: Environment variable
String apiKey = System.getenv("DINOCONFIG_API_KEY");

// Good: Secrets manager
String apiKey = secretsManager.getSecret("dinoconfig-api-key");

// Bad: Hardcoded
String apiKey = "dino_abc123...";  // Never do this!
```

### 2. Use Production URL

```java
// Development
DinoConfigSDK sdk = DinoConfigSDKFactory.create(apiKey, "http://localhost:3000");

// Production - always use HTTPS
DinoConfigSDK sdk = DinoConfigSDKFactory.create(apiKey, "https://api.dinoconfig.com");
```

### 3. Configure Appropriate Timeouts

```java
// Quick configs: shorter timeout
DinoConfigSDKConfig quickConfig = DinoConfigSDKConfig.builder()
    .apiKey(apiKey)
    .baseUrl(baseUrl)
    .timeout(5000L)
    .build();

// Large configs: longer timeout
DinoConfigSDKConfig largeConfig = DinoConfigSDKConfig.builder()
    .apiKey(apiKey)
    .baseUrl(baseUrl)
    .timeout(30000L)
    .build();
```

### 4. Enable Retries for Production

```java
DinoConfigSDKConfig prodConfig = DinoConfigSDKConfig.builder()
    .apiKey(apiKey)
    .baseUrl("https://api.dinoconfig.com")
    .timeout(10000L)
    .retries(3)  // Retry on transient failures
    .build();
```

## Next Steps

- **[Configs API →](configs-api)** — Fetch configurations and values
- **[Discovery API →](discovery-api)** — Explore available configurations
- **[Examples →](examples)** — Real-world usage patterns
