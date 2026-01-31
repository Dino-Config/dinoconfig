# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of the DinoConfig CLI
- **`codegen` command** - Generate TypeScript type definitions from DinoConfig schemas
  - Automatic brand/config/key type generation
  - Configurable namespace and output path
  - Full type safety with generated interfaces
- **`javagen` command** - Generate Java model classes from DinoConfig schemas
  - POJO class generation with proper types
  - Lombok annotations support
  - Package and output directory configuration
- **Programmatic API** - Use CLI functionality in build scripts
  - `generateTypes()` function for TypeScript generation
  - `generateJavaModels()` function for Java generation
- CLI entry points:
  - `dinoconfig` - Main CLI with subcommands
  - `dinoconfig-codegen` - Direct TypeScript generation
  - `dinoconfig-javagen` - Direct Java generation
- Full TypeScript support
- Zero external runtime dependencies (uses `@dinoconfig/js-sdk`)

### Documentation
- Comprehensive README with usage examples
- CI/CD integration guide
- SDK usage examples with generated types
