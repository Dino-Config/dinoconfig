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
  - [ConfigAPI](#configapi)
  - [DiscoveryAPI](#discoveryapi)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Simple Factory Pattern** - Single factory method for easy SDK instantiation
- **Automatic Authentication** - API key to token exchange handled automatically
- **Type-Safe** - Full Java generics support with proper typing
- **Discovery API** - Explore available brands, configs, and schemas
- **Path-Based Access** - Convenient shorthand like `Brand.Config.Key`
- **Builder Pattern** - Fluent API for configuration
- **Immutable Models** - Thread-safe model classes
- **Retry Logic** - Built-in exponential backoff for failed requests
- **Timeout Support** - Configurable request timeouts
- **OkHttp Integration** - Uses battle-tested OkHttp client for HTTP communication
- **Jackson Integration** - Automatic JSON serialization/deserialization

## Installation

### Gradle

Add the following dependency to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.dinoconfig:dinoconfig-java-sdk:1.1.0'
}
```

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("com.dinoconfig:dinoconfig-java-sdk:1.1.0")
}
```

### Maven

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>com.dinoconfig</groupId>
    <artifactId>dinoconfig-java-sdk</artifactId>
    <version>1.1.0</version>
</dependency>
```

## Quick Start

```java
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.api.DiscoveryAPI;
import com.dinoconfig.sdk.model.*;

public class QuickStart {
    public static void main(String[] args) throws Exception {
        // Initialize the SDK with your API key
        DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
        
        // Get entire configuration
        ConfigAPI configAPI = dinoconfig.getConfigAPI();
        ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings");
        System.out.println("All values: " + config.getData().getValues());
        
        // Get typed values
        String theme = config.getData().getValue("theme", String.class);
        Boolean darkMode = config.getData().getValue("darkMode", Boolean.class);
        
        // Get single value using path shorthand
        ApiResponse<Object> response = configAPI.getValue("MyBrand.AppSettings.theme");
        System.out.println("Theme: " + response.getData());
        
        // Discover available configurations
        DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();
        ApiResponse<java.util.List<BrandInfo>> brands = discoveryAPI.listBrands();
        for (BrandInfo brand : brands.getData()) {
            System.out.printf("Brand: %s (%d configs)%n", 
                brand.getName(), brand.getConfigCount());
        }
    }
}
```

## Configuration Options

The SDK supports both traditional setters and a fluent builder pattern:

### Builder Pattern (Recommended)

```java
DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
    .apiKey("dino_your-api-key")
    .baseUrl("https://api.dinoconfig.com")
    .timeout(15000L)
    .build();

DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
```

### Factory Methods

```java
// Simple - API key only (uses defaults)
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");

// API key + base URL
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com"
);

// All parameters
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com",
    15000L  // 15 second timeout
);
```

### Configuration Options Table

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `String` | **Yes** | - | Your DinoConfig API key |
| `baseUrl` | `String` | No | `"http://localhost:3000"` | Base URL for the API |
| `timeout` | `Long` | No | `10000` | Request timeout in milliseconds |

## Authentication

### How It Works

1. **You provide an API key** - Obtained from the DinoConfig dashboard
2. **SDK exchanges it for a token** - Happens automatically during initialization
3. **Token is used for requests** - All subsequent API calls use the access token

### Security Best Practices

```java
// DO: Use environment variables
String apiKey = System.getenv("DINOCONFIG_API_KEY");
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(apiKey);

// DO: Use configuration files
String apiKey = config.getProperty("dinoconfig.api-key");

// DON'T: Hardcode API keys in source code
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_abc123..."); // Never!
```

## API Reference

### ConfigAPI

The ConfigAPI provides methods for retrieving configuration values.

#### Get Entire Configuration

```java
// Full parameters
ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings");

// Path shorthand
ApiResponse<ConfigData> config = configAPI.get("MyBrand.AppSettings");

// With custom options
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)
    .retries(3)
    .build();
ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings", options);
```

#### Get Single Value

```java
// Full parameters
ApiResponse<Object> response = configAPI.getValue("MyBrand", "AppSettings", "theme");

// Path shorthand
ApiResponse<Object> response = configAPI.getValue("MyBrand.AppSettings.theme");

// Type casting
String theme = (String) response.getData();
Boolean enabled = (Boolean) response.getData();
```

#### ConfigData Methods

```java
ConfigData config = configAPI.get("MyBrand", "AppSettings").getData();

// Get all values as a map
Map<String, Object> values = config.getValues();

// Get typed values
String theme = config.getValue("theme", String.class);
Boolean darkMode = config.getValue("darkMode", Boolean.class);
Integer maxUsers = config.getValue("maxUsers", Integer.class);

// Get with default value
String theme = config.getValueOrDefault("theme", "light");

// Check if key exists
if (config.hasKey("featureEnabled")) {
    // ...
}

// Access metadata
String name = config.getName();
int version = config.getVersion();
List<String> keys = config.getKeys();
```

---

### DiscoveryAPI

The DiscoveryAPI provides methods for discovering available configurations.

#### List Brands

```java
DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();

ApiResponse<List<BrandInfo>> response = discoveryAPI.listBrands();
for (BrandInfo brand : response.getData()) {
    System.out.printf("Brand: %s (%d configs)%n",
        brand.getName(), brand.getConfigCount());
}
```

#### List Configurations

```java
ApiResponse<List<ConfigInfo>> response = discoveryAPI.listConfigs("MyBrand");
for (ConfigInfo config : response.getData()) {
    System.out.printf("Config: %s (v%d) - %d keys%n",
        config.getName(), config.getVersion(), config.getKeys().size());
}
```

#### Get Schema

```java
ApiResponse<ConfigSchema> response = discoveryAPI.getSchema("MyBrand", "AppSettings");
ConfigSchema schema = response.getData();

System.out.printf("Config: %s (v%d)%n", schema.getConfigName(), schema.getVersion());

schema.getFields().forEach((name, field) -> {
    System.out.printf("  %s: %s%s%n",
        name, field.getType(), field.isRequired() ? " (required)" : "");
});
```

#### Full Introspection

```java
ApiResponse<IntrospectionResult> response = discoveryAPI.introspect();
IntrospectionResult result = response.getData();

System.out.printf("Company: %s%n", result.getCompany());
System.out.printf("Brands: %d, Configs: %d, Keys: %d%n",
    result.getBrandCount(), result.getTotalConfigCount(), result.getTotalKeyCount());

for (BrandInfoDetail brand : result.getBrands()) {
    System.out.printf("Brand: %s%n", brand.getName());
    for (ConfigInfoDetail config : brand.getConfigs()) {
        System.out.printf("  Config: %s (v%d)%n", config.getName(), config.getVersion());
        for (KeyInfo key : config.getKeys()) {
            System.out.printf("    %s: %s = %s%n",
                key.getName(), key.getType(), key.getValue());
        }
    }
}
```

---

### RequestOptions

Options for customizing individual API requests.

```java
// Builder pattern
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)              // 30 second timeout
    .retries(3)                   // Retry up to 3 times
    .header("X-Request-ID", "unique-id")
    .header("X-Custom-Header", "value")
    .cache(true)                  // Enable caching
    .forceRefresh(false)          // Use cache if available
    .build();

// Static factory methods
RequestOptions options = RequestOptions.withTimeout(30000L);
RequestOptions options = RequestOptions.withRetries(3);
```

| Option | Type | Description |
|--------|------|-------------|
| `headers` | `Map<String, String>` | Custom headers for this request |
| `timeout` | `Long` | Request timeout in milliseconds |
| `retries` | `Integer` | Number of retry attempts |
| `cache` | `Boolean` | Enable/disable caching |
| `forceRefresh` | `Boolean` | Bypass cache and fetch fresh data |

---

### ApiResponse\<T\>

Standard API response wrapper.

```java
ApiResponse<ConfigData> response = configAPI.get("MyBrand", "AppSettings");

if (response.getSuccess()) {
    ConfigData config = response.getData();
    // Process successful response
} else {
    String errorMessage = response.getMessage();
    // Handle error
}

// Check if data is present
if (response.hasData()) {
    // Safe to access response.getData()
}
```

## Error Handling

The SDK throws structured `ApiError` exceptions for API errors.

```java
try {
    DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
    ConfigAPI configAPI = dinoconfig.getConfigAPI();
    
    ApiResponse<Object> response = configAPI.getValue("MyBrand.MyConfig.myKey");
    
    if (response.getSuccess()) {
        System.out.println("Value: " + response.getData());
    }
    
} catch (ApiError e) {
    // Handle API errors by status code
    switch (e.getStatus()) {
        case 401:
            System.err.println("Unauthorized - check your API key");
            break;
        case 403:
            System.err.println("Forbidden - insufficient permissions");
            break;
        case 404:
            System.err.println("Not found - check brand/config/key names");
            break;
        case 429:
            System.err.println("Rate limited - slow down requests");
            break;
        default:
            System.err.println("API Error: " + e.getMessage());
    }
    
    // Helper methods
    if (e.isClientError()) {
        // 4xx error - likely user error
    }
    if (e.isServerError()) {
        // 5xx error - try again later
    }
    if (e.isRetryable()) {
        // Safe to retry this request
    }
    
} catch (IOException e) {
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
import com.dinoconfig.sdk.model.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class ConfigController {
    
    private final ConfigAPI configAPI;
    
    public ConfigController(DinoConfigSDK dinoconfig) {
        this.configAPI = dinoconfig.getConfigAPI();
    }
    
    @GetMapping("/{brand}/{config}")
    public Map<String, Object> getConfig(
            @PathVariable String brand,
            @PathVariable String config) throws Exception {
        
        ApiResponse<ConfigData> response = configAPI.get(brand, config);
        
        if (response.getSuccess()) {
            return response.getData().getValues();
        }
        
        throw new RuntimeException("Failed to get config: " + response.getMessage());
    }
    
    @GetMapping("/{brand}/{config}/{key}")
    public Object getConfigValue(
            @PathVariable String brand,
            @PathVariable String config,
            @PathVariable String key) throws Exception {
        
        ApiResponse<Object> response = configAPI.getValue(brand, config, key);
        
        if (response.getSuccess()) {
            return response.getData();
        }
        
        throw new RuntimeException("Failed to get config value");
    }
}
```

### Feature Flag Service

```java
public class FeatureFlagService {
    
    private final ConfigAPI configAPI;
    
    public FeatureFlagService(DinoConfigSDK dinoconfig) {
        this.configAPI = dinoconfig.getConfigAPI();
    }
    
    public boolean isFeatureEnabled(String featureName) {
        try {
            ApiResponse<Object> response = configAPI.getValue(
                "MyApp.FeatureFlags." + featureName
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
    
    public Map<String, Boolean> getAllFeatureFlags() {
        try {
            ApiResponse<ConfigData> response = configAPI.get("MyApp", "FeatureFlags");
            
            if (response.getSuccess()) {
                Map<String, Boolean> flags = new HashMap<>();
                response.getData().getValues().forEach((key, value) -> {
                    if (value instanceof Boolean) {
                        flags.put(key, (Boolean) value);
                    }
                });
                return flags;
            }
            
            return Collections.emptyMap();
            
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }
}
```

### Configuration Discovery

```java
public class ConfigDiscoveryService {
    
    private final DiscoveryAPI discoveryAPI;
    
    public ConfigDiscoveryService(DinoConfigSDK dinoconfig) {
        this.discoveryAPI = dinoconfig.getDiscoveryAPI();
    }
    
    public void printConfigurationTree() throws IOException {
        ApiResponse<IntrospectionResult> response = discoveryAPI.introspect();
        
        if (!response.getSuccess()) {
            System.err.println("Failed to introspect: " + response.getMessage());
            return;
        }
        
        IntrospectionResult result = response.getData();
        System.out.printf("Company: %s%n", result.getCompany());
        System.out.printf("Generated at: %s%n", result.getGeneratedAt());
        System.out.println();
        
        for (BrandInfoDetail brand : result.getBrands()) {
            System.out.printf("📦 %s%n", brand.getName());
            brand.getDescription().ifPresent(desc ->
                System.out.printf("   %s%n", desc));
            
            for (ConfigInfoDetail config : brand.getConfigs()) {
                System.out.printf("  📄 %s (v%d)%n",
                    config.getName(), config.getVersion());
                
                for (KeyInfo key : config.getKeys()) {
                    System.out.printf("    🔑 %s: %s = %s%n",
                        key.getName(), key.getType(), key.getValue());
                }
            }
        }
    }
}
```

### Robust Config Client with Retries

```java
public class RobustConfigClient {
    
    private final ConfigAPI configAPI;
    
    public RobustConfigClient(DinoConfigSDK dinoconfig) {
        this.configAPI = dinoconfig.getConfigAPI();
    }
    
    public Object getCriticalConfig(String path) throws IOException {
        RequestOptions options = RequestOptions.builder()
            .timeout(30000L)  // 30 second timeout
            .retries(5)       // Retry up to 5 times
            .header("X-Request-ID", java.util.UUID.randomUUID().toString())
            .build();
        
        ApiResponse<Object> response = configAPI.getValue(path, options);
        
        if (response.getSuccess()) {
            return response.getData();
        }
        
        throw new RuntimeException("Failed to get critical config: " + response.getMessage());
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
