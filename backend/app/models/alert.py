from typing import Optional
from sqlmodel import Field
from datetime import datetime
from .base import BaseDBModel

class Alert(BaseDBModel, table=True):
    symbol: str = Field(index=True)
    condition: str  # "Above" or "Below"
    target_price: float
    metric: str = Field(default="PRICE")  # PRICE, RSI
    active: bool = Field(default=True)
    triggered_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
