# DinoConfig Java SDK

[![Maven Central](https://img.shields.io/maven-central/v/com.dinoconfig/dinoconfig-java-sdk.svg)](https://search.maven.org/artifact/com.dinoconfig/dinoconfig-java-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-21+-blue.svg)](https://www.oracle.com/java/)

Official Java SDK for the DinoConfig API. This SDK provides a simple, type-safe, and intuitive way to interact with DinoConfig's configuration management system.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Simple Factory Pattern** - Single factory method for easy SDK instantiation
- **Automatic Authentication** - API key to token exchange handled automatically
- **Type-Safe** - Full Java generics support with proper typing
- **Retry Logic** - Built-in exponential backoff for failed requests
- **Timeout Support** - Configurable request timeouts
- **OkHttp Integration** - Uses battle-tested OkHttp client for HTTP communication
- **Jackson Integration** - Automatic JSON serialization/deserialization

## Installation

### Gradle

Add the following dependency to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.dinoconfig:dinoconfig-java-sdk:1.0.0'
}
```

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("com.dinoconfig:dinoconfig-java-sdk:1.0.0")
}
```

### Maven

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>com.dinoconfig</groupId>
    <artifactId>dinoconfig-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Quick Start

```java
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.model.ApiResponse;
import com.dinoconfig.sdk.model.RequestOptions;

public class QuickStart {
    public static void main(String[] args) throws Exception {
        // Initialize the SDK with your API key (single step!)
        DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key-here");
        
        // Get the ConfigAPI instance
        ConfigAPI configAPI = dinoconfig.getConfigAPI();
        
        // Get a configuration value
        ApiResponse<Object> response = configAPI.getConfigValue(
            "MyBrand",      // brand name
            "AppSettings",  // config name
            "featureFlag",  // config value key
            new RequestOptions()
        );
        
        if (response.getSuccess()) {
            System.out.println("Config value: " + response.getData());
        }
    }
}
```

**That's it!** The SDK handles:
- API key to access token exchange
- Authorization headers
- Request formatting and parsing

## Configuration Options

The SDK can be configured using `DinoConfigSDKFactory` methods or the `DinoConfigSDKConfig` class:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `String` | **Yes** | - | Your DinoConfig API key for authentication |
| `baseUrl` | `String` | No | `"http://localhost:3000"` | Base URL for the DinoConfig API |
| `timeout` | `Long` | No | `10000` | Request timeout in milliseconds |

### Configuration Examples

```java
// Method 1: Simple - API key only (uses defaults)
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");

// Method 2: API key + base URL
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com"
);

// Method 3: All parameters
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com",
    15000L  // 15 second timeout
);

// Method 4: Using config object (most flexible)
DinoConfigSDKConfig config = new DinoConfigSDKConfig();
config.setApiKey("dino_your-api-key");
config.setBaseUrl("https://api.dinoconfig.com");
config.setTimeout(15000L);

DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
```

## Authentication

### How It Works

The DinoConfig SDK uses API key-based authentication with automatic token exchange:

1. **You provide an API key** - Obtained from the DinoConfig dashboard
2. **SDK exchanges it for a token** - Happens automatically during initialization
3. **Token is used for requests** - All subsequent API calls use the access token

### Getting an API Key

1. Log in to your [DinoConfig Dashboard](https://app.dinoconfig.com)
2. Navigate to **Settings** → **SDK & API Keys**
3. Click **Create New Key**
4. Provide a name and description for the key
5. **Copy the key immediately** - It won't be shown again!

### Security Best Practices

```java
// DO: Use environment variables
String apiKey = System.getenv("DINOCONFIG_API_KEY");
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(apiKey);

// DO: Use configuration files (application.properties, etc.)
String apiKey = config.getProperty("dinoconfig.api-key");
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(apiKey);

// DON'T: Hardcode API keys in source code
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_abc123..."); // Never in production!
```

## API Reference

### DinoConfigSDKFactory

Factory class for creating SDK instances.

#### `create(String apiKey)`

Creates an SDK instance with just an API key (uses default settings).

```java
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
```

#### `create(String apiKey, String baseUrl)`

Creates an SDK instance with API key and custom base URL.

```java
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com"
);
```

#### `create(String apiKey, String baseUrl, Long timeout)`

Creates an SDK instance with all parameters.

```java
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com",
    15000L
);
```

#### `create(DinoConfigSDKConfig config)`

Creates an SDK instance from a configuration object.

```java
DinoConfigSDKConfig config = new DinoConfigSDKConfig();
config.setApiKey("dino_your-api-key");
config.setBaseUrl("https://api.dinoconfig.com");
config.setTimeout(15000L);

DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
```

---

### ConfigAPI

API client for configuration value retrieval.

#### `getConfigValue(String brandName, String configName, String configValueKey, RequestOptions options)`

Retrieves a specific configuration value.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `String` | **Yes** | The name of the brand |
| `configName` | `String` | **Yes** | The name of the configuration |
| `configValueKey` | `String` | **Yes** | The key of the specific value to retrieve |
| `options` | `RequestOptions` | **Yes** | Request options (can be empty `new RequestOptions()`) |

**Returns:** `ApiResponse<Object>` - Response containing the config value

**Throws:** `IOException` if the request fails

**Example:**

```java
ConfigAPI configAPI = dinoconfig.getConfigAPI();

// Get a feature flag value
ApiResponse<Object> response = configAPI.getConfigValue(
    "MyBrand",
    "FeatureFlags",
    "enableDarkMode",
    new RequestOptions()
);

if (response.getSuccess()) {
    Boolean isDarkModeEnabled = (Boolean) response.getData();
    System.out.println("Dark mode enabled: " + isDarkModeEnabled);
}
```

---

### RequestOptions

Options for customizing individual API requests.

| Field | Type | Description |
|-------|------|-------------|
| `headers` | `Map<String, String>` | Custom headers for this specific request |
| `timeout` | `Long` | Request timeout in milliseconds (overrides default) |
| `retries` | `Integer` | Number of retry attempts for failed requests |

**Example:**

```java
RequestOptions options = new RequestOptions();
options.setTimeout(5000L);  // 5 second timeout
options.setRetries(3);      // Retry up to 3 times
options.setHeaders(Map.of(
    "X-Request-ID", "unique-request-id",
    "X-Custom-Header", "custom-value"
));

ApiResponse<Object> response = configAPI.getConfigValue(
    "MyBrand",
    "Settings",
    "apiEndpoint",
    options
);
```

---

### ApiResponse\<T\>

Standard API response wrapper.

| Field | Type | Description |
|-------|------|-------------|
| `data` | `T` | The response payload |
| `success` | `Boolean` | Whether the request was successful |
| `message` | `String` | Optional message (usually for errors) |

**Methods:**

```java
ApiResponse<Object> response = configAPI.getConfigValue(...);

// Check if successful
if (response.getSuccess()) {
    // Get the data
    Object value = response.getData();
    
    // Cast to expected type
    String stringValue = (String) response.getData();
    Boolean boolValue = (Boolean) response.getData();
    Map<String, Object> mapValue = (Map<String, Object>) response.getData();
}

// Get error message if failed
if (!response.getSuccess()) {
    String errorMessage = response.getMessage();
}
```

---

### ApiError

Structured error thrown by the SDK.

| Field | Type | Description |
|-------|------|-------------|
| `message` | `String` | Human-readable error message |
| `status` | `Integer` | HTTP status code |
| `code` | `String` | Optional error code for programmatic handling |

## Error Handling

The SDK throws structured `ApiError` exceptions that you can catch and handle appropriately.

### Basic Error Handling

```java
import com.dinoconfig.sdk.model.ApiError;
import java.io.IOException;

try {
    DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
    ConfigAPI configAPI = dinoconfig.getConfigAPI();
    
    ApiResponse<Object> response = configAPI.getConfigValue(
        "MyBrand",
        "MyConfig",
        "myKey",
        new RequestOptions()
    );
    
    if (response.getSuccess()) {
        System.out.println("Value: " + response.getData());
    } else {
        System.out.println("Request failed: " + response.getMessage());
    }
    
} catch (ApiError e) {
    // Handle API errors
    switch (e.getStatus()) {
        case 401:
            System.err.println("Unauthorized - check your API key");
            break;
        case 403:
            System.err.println("Forbidden - insufficient permissions");
            break;
        case 404:
            System.err.println("Configuration not found");
            break;
        case 429:
            System.err.println("Rate limited - please slow down requests");
            break;
        case 500:
            System.err.println("Server error - please try again later");
            break;
        default:
            System.err.println("API Error (" + e.getStatus() + "): " + e.getMessage());
    }
    
    // Check error code if available
    if ("CONFIG_NOT_FOUND".equals(e.getCode())) {
        // Handle specific error
    }
    
} catch (IOException e) {
    // Handle network/timeout errors
    System.err.println("Network error: " + e.getMessage());
}
```

### Common Error Scenarios

| Status | Meaning | Suggested Action |
|--------|---------|------------------|
| 401 | Unauthorized | Check API key validity |
| 403 | Forbidden | Verify permissions for the resource |
| 404 | Not Found | Check brand/config/key names |
| 429 | Too Many Requests | Implement backoff, reduce request rate |
| 500 | Server Error | Retry with exponential backoff |

## Examples

### Spring Boot Integration

```java
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.DinoConfigSDK;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DinoConfigConfiguration {
    
    @Value("${dinoconfig.api-key}")
    private String apiKey;
    
    @Value("${dinoconfig.base-url:https://api.dinoconfig.com}")
    private String baseUrl;
    
    @Bean
    public DinoConfigSDK dinoConfigSDK() throws Exception {
        return DinoConfigSDKFactory.create(apiKey, baseUrl);
    }
}
```

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.model.ApiResponse;
import com.dinoconfig.sdk.model.RequestOptions;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class ConfigController {
    
    private final DinoConfigSDK dinoconfig;
    
    public ConfigController(DinoConfigSDK dinoconfig) {
        this.dinoconfig = dinoconfig;
    }
    
    @GetMapping("/{brand}/{config}/{key}")
    public Object getConfigValue(
            @PathVariable String brand,
            @PathVariable String config,
            @PathVariable String key) throws Exception {
        
        ConfigAPI configAPI = dinoconfig.getConfigAPI();
        ApiResponse<Object> response = configAPI.getConfigValue(
            brand, config, key, new RequestOptions()
        );
        
        if (response.getSuccess()) {
            return response.getData();
        }
        
        throw new RuntimeException("Failed to get config: " + response.getMessage());
    }
}
```

### Feature Flag Example

```java
public class FeatureFlagService {
    
    private final ConfigAPI configAPI;
    
    public FeatureFlagService(DinoConfigSDK dinoconfig) {
        this.configAPI = dinoconfig.getConfigAPI();
    }
    
    public boolean isFeatureEnabled(String featureName) {
        try {
            ApiResponse<Object> response = configAPI.getConfigValue(
                "MyApp",
                "FeatureFlags",
                featureName,
                new RequestOptions()
            );
            
            if (response.getSuccess() && response.getData() instanceof Boolean) {
                return (Boolean) response.getData();
            }
            
            return false; // Default to disabled
            
        } catch (Exception e) {
            System.err.println("Failed to check feature flag: " + e.getMessage());
            return false; // Safe default
        }
    }
    
    public void doSomethingWithFeatureFlag() {
        if (isFeatureEnabled("enableBetaFeatures")) {
            // Show beta features
            System.out.println("Beta features enabled!");
        } else {
            // Show standard features
            System.out.println("Standard features only");
        }
    }
}
```

### With Custom Request Options

```java
public class RobustConfigClient {
    
    private final ConfigAPI configAPI;
    
    public RobustConfigClient(DinoConfigSDK dinoconfig) {
        this.configAPI = dinoconfig.getConfigAPI();
    }
    
    public Object getCriticalConfig(String brand, String config, String key) throws IOException {
        // Use custom options for critical configurations
        RequestOptions options = new RequestOptions();
        options.setTimeout(30000L);  // 30 second timeout
        options.setRetries(5);       // Retry up to 5 times
        options.setHeaders(Map.of(
            "X-Request-ID", java.util.UUID.randomUUID().toString()
        ));
        
        ApiResponse<Object> response = configAPI.getConfigValue(
            brand, config, key, options
        );
        
        if (response.getSuccess()) {
            return response.getData();
        }
        
        throw new RuntimeException("Failed to get critical config: " + response.getMessage());
    }
}
```

### Caching Configuration Values

```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class CachedConfigService {
    
    private final ConfigAPI configAPI;
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final long cacheTtlMs;
    
    public CachedConfigService(DinoConfigSDK dinoconfig, long cacheTtlMinutes) {
        this.configAPI = dinoconfig.getConfigAPI();
        this.cacheTtlMs = TimeUnit.MINUTES.toMillis(cacheTtlMinutes);
    }
    
    public Object getConfigValue(String brand, String config, String key) throws IOException {
        String cacheKey = brand + ":" + config + ":" + key;
        
        CacheEntry entry = cache.get(cacheKey);
        if (entry != null && !entry.isExpired()) {
            return entry.getValue();
        }
        
        // Fetch from API
        ApiResponse<Object> response = configAPI.getConfigValue(
            brand, config, key, new RequestOptions()
        );
        
        if (response.getSuccess()) {
            cache.put(cacheKey, new CacheEntry(response.getData(), cacheTtlMs));
            return response.getData();
        }
        
        throw new RuntimeException("Failed to get config: " + response.getMessage());
    }
    
    private static class CacheEntry {
        private final Object value;
        private final long expiresAt;
        
        CacheEntry(Object value, long ttlMs) {
            this.value = value;
            this.expiresAt = System.currentTimeMillis() + ttlMs;
        }
        
        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
        
        Object getValue() {
            return value;
        }
    }
}
```

## Requirements

- **Java** 21 or higher
- **Dependencies** (automatically included via Gradle/Maven):
  - OkHttp 4.12.0+
  - Jackson Databind 2.16.1+
  - SLF4J API 2.0.9+

## Development

### Building

```bash
# From the SDK directory
cd libs/dinoconfig-java-sdk
./gradlew build

# Or using Nx
npx nx build dinoconfig-java-sdk
```

### Testing

```bash
# From the SDK directory
cd libs/dinoconfig-java-sdk
./gradlew test

# Or using Nx
npx nx test dinoconfig-java-sdk
```

### Generating JavaDoc

```bash
./gradlew javadoc
```

## Support

- **Documentation**: [https://docs.dinoconfig.com](https://docs.dinoconfig.com)
- **Issues**: [GitHub Issues](https://github.com/dinoconfig/dinoconfig-java-sdk/issues)
- **Email**: support@dinoconfig.com

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ by the DinoConfig Team
