# Application Enhancement Plan

Based on the current architecture (React + FastAPI + Python-based AI) and the recent upgrades, here are the recommended high-impact enhancements:

## 1. AI-Powered Portfolio Insights (High Value)
**Concept**: Move beyond single-stock analysis. Have the AI analyze the *entire portfolio* for risk and opportunities.
*   **Feature**: "Portfolio Health Check" button.
*   **Function**: AI analyzes sector allocation, beta-weighted risk, and diversification.
*   **Output**: "Your portfolio is heavily weighted in Tech (60%). Consider adding FMCG for stability."

## 2. Smart Alerts & Notifications (Retention)
**Concept**: Users aren't always looking at the screen. Push relevant updates.
*   **Feature**: Server-side Alerts with Telegram/Email integration.
*   **Function**: Allow users to set "Price > X" or "RSI < 30" alerts.
*   **Tech**: Use the existing `telegram_service.py` to send real notifications to a user's Telegram ID.

## 3. "Halal Screener" Advanced Filters (Core Value)
**Concept**: Deepen the Shariah niche.
*   **Feature**: "Purification" Calculator.
*   **Function**: If a user made ₹1000 profit, but 2% of the company's income is non-halal, show: "Donation Amount: ₹20".
*   **Data**: Requires adding a `impure_income_ratio` field to the stock data (mock it for now, then real data).

## 4. Paper Trading Gamification (Engagement)
**Concept**: Make learning fun and risk-free.
*   **Feature**: "Trade Arena" Leaderboard.
*   **Function**: Users start with ₹1,00,000 virtual cash. Rank them by weekly % return.
*   **Tech**: We already have the Portfolio logic. Just need a "Leaderboard" endpoint.

## 5. UI/UX Polish (Professionalism)
*   **Mobile Experience**: Convert the "Scanner" table to a "Card View" on mobile screens (currently it's likely cramped).
*   **Dark Mode Toggle**: While it looks dark now, ensure it persists and respects system preferences.

## Recommended Immediate Action: "Portfolio Health Check"
This leverages your existing `AIAnalyst` and `Portfolio` services to create a unique value proposition that few competitors have.

### Implementation Steps
1.  **Backend**: Add `/api/portfolio/analyze` endpoint.
    *   Aggregates all holdings.
    *   Constructs a prompt for Gemini: "Analyze this portfolio: {holdings}. Suggest rebalancing."
2.  **Frontend**: Add "AI Audit" button on the Portfolio page.
3.  **UI**: Display the result in a modal similar to the Stock Analyst.