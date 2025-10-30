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

## Usage Example

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.model.*;

// Initialize SDK
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key-here");

// Get API instance
ConfigAPI api = sdk.getConfigAPI();

// Get a specific configuration value
ApiResponse<Object> response = api.getConfigValue("mybrand", "myconfig", "mykey", new RequestOptions());

if (response.getSuccess()) {
    Object value = response.getData();
    System.out.println("Config value: " + value);
}
```

## Demo Features

The demo application includes:

1. **SDK Initialization** - Shows how to create and configure the SDK
2. **Configuration Value Retrieval** - Demonstrates how to retrieve configuration values
3. **Request Options** - Shows how to customize request behavior
4. **Error Handling** - Demonstrates proper error handling patterns

## API Methods Available

- `getConfigValue(brandName, configName, configValueKey, options)` - Get a specific configuration value by brand name, config name, and config value key

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
