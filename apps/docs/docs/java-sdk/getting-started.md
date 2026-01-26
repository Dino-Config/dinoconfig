---
sidebar_position: 1
title: Getting Started with Java SDK
description: Learn how to install and initialize the DinoConfig Java SDK in your project. Complete guide for Java 21+ with Maven and Gradle setup.
keywords: [java sdk, maven, gradle, spring boot, configuration management, dinoconfig, installation, setup]
---

# Getting Started with Java SDK

The DinoConfig Java SDK provides a robust, thread-safe way to access your configurations from any Java application.

## Prerequisites

- Java 21 or higher
- Maven or Gradle build tool
- A DinoConfig API key (get one from [dinoconfig.com](https://dinoconfig.com))

## Installation

### Gradle

Add the dependency to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.dinoconfig:dinoconfig-java-sdk:1.1.0'
}
```

### Maven

Add the dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>com.dinoconfig</groupId>
    <artifactId>dinoconfig-java-sdk</artifactId>
    <version>1.1.0</version>
</dependency>
```

## Quick Start

### 1. Create and Initialize the SDK

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;

// Simple initialization
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key-here");
```

### 2. Fetch Configuration Values

```java
// Get a single value using path notation
var response = sdk.getConfigAPI().getValue("MyBrand.AppSettings.theme");
System.out.println(response.getData()); // "dark"

// Get an entire configuration
var config = sdk.getConfigAPI().get("MyBrand.AppSettings");
System.out.println(config.getData().getValues()); // {theme=dark, maxItems=100, ...}
```

### 3. Explore Available Configurations

```java
// List all brands you have access to
var brands = sdk.getDiscoveryAPI().listBrands();
brands.getData().forEach(brand -> {
    System.out.println(brand.getName() + ": " + brand.getConfigCount() + " configurations");
});

// List configurations for a brand
var configs = sdk.getDiscoveryAPI().listConfigs("MyBrand");
configs.getData().forEach(config -> {
    System.out.println(config.getName() + " - " + config.getKeys());
});
```

## Basic Example

Here's a complete example of using the SDK:

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.model.ApiResponse;
import com.dinoconfig.sdk.model.ConfigData;

public class App {
    public static void main(String[] args) {
        // Initialize the SDK
        DinoConfigSDK sdk = DinoConfigSDKFactory.create(
            System.getenv("DINOCONFIG_API_KEY"),
            "https://api.dinoconfig.com"
        );

        try {
            // Get application settings
            ApiResponse<ConfigData> settings = sdk.getConfigAPI().get("MyApp.Settings");
            
            if (settings.getSuccess()) {
                ConfigData data = settings.getData();
                System.out.println("App Name: " + data.getValue("appName"));
                System.out.println("Max Users: " + data.getValue("maxUsers", Integer.class));
                System.out.println("Version: " + data.getVersion());
            }

            // Get a specific feature flag
            var darkMode = sdk.getConfigAPI().getValue("MyApp.FeatureFlags.darkModeEnabled");
            
            if (Boolean.TRUE.equals(darkMode.getData())) {
                System.out.println("Dark mode is enabled!");
            }
        } catch (Exception e) {
            System.err.println("Error fetching config: " + e.getMessage());
        }
    }
}
```

## Environment Variables

We recommend storing your API key in environment variables:

```bash
export DINOCONFIG_API_KEY=dino_your-api-key-here
export DINOCONFIG_BASE_URL=https://api.dinoconfig.com
```

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create(
    System.getenv("DINOCONFIG_API_KEY"),
    System.getenv("DINOCONFIG_BASE_URL")
);
```

:::warning Security Note
Never commit your API keys to version control. Always use environment variables or a secrets manager in production.
:::

## SDK Structure

The SDK provides two main APIs through the initialized instance:

| API | Description |
|-----|-------------|
| `ConfigAPI` | Retrieve configuration values |
| `DiscoveryAPI` | Explore brands, configs, and schemas |

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_...");

// Access the APIs
ConfigAPI configApi = sdk.getConfigAPI();
DiscoveryAPI discoveryApi = sdk.getDiscoveryAPI();
```

## Factory Methods

The `DinoConfigSDKFactory` provides multiple creation methods:

```java
// API key only (uses default base URL)
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_key");

// API key with custom base URL
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_key", "https://api.dinoconfig.com");

// API key, base URL, and timeout
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_key", "https://api.dinoconfig.com", 15000L);

// Using configuration object (most flexible)
DinoConfigSDKConfig config = DinoConfigSDKConfig.builder()
    .apiKey("dino_key")
    .baseUrl("https://api.dinoconfig.com")
    .timeout(15000L)
    .build();
DinoConfigSDK sdk = DinoConfigSDKFactory.create(config);
```

## Thread Safety

The SDK is designed to be thread-safe after initialization:

```java
// Create once at application startup
public class Application {
    private static final DinoConfigSDK SDK = DinoConfigSDKFactory.create(
        System.getenv("DINOCONFIG_API_KEY")
    );
    
    public static DinoConfigSDK getSdk() {
        return SDK;
    }
}

// Safe to use from multiple threads
ExecutorService executor = Executors.newFixedThreadPool(10);
for (int i = 0; i < 100; i++) {
    executor.submit(() -> {
        var config = Application.getSdk().getConfigAPI().get("Brand.Config");
        // Process config...
    });
}
```

## What's Next?

- **[Configuration Options →](configuration)** — Customize SDK behavior
- **[Configs API →](configs-api)** — Fetch configurations and values
- **[Discovery API →](discovery-api)** — Explore available configurations
- **[Typed Configs →](typed-configs)** — Generate type-safe models
- **[Examples →](examples)** — Real-world usage patterns
