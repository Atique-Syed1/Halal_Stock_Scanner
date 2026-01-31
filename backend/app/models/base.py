from typing import Optional
from sqlmodel import Field, SQLModel

class BaseDBModel(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
