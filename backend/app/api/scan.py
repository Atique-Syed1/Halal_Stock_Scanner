"""
Scan Router - Stock scanning endpoints
"""
from fastapi import APIRouter, Request, HTTPException, status

from ..services.stock_service import scan_stocks, cached_stock_data
from ..middleware import scan_rate_limiter

router = APIRouter(prefix="/api", tags=["scan"])


@router.get("/scan")
def scan_market(request: Request):
    """
    Scan all stocks in active list for trading signals.
    Rate limited to 30 requests per minute per IP.
    """
    # Check specific rate limit for scan endpoint
    if not scan_rate_limiter.check(request, "scan_market"):
        retry_after = scan_rate_limiter.get_retry_after(request, "scan_market")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "rate_limit_exceeded",
                "message": "Scan rate limit exceeded. Please wait before scanning again.",
                "retry_after": retry_after
            },
            headers={"Retry-After": str(retry_after)}
        )
    
    results = scan_stocks()
    return results


@router.get("/stock/{symbol}")
def get_stock(symbol: str):
    """Get cached data for a specific stock"""
    if symbol in cached_stock_data:
        return cached_stock_data[symbol]
    return {"error": f"Stock {symbol} not found. Run a scan first."}
