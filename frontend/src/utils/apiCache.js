/**
 * API Cache Utility
 * Simple in-memory cache with TTL support
 */

class APICache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 60000; // 1 minute default
    }

    /**
     * Generate a cache key from URL and params
     */
    generateKey(url, params = {}) {
        const paramString = Object.keys(params)
            .sort()
            .map(k => `${k}=${params[k]}`)
            .join('&');
        return `${url}?${paramString}`;
    }

    /**
     * Get cached data if valid
     */
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Set cache data with TTL
     */
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl,
            timestamp: Date.now()
        });
    }

    /**
     * Invalidate specific cache key
     */
    invalidate(key) {
        this.cache.delete(key);
    }

    /**
     * Invalidate all cache entries matching a pattern
     */
    invalidatePattern(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getStats() {
        let validCount = 0;
        let expiredCount = 0;
        const now = Date.now();

        for (const [, value] of this.cache) {
            if (now <= value.expiry) {
                validCount++;
            } else {
                expiredCount++;
            }
        }

        return {
            total: this.cache.size,
            valid: validCount,
            expired: expiredCount
        };
    }
}

// Singleton instance
const apiCache = new APICache();

// Cache TTL presets (in milliseconds)
export const CACHE_TTL = {
    SHORT: 30000,      // 30 seconds - for frequently changing data
    MEDIUM: 60000,     // 1 minute - default
    LONG: 300000,      // 5 minutes - for stable data
    VERY_LONG: 900000, // 15 minutes - for rarely changing data
};

/**
 * Cached fetch wrapper
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options plus cache options
 * @returns {Promise} - The fetch response data
 */
export async function cachedFetch(url, options = {}) {
    const { 
        ttl = CACHE_TTL.MEDIUM, 
        forceRefresh = false,
        cacheKey = null,
        ...fetchOptions 
    } = options;

    const key = cacheKey || url;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
        const cached = apiCache.get(key);
        if (cached) {
            return { data: cached, fromCache: true };
        }
    }

    // Fetch from network
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the response
    apiCache.set(key, data, ttl);

    return { data, fromCache: false };
}

/**
 * Hook for cached API calls with SWR-like behavior
 */
export function useCachedFetch(url, options = {}) {
    const { ttl = CACHE_TTL.MEDIUM } = options;
    const key = url;
    
    // Check if we have cached data
    const cachedData = apiCache.get(key);
    
    return {
        getCached: () => apiCache.get(key),
        invalidate: () => apiCache.invalidate(key),
        fetch: async (forceRefresh = false) => {
            return cachedFetch(url, { ttl, forceRefresh });
        }
    };
}

// Export the cache instance for direct access
export { apiCache };
export default apiCache;
