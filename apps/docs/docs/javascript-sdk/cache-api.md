---
sidebar_position: 5
title: Cache API
description: Optimize performance with the DinoConfig JavaScript SDK's multi-layer caching system.
---

# Cache API

The DinoConfig JavaScript SDK includes a sophisticated multi-layer caching system to minimize API calls and improve performance. The Cache API provides direct control over cached data.

## Overview

Access the Cache API through your initialized SDK instance:

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: '...',
  cache: {
    enabled: true,
    ttl: 60000,
  },
});

const cacheApi = dinoconfig.cache;
```

## Enabling Caching

Caching is disabled by default. Enable it in your configuration:

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  cache: {
    enabled: true,           // Enable caching
    ttl: 60000,             // 1 minute TTL
    maxSize: 1000,          // Max 1000 entries
    storage: 'localStorage', // Persist to localStorage
    staleWhileRevalidate: true,
  },
});
```

## Cache Architecture

The SDK uses a two-layer cache:

```
┌─────────────────────────────────────────┐
│              Application                │
└─────────────────┬───────────────────────┘
                  │
          ┌───────▼───────┐
          │   L1 Cache    │  ← In-memory (fastest)
          │   (Memory)    │
          └───────┬───────┘
                  │ miss
          ┌───────▼───────┐
          │   L2 Cache    │  ← Persistent storage
          │ (Storage API) │
          └───────┬───────┘
                  │ miss
          ┌───────▼───────┐
          │  DinoConfig   │  ← API call
          │     API       │
          └───────────────┘
```

## Methods

### `get()` — Get Cached Value

Retrieves a value from the cache by key.

```typescript
get<T>(key: string): Promise<T | null>
```

#### Example

```typescript
const cachedValue = await dinoconfig.cache.get<string>('config:MyBrand:Settings');

if (cachedValue) {
  console.log('Cache hit:', cachedValue);
} else {
  console.log('Cache miss');
}
```

---

### `set()` — Set Cache Value

Manually stores a value in the cache.

```typescript
set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void>
```

#### Example

```typescript
// Cache with default TTL
await dinoconfig.cache.set('my-key', { data: 'value' });

// Cache with custom TTL (30 seconds)
await dinoconfig.cache.set('short-lived', 'data', { ttl: 30000 });
```

---

### `delete()` — Delete Cached Value

Removes a specific entry from the cache.

```typescript
delete(key: string): Promise<void>
```

#### Example

```typescript
await dinoconfig.cache.delete('config:MyBrand:Settings');
```

---

### `clear()` — Clear All Cache

Removes all entries from the cache.

```typescript
clear(): Promise<void>
```

#### Example

```typescript
// Clear everything
await dinoconfig.cache.clear();
console.log('Cache cleared');
```

---

### `invalidate()` — Invalidate by Pattern

Removes all cache entries matching a regex pattern.

```typescript
invalidate(pattern?: string): Promise<void>
```

#### Example

```typescript
// Invalidate all entries for a specific brand
await dinoconfig.cache.invalidate('config:MyBrand:.*');

// Invalidate all config entries
await dinoconfig.cache.invalidate('config:.*');

// Invalidate everything (same as clear)
await dinoconfig.cache.invalidate();
```

---

### `prefetch()` — Prefetch Data

Fetches data and stores it in cache if not already present.

```typescript
prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<T>
```

#### Example

```typescript
// Prefetch configuration data
const config = await dinoconfig.cache.prefetch(
  'config:MyBrand:Settings',
  async () => {
    const response = await dinoconfig.configs.get('MyBrand.Settings');
    return response.data;
  }
);
```

---

### `getStats()` — Get Cache Statistics

Returns statistics about cache performance.

```typescript
getStats(): CacheStats

interface CacheStats {
  hits: number;     // Number of cache hits
  misses: number;   // Number of cache misses
  size: number;     // Current number of entries
  hitRate: number;  // Hit rate (0-1)
}
```

#### Example

```typescript
const stats = dinoconfig.cache.getStats();

console.log('Cache Statistics:');
console.log(`  Hits: ${stats.hits}`);
console.log(`  Misses: ${stats.misses}`);
console.log(`  Size: ${stats.size} entries`);
console.log(`  Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
```

**Output:**
```
Cache Statistics:
  Hits: 142
  Misses: 23
  Size: 45 entries
  Hit Rate: 86.1%
```

## Cache Keys

The SDK uses a consistent key format for cached configurations:

| Type | Key Format | Example |
|------|------------|---------|
| Full config | `config:brand:config` | `config:MyBrand:Settings` |
| Single value | `config:brand:config:key` | `config:MyBrand:Settings:theme` |

## Configuration Options

### Storage Backends

#### Memory (Default)

```typescript
cache: {
  enabled: true,
  storage: 'memory',
}
```

- ✅ Fastest access
- ✅ No storage limits
- ❌ Lost on page refresh
- ❌ Not shared across tabs

#### localStorage

```typescript
cache: {
  enabled: true,
  storage: 'localStorage',
}
```

- ✅ Persists across sessions
- ✅ Shared across tabs
- ❌ 5MB limit
- ❌ Synchronous API

#### IndexedDB

```typescript
cache: {
  enabled: true,
  storage: 'indexedDB',
}
```

- ✅ Large storage capacity
- ✅ Persists across sessions
- ✅ Async API
- ❌ More complex

### Stale-While-Revalidate

Enable returning stale data while refreshing in the background:

```typescript
cache: {
  enabled: true,
  staleWhileRevalidate: true,
}
```

This pattern:
1. Returns cached data immediately (even if expired)
2. Fetches fresh data in the background
3. Updates the cache with fresh data

```typescript
// First call - returns cached data, refreshes in background
const config1 = await dinoconfig.configs.get('Brand.Config');

// Second call (after background refresh) - returns fresh data
const config2 = await dinoconfig.configs.get('Brand.Config');
```

## Bypass Caching

### Per-Request

```typescript
// Skip cache for this request
const fresh = await dinoconfig.configs.get('Brand.Config', {
  forceRefresh: true,
});

// Disable caching entirely for this request
const uncached = await dinoconfig.configs.get('Brand.Config', {
  cache: false,
});
```

### Globally

```typescript
// Initialize without cache
const dinoconfig = await dinoconfigApi({
  apiKey: '...',
  cache: {
    enabled: false,
  },
});
```

## Use Cases

### Warming the Cache

Prefetch configurations on app startup:

```typescript
async function warmCache() {
  const configs = [
    'MyBrand.Settings',
    'MyBrand.Features',
    'MyBrand.Limits',
  ];

  await Promise.all(
    configs.map(path =>
      dinoconfig.configs.get(path, { cache: true })
    )
  );

  console.log('Cache warmed with', configs.length, 'configurations');
}

// Call on app initialization
await warmCache();
```

### Periodic Cache Refresh

Keep cache fresh in long-running applications:

```typescript
function startCacheRefresh(intervalMs: number = 300000) {
  setInterval(async () => {
    console.log('Refreshing cache...');
    
    // Get all cached configs and refresh them
    const brands = await dinoconfig.discovery.listBrands();
    
    for (const brand of brands.data) {
      const configs = await dinoconfig.discovery.listConfigs(brand.name);
      
      for (const config of configs.data) {
        await dinoconfig.configs.get(`${brand.name}.${config.name}`, {
          forceRefresh: true,
        });
      }
    }
    
    console.log('Cache refresh complete');
  }, intervalMs);
}

// Refresh every 5 minutes
startCacheRefresh(300000);
```

### Monitoring Cache Health

```typescript
function monitorCache() {
  setInterval(() => {
    const stats = dinoconfig.cache.getStats();
    
    if (stats.hitRate < 0.5) {
      console.warn('Low cache hit rate:', stats.hitRate);
    }
    
    if (stats.size > 900) {
      console.warn('Cache nearly full:', stats.size);
    }
  }, 60000);
}
```

### Invalidation on Events

```typescript
// Invalidate cache when user logs out
function onLogout() {
  dinoconfig.cache.clear();
}

// Invalidate specific brand when permissions change
function onPermissionChange(brandName: string) {
  dinoconfig.cache.invalidate(`config:${brandName}:.*`);
}

// Invalidate on version change
async function checkVersion() {
  const config = await dinoconfig.configs.get('MyBrand.Settings', {
    forceRefresh: true,
  });
  
  if (config.data.version !== currentVersion) {
    await dinoconfig.cache.invalidate('config:MyBrand:.*');
    currentVersion = config.data.version;
  }
}
```

## Best Practices

### 1. Choose the Right Storage

| Use Case | Recommended Storage |
|----------|---------------------|
| Server-side (Node.js) | `memory` |
| Single-page app | `localStorage` |
| Large data sets | `indexedDB` |
| Short sessions | `memory` |

### 2. Set Appropriate TTLs

```typescript
cache: {
  // Frequently changing data
  ttl: 30000,  // 30 seconds
  
  // Stable configuration
  ttl: 300000, // 5 minutes
  
  // Near-static data
  ttl: 3600000, // 1 hour
}
```

### 3. Monitor Cache Performance

```typescript
// Log stats periodically
setInterval(() => {
  const stats = dinoconfig.cache.getStats();
  console.log(`Cache: ${stats.hitRate * 100}% hit rate, ${stats.size} entries`);
}, 60000);
```

### 4. Use Stale-While-Revalidate for UX

```typescript
// Great for UI responsiveness
cache: {
  enabled: true,
  staleWhileRevalidate: true,
}
```

## Next Steps

- **[TypeScript →](typescript)** — Generate type-safe configurations
- **[Examples →](examples)** — Real-world usage patterns
