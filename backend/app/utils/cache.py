"""
Simplified cache using cachetools
"""
from cachetools import TTLCache

# Simple TTL caches - dict-like interface with automatic expiration
# cachetools TTLCache uses dict-style access: cache[key] = value, value = cache.get(key)

stock_data_cache = TTLCache(maxsize=500, ttl=60)     # 1 minute for stock data
history_cache = TTLCache(maxsize=200, ttl=300)       # 5 minutes for historical data
ai_cache = TTLCache(maxsize=100, ttl=600)            # 10 minutes for AI responses
