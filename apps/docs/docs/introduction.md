---
sidebar_position: 1
title: Introduction
description: Welcome to the DinoConfig Developer Documentation. Learn how to integrate powerful configuration management into your applications.
---

# DinoConfig Developer Documentation

Welcome to the **DinoConfig Developer Documentation**. This guide will help you integrate DinoConfig's powerful configuration management capabilities into your applications using our official SDKs.

## What is DinoConfig?

DinoConfig is a modern configuration management platform that allows you to:

- **Centralize Configurations** — Manage all your application configurations in one place
- **Real-time Updates** — Get configuration changes instantly without redeploying
- **Type-safe Access** — Full TypeScript and Java type safety for your configurations
- **Multi-environment Support** — Easily manage configs across development, staging, and production
- **Secure by Design** — API key authentication with granular permissions

## Available SDKs

<div className="row" style={{marginTop: '2rem'}}>
  <div className="col col--6">
    <a href="/docs/javascript-sdk/getting-started" className="sdk-card">
      <div className="sdk-card__logo">📦</div>
      <h3 className="sdk-card__title">JavaScript SDK</h3>
      <div className="sdk-card__description">Full-featured SDK for Node.js and browser environments with TypeScript support, caching, and async/await API.</div>
      <span className="badge badge--primary">v1.0.0</span>
    </a>
  </div>
  <div className="col col--6">
    <a href="/docs/java-sdk/getting-started" className="sdk-card">
      <div className="sdk-card__logo">☕</div>
      <h3 className="sdk-card__title">Java SDK</h3>
      <div className="sdk-card__description">Enterprise-ready SDK for Java 21+ applications with OkHttp, Jackson integration, and thread-safe design.</div>
      <span className="badge badge--primary">v1.1.0</span>
    </a>
  </div>
</div>

## Quick Start

### JavaScript / TypeScript

```bash
npm install @dinoconfig/dinoconfig-js-sdk
```

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

// Initialize the SDK
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key-here',
  baseUrl: 'https://api.dinoconfig.com',
});

// Get a configuration value
const theme = await dinoconfig.configs.getValue('MyBrand.AppSettings.theme');
console.log(theme.data); // "dark"
```

### Java

```groovy
implementation 'com.dinoconfig:dinoconfig-java-sdk:1.1.0'
```

```java
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;

// Initialize the SDK
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key");

// Get a configuration value
var response = sdk.getConfigAPI().getValue("MyBrand.AppSettings.theme");
System.out.println(response.getData()); // "dark"
```

## Core Concepts

### Brands

Brands are top-level organizational units for your configurations. Think of them as namespaces or projects that group related configurations together.

### Configurations

Configurations are collections of key-value pairs. Each configuration belongs to a brand and contains multiple settings that your application can consume.

### Keys

Keys are individual configuration values within a configuration. They can be of various types: strings, numbers, booleans, objects, or arrays.

### API Keys

API keys authenticate your SDK requests. Keys are prefixed with `dino_` and should be kept secure. Each key can have different permissions based on your needs.

## Path Notation

Both SDKs support a convenient dot-notation path syntax:

| Path | Description |
|------|-------------|
| `Brand.Config` | Access entire configuration |
| `Brand.Config.Key` | Access specific key value |

**Examples:**
```
MyBrand.AppSettings          → Get all settings in AppSettings config
MyBrand.AppSettings.theme    → Get just the 'theme' value
MyBrand.FeatureFlags.darkMode → Get the 'darkMode' feature flag
```

## Features Comparison

| Feature | JavaScript SDK | Java SDK |
|---------|----------------|----------|
| Async/Await | ✅ | ❌ (Sync) |
| TypeScript Support | ✅ Native | N/A |
| Caching | ✅ Multi-layer | ⚠️ Manual |
| Generated Types | ✅ CLI tool | ✅ CLI tool |
| Thread Safety | N/A | ✅ |
| Connection Pooling | ✅ Fetch | ✅ OkHttp |
| Retry Logic | ✅ Exponential | ✅ Exponential |

## Next Steps

- **[JavaScript SDK →](/docs/javascript-sdk/getting-started)** — Complete guide for JavaScript/TypeScript developers
- **[Java SDK →](/docs/java-sdk/getting-started)** — Complete guide for Java developers

## Support

If you encounter any issues or have questions:

- 📧 Email: support@dinoconfig.com
- 💬 GitHub Issues: [github.com/dinoconfig/dinoconfig](https://github.com/dinoconfig/dinoconfig)
- 📖 API Reference: [api.dinoconfig.com/docs](https://api.dinoconfig.com/docs)
