# DinoConfig Java SDK Demo

This demo project showcases how to use the DinoConfig Java SDK in your application.

## Overview

This demo application demonstrates:
- How to initialize the DinoConfig SDK
- How to retrieve configuration values using the SDK
- How to handle responses and errors

## Project Structure

```
apps/dinoconfig-java-sdk-demo/
├── app/
│   ├── src/
│   │   ├── main/java/org/example/
│   │   │   └── App.java          # Main demo application
│   │   └── test/java/org/example/
│   │       └── AppTest.java       # Unit tests
│   └── build.gradle              # Build configuration
└── settings.gradle               # Project settings
```

## Building the Project

### Using Gradle

```bash
cd apps/dinoconfig-java-sdk-demo
./gradlew build
```

### Using Nx

```bash
nx build dinoconfig-java-sdk-demo
```

## Running the Demo

```bash
# With default base URL
./gradlew run --args="your-api-key-here"

# With custom base URL
./gradlew run --args="your-api-key-here https://api.dinoconfig.com"
```

Or directly:
```bash
java -jar app/build/libs/app.jar your-api-key-here
```

## Usage Examples

### Basic Setup

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.api.DiscoveryAPI;
import com.dinoconfig.sdk.model.*;

// Initialize SDK (simplest way)
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key-here");

// With custom base URL
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key", "https://api.dinoconfig.com");

// With all options
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key", "https://api.dinoconfig.com", 15000L);
```

### Config API - Getting Entire Configurations

```java
ConfigAPI configAPI = sdk.getConfigAPI();

// Get entire configuration
ApiResponse<ConfigData> response = configAPI.get("MyBrand", "AppSettings");
if (response.getSuccess()) {
    ConfigData config = response.getData();
    System.out.printf("Config: %s (v%d)%n", config.getName(), config.getVersion());
    
    // Get all values as a map
    Map<String, Object> values = config.getValues();
    
    // Get typed values
    String theme = config.getValue("theme", String.class);
    Boolean darkMode = config.getValue("darkMode", Boolean.class);
    Integer maxUsers = config.getValue("maxUsers", Integer.class);
}
```

### Config API - Getting Single Values

```java
// Get a single configuration value
ApiResponse<Object> response = configAPI.getValue("MyBrand", "AppSettings", "theme");
if (response.getSuccess()) {
    String theme = (String) response.getData();
    System.out.println("Theme: " + theme);
}

// Using path-based shorthand
ApiResponse<Object> value = configAPI.getValue("MyBrand.AppSettings.theme");
if (value.getSuccess()) {
    String theme = (String) value.getData();
}
```

### Discovery API - Exploring Configurations

```java
DiscoveryAPI discoveryAPI = sdk.getDiscoveryAPI();

// List all brands
ApiResponse<List<BrandInfo>> brandsResponse = discoveryAPI.listBrands();
if (brandsResponse.getSuccess()) {
    for (BrandInfo brand : brandsResponse.getData()) {
        System.out.printf("Brand: %s (%d configs)%n", 
            brand.getName(), brand.getConfigCount());
    }
}

// List configs for a brand
ApiResponse<List<ConfigInfo>> configsResponse = discoveryAPI.listConfigs("MyBrand");
if (configsResponse.getSuccess()) {
    for (ConfigInfo config : configsResponse.getData()) {
        System.out.printf("Config: %s (v%d)%n", 
            config.getName(), config.getVersion());
    }
}

// Full introspection
ApiResponse<IntrospectionResult> introspection = discoveryAPI.introspect();
if (introspection.getSuccess()) {
    IntrospectionResult result = introspection.getData();
    System.out.printf("Company: %s%n", result.getCompany());
    System.out.printf("Total brands: %d%n", result.getBrandCount());
    System.out.printf("Total configs: %d%n", result.getTotalConfigCount());
    System.out.printf("Total keys: %d%n", result.getTotalKeyCount());
}
```

### Request Options

```java
RequestOptions options = new RequestOptions();
options.setTimeout(30000L);  // 30 second timeout
options.setRetries(3);       // Retry up to 3 times

ApiResponse<ConfigData> response = configAPI.get("MyBrand", "AppSettings", options);
```

## Demo Features

The demo application showcases:

1. **SDK Initialization** - Multiple factory methods for creating SDK instances
2. **Discovery API** - Exploring available brands, configs, and schemas
3. **Config Retrieval** - Getting entire configurations with typed access
4. **Value Retrieval** - Getting single configuration values
5. **Path Shorthand** - Using dot-separated paths for convenience (e.g., "Brand.Config.key")
6. **Request Options** - Customizing timeouts and retries
7. **Error Handling** - Proper response checking and error handling patterns
8. **Introspection** - Full introspection capabilities for code generation

## API Methods Available

### Config API

- `get(brandName, configName)` - Get entire configuration
- `get(brandName, configName, options)` - Get entire configuration with custom options
- `get(path)` - Get entire configuration using path shorthand ("Brand.Config")
- `getValue(brandName, configName, keyName)` - Get single configuration value
- `getValue(brandName, configName, keyName, options)` - Get single value with custom options
- `getValue(path)` - Get single value using path shorthand ("Brand.Config.key")

### Discovery API

- `listBrands()` - List all accessible brands
- `listBrands(options)` - List brands with custom options
- `listConfigs(brandName)` - List all configs for a brand
- `listConfigs(brandName, options)` - List configs with custom options
- `getSchema(brandName, configName)` - Get schema for a configuration
- `introspect()` - Full introspection of all brands, configs, and keys

## Testing

Run the unit tests:

```bash
./gradlew test
```

Or using Nx:

```bash
nx test dinoconfig-java-sdk-demo
```

## Dependencies

This demo project depends on:
- The DinoConfig Java SDK (referenced as a local project)
- OkHttp 4.12.0 (for HTTP communication)
- Jackson 2.16.1 (for JSON processing)
- JUnit 5.12.1 (for testing)

## See Also

- [DinoConfig Java SDK README](../../libs/dinoconfig-java-sdk/README.md)
- [DinoConfig JavaScript SDK](../dinoconfig-js-sdk/README.md)
