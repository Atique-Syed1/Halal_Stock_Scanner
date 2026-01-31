import os
from .base import DataProvider
from .yfinance_provider import YFinanceProvider
from .mock_provider import MockProvider
from .kite_provider import KiteProvider

def get_data_provider() -> DataProvider:
    """Factory to get the configured data provider"""
    provider_type = os.getenv("DATA_PROVIDER", "yfinance").lower()
    
    if provider_type == "mock":
        return MockProvider()
    elif provider_type == "kite":
        return KiteProvider()
    elif provider_type == "yfinance":
        return YFinanceProvider()
    else:
        # Default to YFinance
        return YFinanceProvider()

# Singleton instance
current_provider = get_data_provider()
