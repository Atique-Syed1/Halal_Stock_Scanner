from typing import List, Dict
from sqlmodel import Session, select
from ..models import Transaction
import pandas as pd
import numpy as np

def calculate_trade_performance(session: Session) -> Dict:
    """
    Calculate performance metrics from transaction history.
    Matching logic: FIFO (First-In, First-Out)
    """
    transactions = session.exec(select(Transaction).order_by(Transaction.date)).all()
    
    if not transactions:
        return {
            "winRate": 0,
            "totalTrades": 0,
            "wins": 0,
            "losses": 0,
            "netProfit": 0,
            "profitFactor": 0,
            "trades": []
        }

    # FIFO Matching
    holdings = {} # {symbol: [{"qty": 10, "price": 100, "date": ...}]}
    closed_trades = []

    for t in transactions:
        if t.type == "BUY":
            if t.symbol not in holdings:
                holdings[t.symbol] = []
            holdings[t.symbol].append({"qty": t.quantity, "price": t.price, "date": t.date})
        
        elif t.type == "SELL":
            if t.symbol in holdings and holdings[t.symbol]:
                qty_to_sell = t.quantity
                
                while qty_to_sell > 0 and holdings[t.symbol]:
                    batch = holdings[t.symbol][0] # First buy
                    
                    matched_qty = min(batch["qty"], qty_to_sell)
                    buy_price = batch["price"]
                    sell_price = t.price
                    
                    profit = (sell_price - buy_price) * matched_qty
                    profit_pct = (sell_price - buy_price) / buy_price * 100
                    
                    closed_trades.append({
                        "symbol": t.symbol,
                        "entryDate": batch["date"],
                        "exitDate": t.date,
                        "buyPrice": buy_price,
                        "sellPrice": sell_price,
                        "quantity": matched_qty,
                        "profit": profit,
                        "profitPercent": profit_pct,
                        "win": profit > 0
                    })
                    
                    # Update batch
                    batch["qty"] -= matched_qty
                    qty_to_sell -= matched_qty
                    
                    if batch["qty"] == 0:
                        holdings[t.symbol].pop(0)

    # Calculate Aggregates
    total_trades = len(closed_trades)
    wins = len([t for t in closed_trades if t["win"]])
    losses = total_trades - wins
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
    
    total_profit = sum(t["profit"] for t in closed_trades if t["profit"] > 0)
    total_loss = abs(sum(t["profit"] for t in closed_trades if t["profit"] < 0))
    profit_factor = (total_profit / total_loss) if total_loss > 0 else (total_profit if total_profit > 0 else 0)
    net_profit = sum(t["profit"] for t in closed_trades)

    return {
        "winRate": round(win_rate, 1),
        "totalTrades": total_trades,
        "wins": wins,
        "losses": losses,
        "netProfit": round(net_profit, 2),
        "profitFactor": round(profit_factor, 2),
        "recentTrades": closed_trades[-10:] # Last 10 trades
    }

def calculate_risk_metrics(session: Session) -> Dict:
    """
    Calculate Sharpe Ratio, Max Drawdown based on equity curve
    (Simulated using closed trades for now)
    """
    # Simply using mock risk metrics for now as we need daily equity snapshots for real Sharpe
    # In production, we'd log daily portfolio value to a separate table
    
    return {
        "sharpeRatio": 1.25, # Good > 1
        "maxDrawdown": -12.5, # Percentage
        "volatility": 15.4, # Annualized vol
        "beta": 0.85 # Less volatile than market
    }
