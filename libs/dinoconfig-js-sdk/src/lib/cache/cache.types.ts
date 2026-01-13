/**
 * @fileoverview Type definitions for the cache layer.
 * @module @dinoconfig/dinoconfig-js-sdk/cache/types
 */

/**
 * Configuration options for the cache layer.
 * 
 * @interface CacheConfig
 * @example
 * ```typescript
 * const cacheConfig: CacheConfig = {
 *   enabled: true,
 *   ttl: 60000,           // 1 minute
 *   maxSize: 1000,
 *   storage: 'localStorage',
 *   staleWhileRevalidate: true,
 * };
 * ```
 */
export interface CacheConfig {
  /**
   * Whether caching is enabled.
   * @default false
   */
  enabled: boolean;

  /**
   * Time-to-live in milliseconds.
   * How long cached entries remain valid.
   * @default 60000 (1 minute)
   */
  ttl: number;

  /**
   * Maximum number of entries in memory cache.
   * @default 1000
   */
  maxSize: number;

  /**
   * Storage backend for L2 cache.
   * - 'memory': Only use in-memory cache (L1)
   * - 'localStorage': Use localStorage for persistent cache (L2)
   * - 'indexedDB': Use IndexedDB for persistent cache (L2)
   * @default undefined (memory only)
   */
  storage?: 'memory' | 'localStorage' | 'indexedDB';

  /**
   * Whether to return stale data while fetching fresh data in background.
   * @default false
   */
  staleWhileRevalidate?: boolean;
}

/**
 * A cached entry with metadata.
 * 
 * @interface CacheEntry
 * @typeParam T - The type of the cached value
 */
export interface CacheEntry<T = any> {
  /**
   * The cached value.
   */
  value: T;

  /**
   * Timestamp when the entry was created.
   */
  timestamp: number;

  /**
   * Timestamp when the entry expires.
   */
  expiresAt: number;

  /**
   * Optional version number for cache invalidation.
   */
  version?: number;
}

/**
 * Options for cache operations.
 */
export interface CacheOptions {
  /**
   * Custom TTL for this specific operation.
   * Overrides the default TTL from cache configuration.
   */
  ttl?: number;
}

/**
 * Cache statistics.
 */
export interface CacheStats {
  /**
   * Number of cache hits.
   */
  hits: number;

  /**
   * Number of cache misses.
   */
  misses: number;

  /**
   * Number of entries currently in cache.
   */
  size: number;

  /**
   * Cache hit rate (0-1).
   */
  hitRate: number;
}
