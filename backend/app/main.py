"""
HalalTrade Pro - Backend API
Main entry point for FastAPI application (Simplified for MVP)
"""
import asyncio
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .core.config import API_HOST, API_PORT, CORS_ORIGINS
from .services.stock_service import load_csv_stocks
from .api import scan, stocks, backtest, telegram, portfolio, alerts, news, ai, watchlist, dashboard, market, ipo, analytics, auth
from .core.database import create_db_and_tables

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Track application start time
start_time = time.time()

# Rate Limiter (slowapi - simple & battle-tested)
limiter = Limiter(key_func=get_remote_address)


# ====================================================================
# WEBSOCKET CONNECTION MANAGER
# ====================================================================
from .services.websocket_manager import manager


# ====================================================================
# BACKGROUND PRICE UPDATER
# ====================================================================
from .services.background_tasks import price_updater


# ====================================================================
# APP LIFECYCLE
# ====================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 60)
    print("🕌 HalalTrade Pro API Starting...")
    print("=" * 60)
    
    try:
        create_db_and_tables()
        load_csv_stocks()
        updater_task = asyncio.create_task(price_updater())
        
        print(f"✅ Server ready at http://{API_HOST}:{API_PORT}")
        print("=" * 60)
        
        yield
    except Exception as e:
        print(f"❌ CRITICAL ERROR DURING STARTUP: {e}")
        import traceback
        traceback.print_exc()
        raise e
    finally:
        if 'updater_task' in locals() and not updater_task.done():
            updater_task.cancel()
        
    print("\n👋 HalalTrade Pro API Shutting down...")


# ====================================================================
# CREATE APP
# ====================================================================
app = FastAPI(
    title="HalalTrade Pro API",
    description="Shariah-compliant stock scanner with technical analysis",
    version="2.1.0",
    lifespan=lifespan
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Simple Request Logging (replaces 121-line performance_service.py)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    
    status_emoji = "✅" if response.status_code < 400 else "❌"
    logger.info(f"{status_emoji} {request.method} {request.url.path} - {response.status_code} - {duration:.0f}ms")
    
    response.headers["X-Response-Time"] = f"{duration:.0f}ms"
    return response

# Include Routers
app.include_router(auth.router)
app.include_router(scan.router)
app.include_router(stocks.router)
app.include_router(backtest.router)
app.include_router(telegram.router)
app.include_router(portfolio.router)
app.include_router(alerts.router)
app.include_router(news.router)
app.include_router(ai.router)
app.include_router(watchlist.router)
app.include_router(dashboard.router)
app.include_router(market.router)
app.include_router(ipo.router)
app.include_router(analytics.router)


# ====================================================================
# HEALTH & ROOT ENDPOINTS
# ====================================================================
@app.get("/")
def root():
    return {
        "app": "HalalTrade Pro API",
        "version": "2.1.0",
        "status": "running"
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    from datetime import datetime
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.1.0",
        "uptime_seconds": int(time.time() - start_time),
        "websocket_connections": len(manager.active_connections)
    }


# ====================================================================
# WEBSOCKET ENDPOINT
# ====================================================================
@app.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


# ====================================================================
# RUN SERVER
# ====================================================================
if __name__ == "__main__":
    import uvicorn
    import sys
    try:
        print(f"🚀 Starting server on {API_HOST}:{API_PORT}...")
        uvicorn.run(app, host=API_HOST, port=API_PORT, log_level="info")
    except Exception as e:
        print(f"❌ FAILED TO START SERVER: {e}")
        sys.exit(1)
