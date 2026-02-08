# DinoConfig Java SDK

[![Maven Central](https://img.shields.io/maven-central/v/com.dinoconfig/dinoconfig-java-sdk.svg)](https://search.maven.org/artifact/com.dinoconfig/dinoconfig-java-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-21+-blue.svg)](https://www.oracle.com/java/)

Official Java SDK for the DinoConfig API. Simple, type-safe configuration management for Java applications.

## Features

- **Simple API** - Methods return values directly, no wrappers needed
- **Type-Safe** - Built-in typed `getValue()` with `Class<T>` parameter
- **Automatic Authentication** - API key to token exchange handled automatically
- **Discovery API** - Explore available brands, configs, and schemas
- **Path-Based Access** - Convenient shorthand like `Brand.Config.Key`
- **Generated Models** - CLI tool generates type-safe model classes
- **Retry Logic** - Built-in exponential backoff for failed requests
- **OkHttp & Jackson** - Battle-tested HTTP and JSON libraries

## Installation

### Gradle

```gradle
dependencies {
    implementation 'com.dinoconfig:dinoconfig-java-sdk:2.0.0'
}
```

### Maven

```xml
<dependency>
    <groupId>com.dinoconfig</groupId>
    <artifactId>dinoconfig-java-sdk</artifactId>
    <version>2.0.0</version>
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
        DinoConfigSDK sdk = DinoConfigSDKFactory.create(
            "dino_your-api-key",
            "https://api.dinoconfig.com"
        );
        
        // Get entire configuration - returns ConfigData directly
        ConfigData config = sdk.getConfigAPI().get("MyBrand", "AppSettings");
        System.out.println("Values: " + config.getValues());
        
        // Get single value with type safety - no casting needed!
        String theme = sdk.getConfigAPI().getValue("MyBrand.AppSettings.theme", String.class);
        System.out.println("Theme: " + theme);
        
        // Get typed config using generated models
        MyConfig typedConfig = sdk.getConfigAPI().getAs("MyBrand.AppSettings", MyConfig.class);
        System.out.println("Max Items: " + typedConfig.getMaxItems());
    }
}
```

## Configuration

```java
// Simple - API key only
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key");

// With custom base URL
DinoConfigSDK sdk = DinoConfigSDKFactory.create(
    "dino_your-api-key",
    "https://api.dinoconfig.com"
);

// With all options
DinoConfigSDK sdk = DinoConfigSDKFactory.create(
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
DinoConfigSDK sdk = DinoConfigSDKFactory.create(config);
```

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `String` | **Yes** | - | Your DinoConfig API key |
| `baseUrl` | `String` | No | `http://localhost:3000` | Base URL for the API |
| `timeout` | `Long` | No | `10000` | Request timeout in milliseconds |

## API Reference

### ConfigAPI

```java
ConfigAPI configAPI = sdk.getConfigAPI();

// Get entire configuration - returns ConfigData directly
ConfigData config = configAPI.get("MyBrand", "AppSettings");
ConfigData config = configAPI.get("MyBrand.AppSettings"); // shorthand

// Get typed configuration - returns your model directly
MyConfig config = configAPI.getAs("MyBrand", "AppSettings", MyConfig.class);
MyConfig config = configAPI.getAs("MyBrand.AppSettings", MyConfig.class); // shorthand

// Get single value with type safety - returns the typed value directly
String theme = configAPI.getValue("MyBrand", "AppSettings", "theme", String.class);
String theme = configAPI.getValue("MyBrand.AppSettings.theme", String.class); // shorthand
Integer count = configAPI.getValue("MyBrand.AppSettings.maxItems", Integer.class);
Boolean flag = configAPI.getValue("MyBrand.FeatureFlags.darkMode", Boolean.class);

// With custom options
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)
    .retries(3)
    .build();
ConfigData config = configAPI.get("MyBrand", "AppSettings", options);
```

### ConfigData

```java
ConfigData data = configAPI.get("MyBrand.AppSettings");

// Get all values
Map<String, Object> values = data.getValues();

// Get typed values from ConfigData
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
DiscoveryAPI discoveryAPI = sdk.getDiscoveryAPI();

// List all brands - returns List<BrandInfo> directly
List<BrandInfo> brands = discoveryAPI.listBrands();

// List configs for a brand - returns List<ConfigInfo> directly
List<ConfigInfo> configs = discoveryAPI.listConfigs("MyBrand");

// Get config schema - returns ConfigSchema directly
ConfigSchema schema = discoveryAPI.getSchema("MyBrand", "AppSettings");

// Full introspection - returns IntrospectionResult directly
IntrospectionResult result = discoveryAPI.introspect();
```

### RequestOptions

```java
RequestOptions options = RequestOptions.builder()
    .timeout(30000L)
    .retries(3)
    .header("X-Request-ID", "unique-id")
    .build();
```

## Error Handling

All methods throw exceptions on errors - no success flag to check:

```java
try {
    String theme = configAPI.getValue("MyBrand.MyConfig.theme", String.class);
    System.out.println("Theme: " + theme);
    
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
        return DinoConfigSDKFactory.create(apiKey, "https://api.dinoconfig.com");
    }
}
```

```java
@RestController
@RequestMapping("/api/config")
public class ConfigController {
    
    private final ConfigAPI configAPI;
    
    public ConfigController(DinoConfigSDK sdk) {
        this.configAPI = sdk.getConfigAPI();
    }
    
    @GetMapping("/{brand}/{config}/{key}")
    public Object getValue(@PathVariable String brand,
                          @PathVariable String config,
                          @PathVariable String key) throws Exception {
        return configAPI.getValue(brand, config, key, Object.class);
    }
}
```

### Feature Flags

```java
public class FeatureFlagService {
    
    private final ConfigAPI configAPI;
    
    public FeatureFlagService(DinoConfigSDK sdk) {
        this.configAPI = sdk.getConfigAPI();
    }
    
    public boolean isEnabled(String feature) {
        try {
            return configAPI.getValue("MyApp.FeatureFlags." + feature, Boolean.class);
        } catch (Exception e) {
            return false;
        }
    }
}
```

## Type-Safe Models

Generate model classes for full type safety:

```bash
npx @dinoconfig/cli javagen \
  --api-key=dino_your-key \
  --output=./src/main/java/com/example/config
```

Then use them:

```java
// Generated model provides full type safety
MyAppSettings settings = configAPI.getAs("MyApp.Settings", MyAppSettings.class);
String theme = settings.getTheme();       // Type-safe!
int maxItems = settings.getMaxItems();    // No casting!
```

## Requirements

- **Java** 21 or higher
- Dependencies (included automatically):
  - OkHttp 4.12.0+
  - Jackson Databind 2.16.1+
  - SLF4J API 2.0.9+

## Support

- **Documentation**: [https://developer.dinoconfig.com/docs/java-sdk](https://developer.dinoconfig.com/docs/java-sdk)
- **Issues**: [GitHub Issues](https://github.com/Dino-Config/dinoconfig/issues)
- **Email**: support@dinoconfig.com

## License

MIT License - see [LICENSE](LICENSE) for details.
