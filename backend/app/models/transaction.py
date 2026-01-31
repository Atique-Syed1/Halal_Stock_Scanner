from sqlmodel import Field
from datetime import datetime
from .base import BaseDBModel

class Transaction(BaseDBModel, table=True):
    symbol: str = Field(index=True)
    type: str  # "BUY" or "SELL"
    quantity: int
    price: float
    date: str = Field(default_factory=lambda: datetime.now().isoformat())
