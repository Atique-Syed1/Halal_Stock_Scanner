# Data Provider Configuration

This application supports pluggable data providers. You can switch between providers by setting the `DATA_PROVIDER` environment variable in `.env`.

## Available Providers

### 1. YFinance (Default)
Uses Yahoo Finance web scraping. Free, but unreliable for high-frequency use.
```ini
DATA_PROVIDER=yfinance
```

### 2. Zerodha Kite Connect (Production)
Uses official Zerodha API. Reliable, fast, and compliant.
**Requirements:**
- A Kite Connect Developer Account (approx ₹2000/month)
- `kiteconnect` python package (`pip install kiteconnect`)

**Configuration:**
```ini
DATA_PROVIDER=kite
KITE_API_KEY=your_api_key
KITE_ACCESS_TOKEN=your_access_token
```

### 3. Mock Provider (Development)
Generates random data for testing UI/UX without network calls.
```ini
DATA_PROVIDER=mock
```

## How to Switch
1. Open `backend/.env` (create it if missing).
2. Set `DATA_PROVIDER` to your desired value.
3. Restart the backend server.
