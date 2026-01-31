import yfinance as yf
import pandas as pd
from typing import List, Dict
from .base import DataProvider

class YFinanceProvider(DataProvider):
    """Implementation using yfinance library"""

    def get_history(self, symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        try:
            search_symbol = symbol if symbol.endswith(".NS") else f"{symbol}.NS"
            ticker = yf.Ticker(search_symbol)
            
            # Map periods if needed (yfinance is quite standard though)
            history = ticker.history(period=period, interval=interval)
            return history
        except Exception as e:
            print(f"[YFinance] Error fetching history for {symbol}: {e}")
            return pd.DataFrame()

    def get_current_price(self, symbol: str) -> float:
        try:
            search_symbol = symbol if symbol.endswith(".NS") else f"{symbol}.NS"
            ticker = yf.Ticker(search_symbol)
            # Fast fetch using fast_info or history
            # history(period='1d') is safer than fast_info for reliability
            hist = ticker.history(period="1d")
            if not hist.empty:
                return float(hist['Close'].iloc[-1])
            return 0.0
        except Exception:
            return 0.0

    def get_batch_prices(self, symbols: List[str]) -> Dict[str, float]:
        if not symbols:
            return {}
            
        results = {}
        # yfinance allows space-separated tickers
        formatted_symbols = [s if s.endswith(".NS") else f"{s}.NS" for s in symbols]
        tickers_str = " ".join(formatted_symbols)
        
        try:
            # Downloading batch data is faster
            # 'last_price' isn't directly available in download, so we use 'Close' from last day
            data = yf.download(tickers_str, period="1d", group_by='ticker', progress=False)
            
            # Handle single vs multi-index columns
            if len(symbols) == 1:
                symbol = symbols[0]
                if not data.empty:
                    val = data['Close'].iloc[-1]
                    # Handle if val is a Series (sometimes happens)
                    if isinstance(val, pd.Series):
                        val = val.iloc[0]
                    results[symbol] = float(val)
            else:
                for symbol in symbols:
                    search_sym = symbol if symbol.endswith(".NS") else f"{symbol}.NS"
                    try:
                        if search_sym in data.columns.levels[0]:
                            val = data[search_sym]['Close'].iloc[-1]
                            results[symbol] = float(val)
                    except:
                        pass
        except Exception as e:
            print(f"[YFinance] Batch error: {e}")
            
        return results

    def get_ticker_info(self, symbol: str) -> Dict:
        try:
            search_symbol = symbol if symbol.endswith(".NS") else f"{symbol}.NS"
            ticker = yf.Ticker(search_symbol)
            return ticker.info
        except:
            return {}

    def get_market_status(self) -> Dict:
        # YFinance doesn't provide live market status easily, fallback to time-based
        from datetime import datetime
        now = datetime.now()
        hour = now.hour
        minute = now.minute
        weekday = now.weekday()
        
        if weekday >= 5:
            return {"status": "closed", "nextEvent": "Opens Monday 9:15 AM"}
        if hour == 9 and minute < 15:
            return {"status": "pre-market", "nextEvent": f"Opens in {15 - minute} min"}
        if (hour == 9 and minute >= 15) or (10 <= hour < 15) or (hour == 15 and minute < 30):
            return {"status": "open", "nextEvent": "Closes at 3:30 PM"}
        return {"status": "closed", "nextEvent": "Opens tomorrow 9:15 AM"}

    def search_symbols(self, query: str) -> List[Dict]:
        # Basic YFinance search is limited, stubbing implementation
        # In a real app, this would query a local DB or Yahoo's autocomplete API
        return []
