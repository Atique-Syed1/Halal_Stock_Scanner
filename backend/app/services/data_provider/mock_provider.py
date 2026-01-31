import pandas as pd
import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta
from .base import DataProvider

class MockProvider(DataProvider):
    """Implementation using generated mock data for stability"""

    def get_history(self, symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        # Generate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        if period == "1mo": start_date = end_date - timedelta(days=30)
        if period == "5d": start_date = end_date - timedelta(days=5)
        
        freq = "D"
        if interval == "1h": freq = "h"
        if interval == "5m": freq = "5min"
        
        dates = pd.date_range(start=start_date, end=end_date, freq=freq)
        
        # Seed based on symbol for consistency
        np.random.seed(sum(ord(c) for c in symbol))
        
        base_price = 1000.0
        returns = np.random.normal(0, 0.02, len(dates))
        price_path = base_price * (1 + returns).cumprod()
        
        df = pd.DataFrame(index=dates)
        df['Open'] = price_path
        df['High'] = price_path * 1.01
        df['Low'] = price_path * 0.99
        df['Close'] = price_path
        df['Volume'] = np.random.randint(1000, 100000, len(dates))
        
        return df

    def get_current_price(self, symbol: str) -> float:
        np.random.seed(sum(ord(c) for c in symbol) + datetime.now().hour)
        return round(1000.0 * (1 + np.random.normal(0, 0.05)), 2)

    def get_batch_prices(self, symbols: List[str]) -> Dict[str, float]:
        return {s: self.get_current_price(s) for s in symbols}

    def get_ticker_info(self, symbol: str) -> Dict:
        return {
            "longName": f"Mock {symbol} Ltd",
            "sector": "Technology",
            "industry": "Software"
        }

    def get_market_status(self) -> Dict:
        return {"status": "open", "nextEvent": "Closes in 4h"}

    def search_symbols(self, query: str) -> List[Dict]:
        return [
            {"symbol": "RELIANCE", "name": "Reliance Industries", "exchange": "NSE"},
            {"symbol": "TCS", "name": "Tata Consultancy Services", "exchange": "NSE"}
        ]
