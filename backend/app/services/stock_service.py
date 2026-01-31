"""
Stock Service - Stock data fetching and processing
"""
import logging
import random
import pandas as pd
import yfinance as yf
import numpy as np
from typing import Optional, List, Dict

from ..config import (
    MAX_DEBT_RATIO, MAX_CASH_RATIO, DEFAULT_STOCKS,
    CSV_FILE, WS_BATCH_SIZE
)
from ..utils.indicators import (
    calculate_rsi, calculate_sma, calculate_ema, calculate_macd,
    calculate_bollinger_bands, calculate_volume_ma, generate_rsi_signal,
    generate_macd_signal, generate_bollinger_signal, generate_ma_signal, calculate_composite_score,
    calculate_stop_loss, calculate_take_profit, calculate_potential_gain
)
from ..utils.cache import stock_data_cache, history_cache
from .data_provider.factory import current_provider

logger = logging.getLogger(__name__)

# In-memory state
active_stock_list = {
    "name": "Default Watchlist",
    "symbols": DEFAULT_STOCKS.copy(),
    "source": "default"
}
stock_metadata = {}
cached_stock_data = {}
live_prices = {} # New: global cache for live prices



def load_csv_stocks() -> bool:
    """Load stocks from CSV file on startup"""
    global active_stock_list, stock_metadata
    from ..utils.csv_helper import parse_stock_csv
    
    if not CSV_FILE.exists():
        logger.warning(f"CSV file not found: {CSV_FILE}")
        return False
    
    try:
        stock_data_list = parse_stock_csv(str(CSV_FILE))
        
        symbols = []
        for item in stock_data_list:
            symbols.append(item['symbol'])
            
            # Store metadata
            stock_metadata[item['clean_symbol']] = {
                'name': item['name'],
                'sector': item['sector']
            }
        
        if symbols:
            active_stock_list = {
                "name": CSV_FILE.stem,
                "symbols": symbols,
                "source": "csv"
            }
            logger.info(f"Loaded {len(symbols)} stocks from {CSV_FILE.name}")
            return True
            
    except Exception as e:
        logger.error(f"Error loading CSV: {e}")
    
    return False


def get_shariah_status(symbol: str) -> dict:
    """
    Generate Shariah compliance check (mock data)
    In production, this would use actual financial data
    """
    random.seed(hash(symbol))
    debt_ratio = round(random.uniform(10, 50), 1)
    cash_ratio = round(random.uniform(5, 40), 1)
    
    is_halal = debt_ratio < MAX_DEBT_RATIO and cash_ratio < MAX_CASH_RATIO
    
    return {
        "status": "Halal" if is_halal else "Non-Halal",
        "debtRatio": debt_ratio,
        "cashRatio": cash_ratio,
        "passed": is_halal
    }


def get_stock_history(symbol: str, period: str = "1y") -> list:
    """
    Fetch historical data for charts with appropriate intervals
    1d -> 5m interval
    5d -> 15m interval
    1mo -> 1h interval
    others -> 1d interval
    """
    # Check cache first
    cache_key = f"{symbol}:{period}"
    cached_data = history_cache.get(cache_key)
    if cached_data is not None:
        logger.debug(f"Cache hit: History for {symbol} ({period})")
        return cached_data
    
    try:
        # Map frontend period codes to yfinance codes
        period_map = {
            "1m": "1mo",
            "3m": "3mo",
            "6m": "6mo"
        }
        yf_period = period_map.get(period, period)
        
        # Determine interval based on reasonable defaults
        interval = "1d"
        if yf_period == "1d":
            interval = "5m"
        elif yf_period == "5d":
            interval = "15m"
        elif yf_period == "1mo":
             interval = "1h" 
        elif yf_period == "3mo":
            interval = "1d"
            
        logger.debug(f"Fetching history for {symbol}: Period={yf_period}, Interval={interval}")
        
        # Use Data Provider
        history = current_provider.get_history(symbol, period=yf_period, interval=interval)
        
        if history.empty:
            logger.warning(f"No history found for {symbol}")
            return []
            
        # Format for frontend and sanitize NaNs
        formatted_data = []
        for date, row in history.iterrows():
            formatted_data.append({
                "date": date.isoformat(),
                "open": item_value(row['Open']),
                "high": item_value(row['High']),
                "low": item_value(row['Low']),
                "close": item_value(row['Close']),
                "volume": int(item_value(row['Volume']))
            })
        
        # Cache the result
        history_cache[cache_key] = formatted_data
        logger.debug(f"Cached history for {symbol} ({period})")
        
        return formatted_data
        
    except Exception as e:
        logger.error(f"Error fetching history for {symbol}: {e}")
        return []

def item_value(val):
    """Helper to handle numpy/pandas types safely"""
    if pd.isna(val): return 0
    return float(val)


def get_full_stock_data(symbol: str) -> Optional[dict]:
    """Get complete stock data with technicals and Shariah status"""
    try:
        # Fetch enough history for 200 SMA
        hist = current_provider.get_history(symbol, period="1y")
        if hist.empty or len(hist) < 50: # Need at least 50 points for basic analysis
            return None
        
        current_price = float(hist['Close'].iloc[-1])
        
        # Calculate Indicators
        closes = hist['Close']
        volumes = hist['Volume']
        
        # 1. RSI
        rsi_series = calculate_rsi(closes)
        rsi = item_value(rsi_series.iloc[-1]) if len(rsi_series) > 0 else 50
        
        # 2. Moving Averages
        sma20 = item_value(calculate_sma(closes, 20).iloc[-1])
        sma50 = item_value(calculate_sma(closes, 50).iloc[-1])
        sma200 = item_value(calculate_sma(closes, 200).iloc[-1])
        
        # 3. MACD
        macd_line, signal_line, histogram = calculate_macd(closes)
        macd_val = item_value(macd_line.iloc[-1])
        signal_val = item_value(signal_line.iloc[-1])
        hist_val = item_value(histogram.iloc[-1])
        
        # 4. Bollinger Bands
        bb_mid, bb_upper, bb_lower = calculate_bollinger_bands(closes)
        bb_up_val = item_value(bb_upper.iloc[-1])
        bb_low_val = item_value(bb_lower.iloc[-1])
        
        # 5. Volume
        vol_ma = item_value(calculate_volume_ma(volumes).iloc[-1])
        current_vol = item_value(volumes.iloc[-1])
        
        # Get Shariah status
        shariah = get_shariah_status(symbol)
        
        # --- Advanced Signal Generation ---
        
        # 1. RSI Signal
        rsi_signal = generate_rsi_signal(current_price, rsi, sma50)
        
        # 2. MACD Signal (Need previous values for crossover check)
        prev_macd = item_value(macd_line.iloc[-2]) if len(macd_line) > 1 else None
        prev_signal_line = item_value(signal_line.iloc[-2]) if len(signal_line) > 1 else None
        macd_signal = generate_macd_signal(macd_val, signal_val, prev_macd, prev_signal_line)
        
        # 3. Bollinger Band Signal
        bb_signal = generate_bollinger_signal(current_price, bb_low_val, bb_up_val)
        
        # 4. MA Signal (Golden Cross / Death Cross context)
        ma_signal = generate_ma_signal(sma50, sma200)
        
        # 5. Composite Score
        signals_map = {
            'rsi': rsi_signal,
            'macd': macd_signal,
            'bb': bb_signal,
            'ma': ma_signal
        }
        composite = calculate_composite_score(signals_map)
        
        # Final Decision (Respect Shariah compliance)
        final_signal = composite['label'] if shariah["passed"] else "N/A"
        final_score = composite['score'] if shariah["passed"] else 0
        
        # Risk Management
        sl = calculate_stop_loss(current_price, rsi)
        tp = calculate_take_profit(current_price, rsi)
        gain = calculate_potential_gain(current_price, tp)
        
        # Price history for sparkline (last 20 points)
        price_history = [
            round(float(p), 2)
            for p in closes.tail(20).values
        ]
        
        # Get metadata
        clean_symbol = symbol.replace('.NS', '')
        meta = stock_metadata.get(clean_symbol, {})
        
        return {
            "symbol": clean_symbol,
            "name": meta.get('name', clean_symbol),
            "sector": meta.get('sector', 'Unknown'),
            "price": round(current_price, 2),
            "shariahStatus": shariah["status"],
            "shariah": {
                "debtRatio": shariah["debtRatio"],
                "cashRatio": shariah["cashRatio"]
            },
            "technicals": {
                "rsi": round(rsi, 1),
                "signal": rsi_signal, # Legacy field for table compatibility
                "label": final_signal, # New Composite Label
                "score": final_score, # New Composite Score
                "signals": signals_map, # Detailed breakdown
                "sl": sl if final_signal in ['Buy', 'Strong Buy'] else None,
                "tp": tp if final_signal in ['Buy', 'Strong Buy'] else None,
                "gain": gain if final_signal in ['Buy', 'Strong Buy'] else None,
                "signalStrength": final_score # Mapped to new score
            },
            "analysis": { # FULL ANALYSIS DATA FOR AI
                "sma20": round(sma20, 2),
                "sma50": round(sma50, 2),
                "sma200": round(sma200, 2),
                "macd": round(macd_val, 2),
                "macd_signal": round(signal_val, 2),
                "macd_hist": round(hist_val, 2),
                "bb_upper": round(bb_up_val, 2),
                "bb_lower": round(bb_low_val, 2),
                "volume": current_vol,
                "volume_ma": round(vol_ma, 0)
            },
            "priceHistory": price_history
        }
        
    except Exception as e:
        logger.error(f"Error processing stock {symbol}: {e}")
        return None


def scan_stocks() -> list:
    """Scan all stocks in active list"""
    global cached_stock_data
    
    symbols = active_stock_list["symbols"]
    logger.info(f"Scanning {len(symbols)} stocks from {active_stock_list['name']}")
    
    results = []
    
    # We can batch fetch prices first if provider supports it, but for full technicals we need history
    # For now, we iterate (refactor later to async)
    
    for symbol in symbols:
        try:
            stock_data = get_full_stock_data(symbol)
            if stock_data:
                results.append(stock_data)
                cached_stock_data[stock_data["symbol"]] = stock_data
        except Exception as e:
            logger.error(f"Error processing stock {symbol}: {e}")
            continue
    
    return results


async def fetch_live_prices(custom_symbols: list = None) -> dict:
    """Fetch live prices for all active stocks or custom list"""
    global live_prices
    import asyncio
    
    input_symbols = custom_symbols if custom_symbols is not None else active_stock_list["symbols"]
    prices = {}
    
    # Batch processing
    for i in range(0, len(input_symbols), WS_BATCH_SIZE):
        batch = input_symbols[i:i + WS_BATCH_SIZE]
        try:
            # Use Data Provider for batch fetch
            batch_prices = current_provider.get_batch_prices(batch)
            
            # Normalize keys (remove .NS if needed for frontend)
            for sym, price in batch_prices.items():
                clean = sym.replace('.NS', '')
                prices[clean] = price
                live_prices[clean] = price
                
        except Exception as e:
            logger.error(f\"Batch price fetch error: {e}\")
        
        # Small delay between batches
        if i + WS_BATCH_SIZE < len(input_symbols):
            await asyncio.sleep(0.5)
    
    return prices



def get_stock_list_info() -> dict:
    """Get current active stock list info"""
    return {
        "name": active_stock_list["name"],
        "count": len(active_stock_list["symbols"]),
        "source": active_stock_list["source"],
        "symbols": [s.replace(".NS", "") for s in active_stock_list["symbols"]]
    }


def set_stock_list(name: str, symbols: list, source: str = "custom"):
    """Set active stock list"""
    global active_stock_list
    formatted = [s if s.endswith('.NS') else f"{s}.NS" for s in symbols]
    active_stock_list = {
        "name": name,
        "symbols": formatted,
        "source": source
    }


def reset_stock_list():
    """Reset to default stock list"""
    global active_stock_list
    active_stock_list = {
        "name": "Default Watchlist",
        "symbols": DEFAULT_STOCKS.copy(),
        "source": "default"
    }


def get_all_stocks() -> list:
    """Get all cached stock data for portfolio valuation"""
    return list(cached_stock_data.values())
