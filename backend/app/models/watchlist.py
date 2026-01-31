from sqlmodel import Field
from datetime import datetime
from .base import BaseDBModel

class WatchlistItem(BaseDBModel, table=True):
    symbol: str = Field(index=True, unique=True)
    added_at: str = Field(default_factory=lambda: datetime.now().isoformat())
