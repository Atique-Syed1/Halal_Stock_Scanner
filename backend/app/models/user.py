from sqlmodel import Field
from .base import BaseDBModel

class User(BaseDBModel, table=True):
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    role: str = Field(default="user")  # "admin", "user"
