"""
Middleware package for HalalTrade Pro API
Simple rate limiter for scan endpoint
"""
import time
from collections import defaultdict


class ScanRateLimiter:
    """Simple in-memory rate limiter for scan endpoint"""
    
    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests = defaultdict(list)
    
    def _get_client_ip(self, request) -> str:
        """Extract client IP from request"""
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def check(self, request, endpoint: str = "default") -> bool:
        """Check if request is within rate limit. Returns True if allowed."""
        client_ip = self._get_client_ip(request)
        key = f"{client_ip}:{endpoint}"
        now = time.time()
        
        # Clean old entries
        self._requests[key] = [
            t for t in self._requests[key]
            if now - t < self.window_seconds
        ]
        
        if len(self._requests[key]) >= self.max_requests:
            return False
        
        self._requests[key].append(now)
        return True
    
    def get_retry_after(self, request, endpoint: str = "default") -> int:
        """Get seconds until rate limit resets"""
        client_ip = self._get_client_ip(request)
        key = f"{client_ip}:{endpoint}"
        
        if not self._requests[key]:
            return 0
        
        oldest = min(self._requests[key])
        return max(1, int(self.window_seconds - (time.time() - oldest)))


# Singleton instances used by API routes
scan_rate_limiter = ScanRateLimiter(max_requests=30, window_seconds=60)
ai_rate_limiter = ScanRateLimiter(max_requests=20, window_seconds=60)
