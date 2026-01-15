"""
Market Overview Router
Provides market indices, sectors, and global market data
"""
import random
from datetime import datetime
from fastapi import APIRouter

router = APIRouter(prefix="/api/market", tags=["market"])


def generate_mock_history(base_price: float, count: int = 20) -> list:
    """Generate mock price history for sparklines"""
    return [base_price + (random.random() - 0.5) * base_price * 0.02 for _ in range(count)]


def get_market_status() -> dict:
    """Determine current market status based on IST time"""
    now = datetime.now()
    hour = now.hour
    minute = now.minute
    weekday = now.weekday()
    
    # Market closed on weekends
    if weekday >= 5:
        return {
            "status": "closed",
            "nextEvent": "Opens Monday 9:15 AM"
        }
    
    # Pre-market: 9:00 - 9:15
    if hour == 9 and minute < 15:
        return {
            "status": "pre-market",
            "nextEvent": f"Opens in {15 - minute} min"
        }
    
    # Market open: 9:15 - 15:30
    if (hour == 9 and minute >= 15) or (10 <= hour < 15) or (hour == 15 and minute < 30):
        close_mins = (15 - hour) * 60 + (30 - minute)
        hours = close_mins // 60
        mins = close_mins % 60
        return {
            "status": "open",
            "nextEvent": f"Closes in {hours}h {mins}m"
        }
    
    # After hours
    return {
        "status": "closed",
        "nextEvent": "Opens tomorrow 9:15 AM"
    }


@router.get("/overview")
def get_market_overview():
    """Get complete market overview data"""
    
    # Mock Indices Data (would be fetched from real API in production)
    indices = [
        {
            "name": "NIFTY 50",
            "value": 24532.50 + random.uniform(-100, 100),
            "change": random.uniform(-200, 200),
            "changePercent": random.uniform(-1, 1),
            "history": generate_mock_history(24500)
        },
        {
            "name": "BANK NIFTY",
            "value": 51842.15 + random.uniform(-200, 200),
            "change": random.uniform(-400, 400),
            "changePercent": random.uniform(-1.5, 1.5),
            "history": generate_mock_history(52000)
        },
        {
            "name": "SENSEX",
            "value": 80765.38 + random.uniform(-300, 300),
            "change": random.uniform(-500, 500),
            "changePercent": random.uniform(-1, 1),
            "history": generate_mock_history(80500)
        }
    ]
    
    # Mock Sectors Data
    sectors = [
        {"name": "IT", "change": random.uniform(-2, 3)},
        {"name": "Banking", "change": random.uniform(-2, 2)},
        {"name": "Pharma", "change": random.uniform(-1.5, 2)},
        {"name": "Auto", "change": random.uniform(-2.5, 1.5)},
        {"name": "FMCG", "change": random.uniform(-1, 1.5)},
        {"name": "Metal", "change": random.uniform(-3, 3)},
        {"name": "Energy", "change": random.uniform(-2, 2)},
        {"name": "Realty", "change": random.uniform(-2.5, 2.5)},
        {"name": "Infra", "change": random.uniform(-1.5, 2)},
        {"name": "Media", "change": random.uniform(-2, 1.5)}
    ]
    
    # Mock Global Markets
    global_markets = [
        {"name": "DOW", "change": random.uniform(-1, 1)},
        {"name": "S&P 500", "change": random.uniform(-1, 1)},
        {"name": "NASDAQ", "change": random.uniform(-1.5, 1.5)},
        {"name": "FTSE", "change": random.uniform(-0.5, 0.5)},
        {"name": "DAX", "change": random.uniform(-0.8, 0.8)},
        {"name": "Nikkei", "change": random.uniform(-1, 1.5)},
        {"name": "Hang Seng", "change": random.uniform(-1.5, 1)},
        {"name": "Gold", "change": random.uniform(-0.5, 0.5)},
        {"name": "Crude", "change": random.uniform(-2, 2)}
    ]
    
    # Mock Top Movers
    halal_stocks = ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM", "TATAMOTORS", "MARUTI", "BHARTIARTL", "TITAN", "LT"]
    non_halal_stocks = ["HDFCBANK", "ICICIBANK", "KOTAKBANK", "SBIN", "AXISBANK", "BAJFINANCE", "RELIANCE", "ADANIENT"]
    
    def create_mover(symbol: str, is_halal: bool, change_range: tuple):
        base_prices = {
            "TCS": 4250, "INFY": 1842, "WIPRO": 542, "HCLTECH": 1650, "TECHM": 1420,
            "TATAMOTORS": 842, "MARUTI": 12450, "BHARTIARTL": 1542, "TITAN": 3850, "LT": 3420,
            "HDFCBANK": 1685, "ICICIBANK": 1125, "KOTAKBANK": 1845, "SBIN": 842, "AXISBANK": 1165,
            "BAJFINANCE": 6842, "RELIANCE": 2456, "ADANIENT": 2654
        }
        names = {
            "TCS": "Tata Consultancy", "INFY": "Infosys Ltd", "WIPRO": "Wipro Ltd",
            "HCLTECH": "HCL Technologies", "TECHM": "Tech Mahindra", "TATAMOTORS": "Tata Motors",
            "MARUTI": "Maruti Suzuki", "BHARTIARTL": "Bharti Airtel", "TITAN": "Titan Company",
            "LT": "Larsen & Toubro", "HDFCBANK": "HDFC Bank", "ICICIBANK": "ICICI Bank",
            "KOTAKBANK": "Kotak Bank", "SBIN": "State Bank", "AXISBANK": "Axis Bank",
            "BAJFINANCE": "Bajaj Finance", "RELIANCE": "Reliance Ind", "ADANIENT": "Adani Ent"
        }
        return {
            "symbol": symbol,
            "name": names.get(symbol, symbol),
            "price": base_prices.get(symbol, 1000) + random.uniform(-50, 50),
            "changePercent": random.uniform(*change_range),
            "isHalal": is_halal
        }
    
    all_for_gain = halal_stocks[:5] + non_halal_stocks[:3]
    all_for_loss = halal_stocks[3:8] + non_halal_stocks[2:5]
    
    gainers = sorted([
        create_mover(s, s in halal_stocks, (0.5, 4)) for s in all_for_gain
    ], key=lambda x: x["changePercent"], reverse=True)[:5]
    
    losers = sorted([
        create_mover(s, s in halal_stocks, (-4, -0.5)) for s in all_for_loss
    ], key=lambda x: x["changePercent"])[:5]
    
    active = [
        create_mover(s, s in halal_stocks, (-2, 3)) for s in (halal_stocks[:3] + non_halal_stocks[:2])
    ]
    
    # Market Breadth
    advances = random.randint(200, 350)
    declines = random.randint(150, 300)
    unchanged = random.randint(30, 70)
    
    return {
        "marketStatus": get_market_status(),
        "indices": indices,
        "sectors": sectors,
        "globalMarkets": global_markets,
        "topMovers": {
            "gainers": gainers,
            "losers": losers,
            "active": active
        },
        "breadth": {
            "advances": advances,
            "declines": declines,
            "unchanged": unchanged
        },
        "timestamp": datetime.now().isoformat()
    }
