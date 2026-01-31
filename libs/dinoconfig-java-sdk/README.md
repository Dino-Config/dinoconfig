# DinoConfig Java SDK

[![Maven Central](https://img.shields.io/maven-central/v/com.dinoconfig/dinoconfig-java-sdk.svg)](https://search.maven.org/artifact/com.dinoconfig/dinoconfig-java-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-21+-blue.svg)](https://www.oracle.com/java/)

ix java sdk readmeOfficial Java SDK for the DinoConfig API. Simple, type-safe configuration management for Java applications.

## Features

- **Simple Factory Pattern** - Single factory method for easy SDK instantiation
- **Automatic Authentication** - API key to token exchange handled automatically
- **Type-Safe** - Full Java generics support with proper typing
- **Discovery API** - Explore available brands, configs, and schemas
- **Path-Based Access** - Convenient shorthand like `Brand.Config.Key`
- **Builder Pattern** - Fluent API for configuration
- **Retry Logic** - Built-in exponential backoff for failed requests
- **OkHttp & Jackson** - Battle-tested HTTP and JSON libraries

## Installation

### Gradle

```gradle
dependencies {
    implementation 'com.dinoconfig:dinoconfig-java-sdk:1.0.0'
}
```

### Maven

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
import com.dinoconfig.sdk.model.*;

public class QuickStart {
    public static void main(String[] args) throws Exception {
        // Initialize the SDK
        DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
        
        // Get entire configuration
        ApiResponse<ConfigData> config = dinoconfig.getConfigAPI()
            .get("MyBrand", "AppSettings");
        System.out.println("Values: " + config.getData().getValues());
        
        // Get single value using path shorthand
        ApiResponse<Object> response = dinoconfig.getConfigAPI()
            .getValue("MyBrand.AppSettings.theme");
        System.out.println("Theme: " + response.getData());
        
        // Get typed values
        String theme = config.getData().getValue("theme", String.class);
        Boolean darkMode = config.getData().getValue("darkMode", Boolean.class);
    }
}
```

## Configuration

```java
// Simple - API key only
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");

// With custom base URL
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com"
);

// With all options
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com",
    15000L  // 15 second timeout
);

// Or using builder
DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
    .apiKey("dino_your-api-key")
    .baseUrl("https://api.dinoconfig.com")
    .timeout(15000L)
    .build();
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
```

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `String` | **Yes** | - | Your DinoConfig API key |
| `baseUrl` | `String` | No | `http://localhost:3000` | Base URL for the API |
| `timeout` | `Long` | No | `10000` | Request timeout in milliseconds |

## API Reference

### ConfigAPI

```java
ConfigAPI configAPI = dinoconfig.getConfigAPI();

// Get entire configuration
ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings");
ApiResponse<ConfigData> config = configAPI.get("MyBrand.AppSettings"); // shorthand

// Get single value
ApiResponse<Object> value = configAPI.getValue("MyBrand", "AppSettings", "theme");
ApiResponse<Object> value = configAPI.getValue("MyBrand.AppSettings.theme"); // shorthand

// With custom options
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)
    .retries(3)
    .build();
ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings", options);
```

### ConfigData

```java
ConfigData data = config.getData();

// Get all values
Map<String, Object> values = data.getValues();

// Get typed values
String theme = data.getValue("theme", String.class);
Boolean enabled = data.getValue("enabled", Boolean.class);
Integer count = data.getValue("count", Integer.class);

// Get with default
String theme = data.getValueOrDefault("theme", "light");

// Metadata
String name = data.getName();
int version = data.getVersion();
List<String> keys = data.getKeys();
```

### DiscoveryAPI

```java
DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();

// List all brands
ApiResponse<List<BrandInfo>> brands = discoveryAPI.listBrands();

// List configs for a brand
ApiResponse<List<ConfigInfo>> configs = discoveryAPI.listConfigs("MyBrand");

// Get config schema
ApiResponse<ConfigSchema> schema = discoveryAPI.getSchema("MyBrand", "AppSettings");

// Full introspection
ApiResponse<IntrospectionResult> result = discoveryAPI.introspect();
```

### RequestOptions

```java
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)
    .retries(3)
    .header("X-Request-ID", "unique-id")
    .cache(true)
    .forceRefresh(false)
    .build();
```

## Error Handling

```java
try {
    ApiResponse<Object> response = configAPI.getValue("MyBrand.MyConfig.myKey");
    
    if (response.getSuccess()) {
        System.out.println("Value: " + response.getData());
    }
    
} catch (ApiError e) {
    switch (e.getStatus()) {
        case 401 -> System.err.println("Unauthorized - check API key");
        case 403 -> System.err.println("Forbidden - insufficient permissions");
        case 404 -> System.err.println("Not found - check brand/config/key");
        case 429 -> System.err.println("Rate limited - slow down");
        default -> System.err.println("Error: " + e.getMessage());
    }
} catch (IOException e) {
    System.err.println("Network error: " + e.getMessage());
}
```

## Examples

### Spring Boot Integration

```java
@Configuration
public class DinoConfigConfiguration {
    
    @Value("${dinoconfig.api-key}")
    private String apiKey;
    
    @Bean
    public DinoConfigSDK dinoConfigSDK() throws Exception {
        return DinoConfigSDKFactory.create(apiKey);
    }
}
```

```java
@RestController
@RequestMapping("/api/config")
public class ConfigController {
    
    private final ConfigAPI configAPI;
    
    public ConfigController(DinoConfigSDK dinoconfig) {
        this.configAPI = dinoconfig.getConfigAPI();
    }
    
    @GetMapping("/{brand}/{config}/{key}")
    public Object getValue(@PathVariable String brand,
                          @PathVariable String config,
                          @PathVariable String key) throws Exception {
        return configAPI.getValue(brand, config, key).getData();
    }
}
```

### Feature Flags

```java
public class FeatureFlagService {
    
    private final ConfigAPI configAPI;
    
    public FeatureFlagService(DinoConfigSDK dinoconfig) {
        this.configAPI = dinoconfig.getConfigAPI();
    }
    
    public boolean isEnabled(String feature) {
        try {
            ApiResponse<Object> response = configAPI.getValue("MyApp.FeatureFlags." + feature);
            return response.getSuccess() && Boolean.TRUE.equals(response.getData());
        } catch (Exception e) {
            return false;
        }
    }
}
```

## Requirements

- **Java** 21 or higher
- Dependencies (included automatically):
  - OkHttp 4.12.0+
  - Jackson Databind 2.16.1+
  - SLF4J API 2.0.9+

## Support

- **Documentation**: [https://dinoconfig.com/docs](https://dinoconfig.com/docs)
- **Issues**: [GitHub Issues](https://github.com/dinoconfig/dinoconfig/issues)
- **Email**: support@dinoconfig.com

## License

MIT License - see [LICENSE](LICENSE) for details.
