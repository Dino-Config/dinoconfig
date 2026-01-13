/**
 * @fileoverview Multi-layer cache manager.
 * Coordinates between memory cache (L1) and storage cache (L2).
 * @module @dinoconfig/dinoconfig-js-sdk/cache/cache-manager
 */

import { CacheConfig, CacheEntry, CacheOptions, CacheStats } from './cache.types';
import { MemoryCache } from './memory-cache';
import { StorageCache } from './storage-cache';

/**
 * Multi-layer cache manager.
 * Provides a unified interface for caching with L1 (memory) and L2 (storage) layers.
 * 
 * @class CacheManager
 * @example
 * ```typescript
 * const cache = new CacheManager({
 *   enabled: true,
 *   ttl: 60000,
 *   maxSize: 1000,
 *   storage: 'localStorage',
 * });
 * 
 * // Get with automatic fallback through layers
 * const value = await cache.get('key');
 * 
 * // Set (writes to both layers)
 * await cache.set('key', 'value');
 * 
 * // Invalidate
 * cache.invalidate('brand:.*');
 * ```
 */
export class CacheManager {
  private memoryCache: MemoryCache;
  private storageCache?: StorageCache;

  constructor(private config: CacheConfig) {
    if (!config.enabled) {
      // Create disabled cache instances
      this.memoryCache = new MemoryCache(0, 0);
      return;
    }

    // L1: Memory cache (always enabled when caching is enabled)
    this.memoryCache = new MemoryCache(
      config.ttl,
      config.maxSize
    );

    // L2: Storage cache (optional)
    if (config.storage && config.storage !== 'memory') {
      try {
        this.storageCache = new StorageCache(config.storage);
      } catch (e) {
        // Storage not available, continue without L2 cache
        this.storageCache = undefined;
      }
    }
  }

  /**
   * Get a value from cache.
   * Checks L1 (memory) first, then L2 (storage) if available.
   * 
   * @param {string} key - Cache key
   * @returns {Promise<T | null>} Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      return null;
    }

    // L1: Memory cache (synchronous)
    const memValue = this.memoryCache.get<T>(key);
    if (memValue !== null) {
      return memValue;
    }

    // L2: Storage cache (async)
    if (this.storageCache) {
      const storageValue = await this.storageCache.get<T>(key);
      if (storageValue !== null) {
        // Promote to L1
        this.memoryCache.set(key, storageValue);
        return storageValue;
      }
    }

    return null;
  }

  /**
   * Set a value in cache.
   * Writes to both L1 (memory) and L2 (storage) if available.
   * 
   * @param {string} key - Cache key
   * @param {T} value - Value to cache
   * @param {CacheOptions} options - Optional cache options
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // L1: Memory cache
    this.memoryCache.set(key, value, options);

    // L2: Storage cache
    if (this.storageCache) {
      await this.storageCache.set(key, value, options);
    }
  }

  /**
   * Delete a value from cache.
   * Removes from both L1 and L2.
   * 
   * @param {string} key - Cache key
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.storageCache) {
      await this.storageCache.delete(key);
    }
  }

  /**
   * Clear all cache entries.
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.storageCache) {
      await this.storageCache.clear();
    }
  }

  /**
   * Invalidate entries matching a pattern.
   * 
   * @param {string} pattern - Regex pattern to match keys
   */
  async invalidate(pattern?: string): Promise<void> {
    if (!pattern) {
      await this.clear();
      return;
    }

    this.memoryCache.invalidate(pattern);
    if (this.storageCache) {
      await this.storageCache.invalidate(pattern);
    }
  }

  /**
   * Check if a key exists in cache.
   * 
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is not expired
   */
  has(key: string): boolean {
    if (!this.config.enabled) {
      return false;
    }
    return this.memoryCache.has(key);
  }

  /**
   * Get cache statistics.
   * 
   * @returns {CacheStats} Cache statistics
   */
  getStats(): CacheStats {
    return this.memoryCache.getStats();
  }

  /**
   * Prefetch a value into cache.
   * This is a convenience method for warming the cache.
   * 
   * @param {string} key - Cache key
   * @param {() => Promise<T>} fetcher - Function to fetch the value if not cached
   */
  async prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value);
    return value;
  }
}
