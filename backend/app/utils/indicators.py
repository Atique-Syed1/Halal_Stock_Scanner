"""
Technical Indicators for Trading Analysis
"""
import numpy as np
import pandas as pd


def calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index (RSI)
    
    Args:
        prices: Series of closing prices
        period: RSI period (default 14)
    
    Returns:
        Series of RSI values
    """
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def calculate_sma(prices: pd.Series, period: int = 50) -> pd.Series:
    """
    Calculate Simple Moving Average (SMA)
    
    Args:
        prices: Series of closing prices
        period: SMA period (default 50)
    
    Returns:
        Series of SMA values
    """
    return prices.rolling(window=period).mean()


def calculate_ema(prices: pd.Series, period: int = 12) -> pd.Series:
    """
    Calculate Exponential Moving Average (EMA)
    
    Args:
        prices: Series of closing prices
        period: EMA period (default 12)
    
    Returns:
        Series of EMA values
    """
    return prices.ewm(span=period, adjust=False).mean()


def calculate_macd(
    prices: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Calculate MACD (Moving Average Convergence Divergence)
    
    Args:
        prices: Series of closing prices
        fast: Fast EMA period (default 12)
        slow: Slow EMA period (default 26)
        signal: Signal line period (default 9)
    
    Returns:
        Tuple of (macd_line, signal_line, histogram)
    """
    ema_fast = prices.ewm(span=fast, adjust=False).mean()
    ema_slow = prices.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def calculate_bollinger_bands(
    prices: pd.Series,
    period: int = 20,
    std_dev: float = 2.0
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Calculate Bollinger Bands
    
    Args:
        prices: Series of closing prices
        period: SMA period (default 20)
        std_dev: Standard deviation multiplier (default 2.0)
    
    Returns:
        Tuple of (middle_band, upper_band, lower_band)
    """
    sma = prices.rolling(window=period).mean()
    std = prices.rolling(window=period).std()
    upper = sma + (std_dev * std)
    lower = sma - (std_dev * std)
    return sma, upper, lower


def generate_rsi_signal(
    price: float,
    rsi: float,
    sma: float,
    oversold: int = 30,
    overbought: int = 70
) -> str:
    """
    Generate trading signal based on RSI + SMA strategy
    """
    if price > sma and rsi < oversold:
        return 'Buy'
    elif rsi > overbought or price < sma:
        return 'Sell'
    return 'Hold'


def generate_macd_signal(
    macd: float,
    signal: float,
    prev_macd: float = None,
    prev_signal: float = None
) -> str:
    """
    Generate MACD signal (Crossover)
    """
    # Bullish Crossover: MACD crosses above Signal
    if prev_macd is not None and prev_signal is not None:
        if prev_macd < prev_signal and macd > signal:
            return 'Buy'
        if prev_macd > prev_signal and macd < signal:
            return 'Sell'
    
    # Trend confirmation
    if macd > signal and macd > 0:
        return 'Buy' # Strong trend
    if macd < signal and macd < 0:
        return 'Sell'
        
    return 'Hold'


def generate_bollinger_signal(
    price: float,
    lower_band: float,
    upper_band: float
) -> str:
    """
    Generate Bollinger Band signal (Reversal)
    """
    if price <= lower_band:
        return 'Buy' # Potential oversold bounce
    if price >= upper_band:
        return 'Sell' # Potential overbought rejection
    return 'Hold'


def generate_ma_signal(
    sma_fast: float, # e.g. 50
    sma_slow: float  # e.g. 200
) -> str:
    """
    Generate Moving Average signal (Golden/Death Cross context)
    """
    if sma_fast > sma_slow:
        return 'Buy' # Uptrend
    return 'Sell' # Downtrend


def calculate_composite_score(
    signals: dict,
    weights: dict = None
) -> dict:
    """
    Calculate a composite score (0-100) and final signal
    """
    if weights is None:
        weights = {
            'rsi': 0.3,
            'macd': 0.3,
            'ma': 0.2,
            'bb': 0.2
        }
    
    score = 50 # Neutral start
    
    # RSI Contribution
    if signals['rsi'] == 'Buy': score += 20 * weights['rsi']
    elif signals['rsi'] == 'Sell': score -= 20 * weights['rsi']
    
    # MACD Contribution
    if signals['macd'] == 'Buy': score += 20 * weights['macd']
    elif signals['macd'] == 'Sell': score -= 20 * weights['macd']
    
    # MA Contribution
    if signals['ma'] == 'Buy': score += 20 * weights['ma']
    elif signals['ma'] == 'Sell': score -= 20 * weights['ma']
    
    # BB Contribution
    if signals['bb'] == 'Buy': score += 20 * weights['bb']
    elif signals['bb'] == 'Sell': score -= 20 * weights['bb']
    
    # Normalize limits
    score = max(0, min(100, score))
    
    # Determine Final Label
    if score >= 80: label = 'Strong Buy'
    elif score >= 60: label = 'Buy'
    elif score <= 20: label = 'Strong Sell'
    elif score <= 40: label = 'Sell'
    else: label = 'Hold'
    
    return {
        "score": round(score, 0),
        "label": label
    }



def calculate_stop_loss(price: float, rsi: float) -> float:
    """Calculate stop loss based on RSI"""
    sl_pct = 3 if rsi < 35 else 5
    return round(price * (1 - sl_pct / 100), 2)


def calculate_take_profit(price: float, rsi: float) -> float:
    """Calculate take profit target based on RSI"""
    tp_pct = 10 if rsi < 30 else 7
    return round(price * (1 + tp_pct / 100), 2)


def calculate_potential_gain(price: float, target: float) -> float:
    """Calculate potential gain percentage"""
    return round(((target - price) / price) * 100, 2)


def calculate_volume_ma(volume: pd.Series, period: int = 20) -> pd.Series:
    """
    Calculate Volume Moving Average
    
    Args:
        volume: Series of volume data
        period: MA period (default 20)
    
    Returns:
        Series of Volume MA
    """
    return volume.rolling(window=period).mean()
