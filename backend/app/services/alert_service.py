from typing import List, Dict, Optional
from pydantic import BaseModel
from sqlmodel import Session, select
from ..models import Alert as DBAlert

class AlertCreate(BaseModel):
    symbol: str
    condition: str  # ABOVE or BELOW
    price: float
    metric: str = "PRICE"  # PRICE, RSI

def add_alert(alert: AlertCreate, session: Session) -> DBAlert:
    db_alert = DBAlert(
        symbol=alert.symbol,
        condition=alert.condition,
        target_price=alert.price,
        metric=alert.metric,
        active=True
    )
    session.add(db_alert)
    session.commit()
    session.refresh(db_alert)
    return db_alert

def get_alerts(session: Session) -> List[DBAlert]:
    # Return all alerts (or maybe just active ones? Front end usually wants all)
    return session.exec(select(DBAlert)).all()

def delete_alert(alert_id: int, session: Session):
    alert = session.get(DBAlert, alert_id)
    if alert:
        session.delete(alert)
        session.commit()

def check_alerts(current_prices: Dict[str, float], session: Session) -> List[DBAlert]:
    """Check if any alerts are triggered by current prices"""
    # Get active alerts
    alerts = session.exec(select(DBAlert).where(DBAlert.active == True)).all()
    triggered = []
    
    updated = False
    # Import cached data access for technicals
    from .stock_service import cached_stock_data

    updated = False
    for alert in alerts:
        symbol = alert.symbol
        metric = getattr(alert, "metric", "PRICE")
        
        current_val = 0.0
        
        # Get current value based on metric
        if metric == "PRICE":
            if symbol not in current_prices:
                continue
            current_val = current_prices[symbol]
        elif metric == "RSI":
            # Check cache for RSI
            stock_data = cached_stock_data.get(symbol.replace('.NS', '')) or cached_stock_data.get(symbol)
            if not stock_data or "technicals" not in stock_data:
                continue
            current_val = stock_data["technicals"].get("rsi", 0)
        
        target = alert.target_price
        condition = alert.condition
        
        is_triggered = False
        if condition == "ABOVE" and current_val >= target:
            is_triggered = True
        elif condition == "BELOW" and current_val <= target:
            is_triggered = True
            
        if is_triggered:
            from datetime import datetime
            alert.active = False # Disable after trigger
            alert.triggered_at = datetime.now().isoformat()
            session.add(alert) # Mark for update
            triggered.append(alert)
            updated = True
            
    if updated:
        session.commit()
        
    return triggered
