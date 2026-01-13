/**
 * @fileoverview In-memory cache implementation (L1 - Hot cache).
 * Fast, synchronous cache stored in memory with TTL support.
 * @module @dinoconfig/dinoconfig-js-sdk/cache/memory-cache
 */

import { CacheEntry, CacheOptions } from './cache.types';

/**
 * In-memory cache implementation.
 * Provides fast, synchronous access to cached values.
 * 
 * @class MemoryCache
 * @example
 * ```typescript
 * const cache = new MemoryCache({ ttl: 60000, maxSize: 1000 });
 * 
 * await cache.set('key', 'value');
 * const value = await cache.get('key'); // 'value'
 * ```
 */
export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;

  constructor(
    private ttl: number,
    private maxSize: number
  ) {}

  /**
   * Get a value from the cache.
   * 
   * @param {string} key - Cache key
   * @returns {T | null} Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Set a value in the cache.
   * 
   * @param {string} key - Cache key
   * @param {T} value - Value to cache
   * @param {CacheOptions} options - Optional cache options
   */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl ?? this.ttl;
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  /**
   * Delete a value from the cache.
   * 
   * @param {string} key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Invalidate entries matching a pattern.
   * 
   * @param {string} pattern - Regex pattern to match keys
   */
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check if an entry exists and is not expired.
   * 
   * @param {string} key - Cache key
   * @returns {boolean} True if entry exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics.
   * 
   * @returns {CacheStats} Cache statistics
   */
  getStats(): { hits: number; misses: number; size: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Check if an entry is expired.
   * 
   * @private
   * @param {CacheEntry} entry - Cache entry
   * @returns {boolean} True if expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evict the oldest entry from the cache.
   * Uses LRU-like strategy based on expiration time.
   * 
   * @private
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestExpiry = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < oldestExpiry) {
        oldestExpiry = entry.expiresAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
