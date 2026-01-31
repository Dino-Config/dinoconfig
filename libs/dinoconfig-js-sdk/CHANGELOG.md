# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of the DinoConfig JavaScript SDK
- `dinoconfigApi()` factory function for SDK initialization
- **Configs API** - Retrieve entire configurations or individual values
  - `configs.get(path)` / `configs.get(brand, config)` - Get full config
  - `configs.getValue(path)` / `configs.getValue(brand, config, key)` - Get single value
  - Shorthand dot notation path syntax (`"Brand.Config.Key"`)
- **Discovery API** - Explore available configurations dynamically
  - `discovery.listBrands()` - List all accessible brands
  - `discovery.listConfigs(brand)` - List configs for a brand
  - `discovery.getSchema(brand, config)` - Get configuration schema
  - `discovery.introspect()` - Full introspection of all brands and configs
- **Multi-layer caching system**
  - L1 in-memory cache for fast access
  - L2 persistent storage cache (localStorage)
  - Cache management API (`cache.clear()`, `cache.invalidate()`, `cache.prefetch()`, `cache.getStats()`)
  - Configurable TTL and cache size
- **HTTP Client features**
  - Automatic API key to token exchange
  - Exponential backoff retry logic
  - Configurable request timeouts
  - Custom headers support
- Full TypeScript support with comprehensive type definitions
- Zero runtime dependencies (uses native `fetch`)
- ESM module format

### Security
- Secure token exchange mechanism
- Authorization header management
