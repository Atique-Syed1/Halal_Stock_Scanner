"""
Settings Service - Key-value settings storage
"""
from typing import Optional
from sqlmodel import Session, select
from ..models import Setting


def get_setting(key: str, session: Session) -> Optional[str]:
    """Get a setting value by key"""
    statement = select(Setting).where(Setting.key == key)
    setting = session.exec(statement).first()
    return setting.value if setting else None


def set_setting(key: str, value: str, session: Session) -> None:
    """Set a setting value (upsert)"""
    statement = select(Setting).where(Setting.key == key)
    existing = session.exec(statement).first()
    
    if existing:
        existing.value = value
    else:
        session.add(Setting(key=key, value=value))
    
    session.commit()
