from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..database import get_session
from ..services import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/performance")
def get_performance(session: Session = Depends(get_session)):
    """Get trade performance metrics (win rate, P&L)"""
    return analytics_service.calculate_trade_performance(session)

@router.get("/risk")
def get_risk_metrics(session: Session = Depends(get_session)):
    """Get risk metrics (sharpe, drawdown)"""
    return analytics_service.calculate_risk_metrics(session)
