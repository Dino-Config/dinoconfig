# DinoConfig Java SDK

Official Java SDK for the DinoConfig API. This SDK provides a simple and intuitive way to retrieve configuration values from the DinoConfig configuration management system.

## Installation

Add the following dependency to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.dinoconfig:dinoconfig-java-sdk:1.0.0'
}
```

Or if using Maven, add to your `pom.xml`:

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
import com.dinoconfig.sdk.model.*;

// Initialize the SDK with your API key
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key-here");

// Get the ConfigAPI instance
ConfigAPI configAPI = dinoconfig.getConfigAPI();

// Get a specific configuration value
ApiResponse<Object> response = configAPI.getConfigValue("mybrand", "myconfig", "mykey", new RequestOptions());

if (response.getSuccess()) {
    Object value = response.getData();
    System.out.println("Config value: " + value);
}
```

**Note:** The SDK automatically handles:
- API key to token exchange
- Token refresh when expired
- Company information extraction

## Configuration Options

The SDK can be configured using the `DinoConfigSDKConfig` class or factory methods:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `String` | ✅ | - | Your API key for authentication |
| `baseUrl` | `String` | ❌ | `"http://localhost:3000"` | Base URL for the DinoConfig API |
| `timeout` | `Long` | ❌ | `10000` | Request timeout in milliseconds |

## Authentication

The DinoConfig SDK uses API key-based authentication. API keys provide:
- **Automatic token management** - No manual token refresh needed
- **Better security** - Keys can be easily revoked from the dashboard
- **Simplified setup** - Company information is auto-detected

### Getting an API Key

1. Log in to your DinoConfig dashboard
2. Go to **Settings** → **SDK & API Keys**
3. Click **Create New Key**
4. Give it a name and description
5. Copy the key immediately (you won't be able to see it again!)

### Using the API Key

```java
import com.dinoconfig.sdk.DinoConfigSDKFactory;

// Simple initialization with just API key
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_abc123...");

// Or with custom base URL
DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
    "dino_abc123...", 
    "https://api.dinoconfig.com"
);

// Or with full configuration
DinoConfigSDKConfig config = new DinoConfigSDKConfig();
config.setApiKey("dino_abc123...");
config.setBaseUrl("https://api.dinoconfig.com");
config.setTimeout(15000L);

DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
```

**What happens behind the scenes:**
1. SDK exchanges your API key for an access token
2. Token is stored in memory and used for all requests
3. Token is automatically refreshed before expiration
4. Company information is extracted from your account

## API Methods

### Configuration Value Retrieval

#### `getConfigValue(brandName, configName, configValueKey, options)`
Get a specific configuration value by brand name, configuration name, and configuration value key.

**Parameters:**
- `brandName` (String) - The name of the brand
- `configName` (String) - The name of the configuration
- `configValueKey` (String) - The key of the configuration value to retrieve
- `options` (RequestOptions) - Optional request configuration (timeout, headers, etc.)

**Returns:**
- `ApiResponse<Object>` - API response containing the configuration value

**Example:**
```java
ConfigAPI configAPI = dinoconfig.getConfigAPI();

// Get configuration value with default options
ApiResponse<Object> response = configAPI.getConfigValue("mybrand", "myconfig", "mykey", new RequestOptions());

if (response.getSuccess()) {
    Object value = response.getData();
    System.out.println("Config value: " + value);
}
```

**Example with custom options:**
```java
RequestOptions options = new RequestOptions();
options.setTimeout(5000L);
Map<String, String> headers = Map.of("X-Custom-Header", "custom-value");
options.setHeaders(headers);

ApiResponse<Object> response = configAPI.getConfigValue("mybrand", "myconfig", "mykey", options);
```

## Data Types

### ApiResponse
```java
public class ApiResponse<T> {
    private T data;
    private Boolean success;
    private String message;
    
    // Getters and setters...
}
```

### RequestOptions
```java
public class RequestOptions {
    private Long timeout;
    private Integer retries;
    private Map<String, String> headers;
    
    // Getters and setters...
}
```

## Error Handling

The SDK throws structured errors with the following format:

```java
public class ApiError extends RuntimeException {
    private String message;
    private Integer status;
    private String code;
    
    // Getters and setters...
}
```

Example error handling:

```java
try {
    ConfigAPI configAPI = dinoconfig.getConfigAPI();
    ApiResponse<Object> response = configAPI.getConfigValue("mybrand", "myconfig", "mykey", new RequestOptions());
    
    if (response.getSuccess()) {
        Object value = response.getData();
        // Process config value
        System.out.println("Config value: " + value);
    } else {
        System.out.println("Request failed: " + response.getMessage());
    }
} catch (ApiError e) {
    if (e.getStatus() == 404) {
        System.out.println("Configuration value not found");
    } else if (e.getStatus() == 401) {
        System.out.println("Unauthorized - check your API key");
    } else {
        System.out.println("Unexpected error: " + e.getMessage());
    }
} catch (IOException e) {
    System.out.println("Network error: " + e.getMessage());
}
```

## Advanced Usage

### Custom Request Options

```java
ConfigAPI configAPI = dinoconfig.getConfigAPI();

// Use custom options for specific requests
RequestOptions options = new RequestOptions();
options.setTimeout(5000L);
options.setRetries(2);
Map<String, String> headers = Map.of("X-Custom-Request-Header", "request-specific-value");
options.setHeaders(headers);

ApiResponse<Object> response = configAPI.getConfigValue("mybrand", "myconfig", "mykey", options);

if (response.getSuccess()) {
    Object value = response.getData();
    // Process value with custom headers
}
```

## Development

### Building

```bash
cd libs/dinoconfig-java-sdk
./gradlew build
```

### Testing

```bash
cd libs/dinoconfig-java-sdk
./gradlew test
```

### Running from Nx

```bash
nx build dinoconfig-java-sdk
nx test dinoconfig-java-sdk
```

## Requirements

- Java 21 or higher
- OkHttp 4.12.0 or higher
- Jackson 2.16.1 or higher

## License

MIT
