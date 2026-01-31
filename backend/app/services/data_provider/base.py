from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import pandas as pd

class DataProvider(ABC):
    """Abstract Base Class for Stock Market Data Providers"""

    @abstractmethod
    def get_history(self, symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """
        Fetch historical OHLCV data.
        Returns empty DataFrame if failed.
        """
        pass

    @abstractmethod
    def get_current_price(self, symbol: str) -> float:
        """
        Fetch single current price.
        Returns 0.0 if failed.
        """
        pass

    @abstractmethod
    def get_batch_prices(self, symbols: List[str]) -> Dict[str, float]:
        """
        Fetch current prices for multiple symbols.
        Returns dict {symbol: price}.
        """
        pass
    
    @abstractmethod
    def get_ticker_info(self, symbol: str) -> Dict:
        """
        Get basic metadata (name, sector, etc).
        """
        pass

    @abstractmethod
    def get_market_status(self) -> Dict:
        """
        Get current market status (Open/Closed, Next Event).
        Returns dict with keys: status, nextEvent.
        """
        pass

    @abstractmethod
    def search_symbols(self, query: str) -> List[Dict]:
        """
        Search for symbols.
        Returns list of dicts: {symbol, name, exchange}.
        """
        pass
