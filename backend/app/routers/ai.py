from fastapi import APIRouter, Request, HTTPException, status
from ..services import ai_service
from ..middleware import ai_rate_limiter

router = APIRouter(
    prefix="/api/ai",
    tags=["ai"]
)

@router.get("/analyze/{symbol}")
async def analyze_stock(symbol: str, request: Request):
    """
    AI-powered stock analysis.
    Rate limited to 10 requests per minute per IP.
    """
    # Check specific rate limit for AI endpoint
    if not ai_rate_limiter.check(request, "ai_analyze"):
        retry_after = ai_rate_limiter.get_retry_after(request, "ai_analyze")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "rate_limit_exceeded",
                "message": "AI analysis rate limit exceeded. Please wait before trying again.",
                "retry_after": retry_after
            },
            headers={"Retry-After": str(retry_after)}
        )
    
    return await ai_service.analyze_stock(symbol)
