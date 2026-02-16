import os
import logging
import random
from typing import Dict
from .stock_service import cached_stock_data, get_full_stock_data
import yfinance as yf
import google.generativeai as genai
from dotenv import load_dotenv
import json
from ..utils.cache import ai_cache

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def analyze_stock(symbol: str) -> Dict:
    """
    Generate an AI-style analysis of the stock.
    Prioritizes Gemini LLM if configured, otherwise falls back to Expert System.
    """
    # Check cache first
    cache_key = f"analysis:{symbol}"
    cached_result = ai_cache.get(cache_key)
    if cached_result is not None:
        logger.debug(f"AI analysis cache hit for {symbol}")
        return cached_result
    
    # 1. Get Data
    stock = cached_stock_data.get(symbol)
    if not stock:
        try:
            ticker = yf.Ticker(symbol if symbol.endswith('.NS') else f"{symbol}.NS")
            stock = get_full_stock_data(symbol, ticker)
        except:
            pass
    
    if not stock:
        return {
            "summary": "Data Unavailable",
            "details": f"I couldn't retrieve enough data for {symbol} to perform an analysis. Please try again later.",
            "sentiment": "NEUTRAL"
        }

    # 2. Decide Analysis Method
    result = None
    if GEMINI_API_KEY:
        try:
             result = await generate_gemini_analysis(stock, symbol)
        except Exception as e:
             logger.warning(f"Gemini API failed for {symbol}, using expert system: {e}")
             result = generate_expert_analysis(stock)
    else:
        result = generate_expert_analysis(stock)
    
    # Cache the result
    ai_cache[cache_key] = result
    logger.debug(f"Cached AI analysis for {symbol}")
    
    return result


def _extract_analysis_data(stock: Dict):
    """Refactored helper to extract common stock data"""
    return (
        stock.get('price', 0),
        stock.get('technicals', {}),
        stock.get('shariah', {}),
        stock.get('analysis', {})
    )

async def generate_gemini_analysis(stock: Dict, symbol: str) -> Dict:
    """Use Google Gemini to generate investment analysis"""
    
    price, technicals, shariah, analysis = _extract_analysis_data(stock)

    # Construct Prompt
    prompt = f"""
    You are an expert Islamic Investment Analyst for 'HalalTrade Pro'. 
    Analyze the stock {symbol} based on the following technical and fundamental data.

    **Market Data:**
    - Price: {price}
    - RSI (14): {technicals.get('rsi', 'N/A')}
    - MACD: {analysis.get('macd', 'N/A')} (Signal: {analysis.get('macd_signal', 'N/A')})
    - 50 SMA: {analysis.get('sma50', 'N/A')}
    - 200 SMA: {analysis.get('sma200', 'N/A')}
    - Volume: {analysis.get('volume', 'N/A')}

    **Shariah Compliance:**
    - Status: {stock.get('shariahStatus', 'Unknown')}
    - Debt Ratio: {shariah.get('debtRatio', 'N/A')}%
    - Non-Halal Income: {shariah.get('impureRatio', 'N/A')}%
    - Reason: {stock.get('shariahReason', '')}

    **Task:**
    1. Provide a "Verdict" (BUY, SELL, or HOLD).
    2. Write a concise "Executive Summary" (2-3 sentences).
    3. Provide "Detailed Analysis" in markdown bullet points, covering Trend, Momentum, and Shariah Safety. Used bolding for key terms.
    4. Maintain a professional, objective, yet helpful tone.
    5. Be explicit about Shariah compliance.

    **Output Format (JSON):**
    {{
        "sentiment": "BUY/SELL/HOLD",
        "summary": "...",
        "details": "..."
    }}
    """

    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    
    try:
        text = response.text.replace('```json', '').replace('```', '')
        data = json.loads(text)
        return data
    except Exception as e:
        return {
            "sentiment": "NEUTRAL", 
            "summary": "AI Generated Analysis", 
            "details": response.text
        }


async def generate_portfolio_analysis(portfolio_data: Dict) -> Dict:
    """
    Generate AI analysis for the entire portfolio.
    """
    # Check cache (shorter TTL for portfolio as it changes)
    cache_key = f"portfolio_analysis:{hash(str(portfolio_data.keys()))}" # Simple hash of holdings keys
    cached_result = ai_cache.get(cache_key)
    if cached_result is not None:
        return cached_result

    if GEMINI_API_KEY:
        try:
            return await _generate_gemini_portfolio_analysis(portfolio_data)
        except Exception as e:
            logger.warning(f"Gemini portfolio analysis failed: {e}")
            return _generate_expert_portfolio_analysis(portfolio_data)
    else:
        return _generate_expert_portfolio_analysis(portfolio_data)

async def _generate_gemini_portfolio_analysis(portfolio: Dict) -> Dict:
    holdings_summary = []
    total_value = portfolio.get('total_value', 0)
    
    for stock in portfolio.get('holdings', []):
        weight = (stock['value'] / total_value * 100) if total_value > 0 else 0
        holdings_summary.append(f"- {stock['symbol']}: {weight:.1f}% weight, P/L: {stock['pl_percent']:.1f}%")
    
    prompt = f"""
    You are a Portfolio Manager for HalalTrade Pro. Analyze this portfolio:
    
    **Portfolio Metrics:**
    - Total Value: ₹{total_value}
    - Total P/L: ₹{portfolio.get('total_pl', 0)} ({portfolio.get('total_pl_percent', 0)}%)
    
    **Holdings:**
    {chr(10).join(holdings_summary)}
    
    **Task:**
    1. Provide a "Risk Score" (Low/Medium/High).
    2. Identify "Concentration Risk" (is it too heavy in one stock?).
    3. Suggest "Rebalancing" actions (what to trim, what to add).
    4. Provide a "Verdict" (Balanced, Risky, Conservative).
    
    **Output Format (JSON):**
    {{
        "risk_score": "Low/Medium/High",
        "verdict": "...",
        "analysis": [
            "Point 1...",
            "Point 2..."
        ],
        "suggestions": [
            "Suggestion 1...",
            "Suggestion 2..."
        ]
    }}
    """
    
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    
    text = response.text.replace('```json', '').replace('```', '')
    return json.loads(text)

def _generate_expert_portfolio_analysis(portfolio: Dict) -> Dict:
    """Fallback rule-based portfolio analysis"""
    holdings = portfolio.get('holdings', [])
    count = len(holdings)
    
    analysis = []
    suggestions = []
    
    if count < 3:
        analysis.append("Portfolio is **Under-Diversified**. Holding fewer than 3 stocks increases specific risk.")
        suggestions.append("Consider adding 2-3 more stocks from different sectors (e.g., FMCG, Pharma).")
        risk = "High"
    elif count > 15:
        analysis.append("Portfolio is **Over-Diversified**. Managing >15 stocks may dilute returns.")
        risk = "Low"
    else:
        analysis.append("Portfolio size is **Optimal** (3-15 stocks).")
        risk = "Medium"
        
    # check for single stock dominance
    total_val = portfolio.get('total_value', 1)
    for stock in holdings:
        weight = (stock['value'] / total_val) * 100
        if weight > 40:
            analysis.append(f"⚠️ High concentration in **{stock['symbol']}** ({weight:.1f}%).")
            suggestions.append(f"Trim {stock['symbol']} to below 20% allocation to reduce risk.")
            risk = "High"
            
    return {
        "risk_score": risk,
        "verdict": "Balanced" if risk == "Medium" else risk,
        "analysis": analysis,
        "suggestions": suggestions
    }


def generate_expert_analysis(stock: Dict) -> Dict:
    """Legacy Rule-Based Logic (The 'Expert System')"""
    
    price, technicals, _, analysis = _extract_analysis_data(stock)
    shariah_status = stock.get('shariahStatus', 'Unknown')
    
    rsi = technicals.get('rsi', 50)
    sma20 = analysis.get('sma20', price)
    sma50 = analysis.get('sma50', price)
    sma200 = analysis.get('sma200', price)
    macd_val = analysis.get('macd', 0)
    macd_signal = analysis.get('macd_signal', 0)
    bb_upper = analysis.get('bb_upper', price * 1.1)
    bb_lower = analysis.get('bb_lower', price * 0.9)
    
    points = []
    sentiment_score = 0
    
    trend_msg = ""
    if price > sma200:
        trend_msg = "The stock is in a **Long-Term Uptrend** (Price > 200 SMA)."
        sentiment_score += 1
        if price > sma50 and sma50 > sma200:
            trend_msg += " Ideally positioned with a strong bullish structure."
            sentiment_score += 1
    elif price < sma200:
        trend_msg = "The stock is in a **Long-Term Downtrend** (Price < 200 SMA)."
        sentiment_score -= 1
        if price < sma50:
            trend_msg += " Short-term weakness is also visible."
            sentiment_score -= 1
            
    points.append(f"📉 **Trend**: {trend_msg}")
    
    momentum_msg = []
    if rsi > 70:
        momentum_msg.append(f"RSI is **Overbought** ({rsi}), suggesting a potential pullback.")
        sentiment_score -= 0.5
    elif rsi < 30:
        momentum_msg.append(f"RSI is **Oversold** ({rsi}), suggesting the stock is undervalued.")
        sentiment_score += 1
    else:
        momentum_msg.append(f"RSI is Neutral ({rsi}).")
        
    if macd_val > macd_signal:
        momentum_msg.append("MACD is **Bullish** (above signal line).")
        sentiment_score += 0.5
    else:
        momentum_msg.append("MACD is **Bearish** (below signal line).")
        sentiment_score -= 0.5
        
    points.append(f"🚀 **Momentum**: {' '.join(momentum_msg)}")
    
    if price >= bb_upper * 0.99:
        points.append("⚠️ Price near **Upper Bollinger Band** (Resistance).")
    elif price <= bb_lower * 1.01:
        points.append("✅ Price near **Lower Bollinger Band** (Support).")
    else:
        points.append(f"📊 **Volatility**: Price is trading within the normal volatility bands.")

    # Shariah Check in Expert Logic
    if shariah_status == 'Non-Halal':
        points.append("❌ **Shariah**: This stock is Non-Halal. Trading is prohibited.")
        sentiment_score = -10
    elif shariah_status == 'Halal':
        points.append("✅ **Compliance**: This stock passes all Shariah screening criteria.")

    if sentiment_score >= 1.5:
        verdict = "BUY"
        summary_text = "Strong technicals suggest a buying opportunity."
    elif sentiment_score <= -1.5:
        verdict = "SELL"
        summary_text = "Technical weakness suggests avoiding or selling."
    else:
        verdict = "HOLD"
        summary_text = "Mixed signals. Wait for clearer direction."

    return {
        "summary": summary_text,
        "details": "\n\n".join(points),
        "sentiment": verdict,
        "score": sentiment_score
    }
