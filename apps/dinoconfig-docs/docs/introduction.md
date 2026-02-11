---
sidebar_position: 1
title: Introduction to DinoConfig
description: DinoConfig is a modern configuration management platform. Learn how to integrate type-safe configuration management into your JavaScript and Java applications.
keywords: [dinoconfig, configuration management, SDK, JavaScript, TypeScript, Java, feature flags, remote config, API]
---

# DinoConfig Developer Documentation

Welcome to the **DinoConfig Developer Documentation**. This guide will help you integrate DinoConfig's configuration management capabilities into your applications.

## What is DinoConfig?

DinoConfig is a modern configuration management platform that allows you to:

- **Centralize Configurations** — Manage all your application configurations in one place
- **Real-time Updates** — Get configuration changes instantly without redeploying
- **Type-safe Access** — Full TypeScript and Java type safety
- **Multi-environment Support** — Manage configs across development, staging, and production
- **Secure by Design** — API key authentication with granular permissions

## Available SDKs

<div className="row" style={{marginTop: '1.5rem'}}>
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
      <span className="badge badge--primary">v1.0.0</span>
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

const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key-here',
});

const theme = await dinoconfig.configs.getValue('MyBrand.AppSettings.theme');
console.log(theme.data); // "dark"
```

### Java

```groovy
implementation 'com.dinoconfig:dinoconfig-java-sdk:1.1.0'
```

```java
DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key");

var response = sdk.getConfigAPI().getValue("MyBrand.AppSettings.theme");
System.out.println(response.getData()); // "dark"
```

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Brands** | Top-level organizational units (namespaces) for configurations |
| **Configurations** | Collections of key-value pairs belonging to a brand |
| **Keys** | Individual configuration values (strings, numbers, booleans, objects, arrays) |
| **API Keys** | Authentication tokens prefixed with `dino_` |

## Path Notation

Both SDKs support dot-notation path syntax:

```
Brand.Config          → Get entire configuration
Brand.Config.Key      → Get specific value
```

## Next Steps

- **[JavaScript SDK →](/docs/javascript-sdk/getting-started)** — Guide for JavaScript/TypeScript developers
- **[Java SDK →](/docs/java-sdk/getting-started)** — Guide for Java developers
- **[DinoConfig CLI →](/docs/cli/getting-started)** — Generate TypeScript types and Java models from your schemas
