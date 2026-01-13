/**
 * @fileoverview Storage cache implementation (L2 - Warm cache).
 * Persistent cache using localStorage or IndexedDB.
 * @module @dinoconfig/dinoconfig-js-sdk/cache/storage-cache
 */

import { CacheEntry, CacheOptions } from './cache.types';

/**
 * Storage adapter interface for different storage backends.
 */
interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * localStorage adapter.
 */
class LocalStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor() {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available in this environment');
    }
    this.storage = window.localStorage;
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (e) {
      // Handle quota exceeded errors silently
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (e) {
      // Ignore errors
    }
  }

  clear(): void {
    try {
      // Only clear our prefix
      const keys = Object.keys(this.storage);
      for (const key of keys) {
        if (key.startsWith('dinoconfig:')) {
          this.storage.removeItem(key);
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }
}

/**
 * Storage cache implementation.
 * Provides persistent caching using browser storage APIs.
 * 
 * @class StorageCache
 * @example
 * ```typescript
 * const cache = new StorageCache('localStorage');
 * 
 * await cache.set('key', 'value');
 * const value = await cache.get('key'); // 'value'
 * ```
 */
export class StorageCache {
  private adapter: StorageAdapter;
  private prefix = 'dinoconfig:';

  constructor(storageType: 'localStorage' | 'indexedDB') {
    if (storageType === 'localStorage') {
      this.adapter = new LocalStorageAdapter();
    } else {
      // IndexedDB support can be added later if needed
      // For now, fallback to localStorage
      throw new Error('IndexedDB storage is not yet implemented');
    }
  }

  /**
   * Get a value from storage cache.
   * 
   * @param {string} key - Cache key
   * @returns {Promise<T | null>} Cached value or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = this.adapter.getItem(this.prefix + key);
      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);

      if (this.isExpired(entry)) {
        this.adapter.removeItem(this.prefix + key);
        return null;
      }

      return entry.value;
    } catch (e) {
      // Handle JSON parse errors or storage errors
      return null;
    }
  }

  /**
   * Set a value in storage cache.
   * 
   * @param {string} key - Cache key
   * @param {T} value - Value to cache
   * @param {CacheOptions} options - Optional cache options
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl ?? 300000; // Default 5 minutes for storage
      const entry: CacheEntry<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      this.adapter.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (e) {
      // Handle quota exceeded or other storage errors silently
    }
  }

  /**
   * Delete a value from storage cache.
   * 
   * @param {string} key - Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      this.adapter.removeItem(this.prefix + key);
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Clear all entries from storage cache.
   */
  async clear(): Promise<void> {
    try {
      this.adapter.clear();
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Invalidate entries matching a pattern.
   * 
   * @param {string} pattern - Regex pattern to match keys
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern);
      const adapter = this.adapter as LocalStorageAdapter;
      const storage = (adapter as any).storage as Storage;

      if (!storage) {
        return;
      }

      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const cacheKey = key.substring(this.prefix.length);
          if (regex.test(cacheKey)) {
            keys.push(key);
          }
        }
      }

      for (const key of keys) {
        this.adapter.removeItem(key);
      }
    } catch (e) {
      // Ignore errors
    }
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
}
