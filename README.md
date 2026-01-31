# HalalTrade Pro

HalalTrade Pro is a premium stock screening and analysis tool designed for Shariah-compliant trading. It features real-time market data, advanced screening filters, portfolio tracking, and automated alerts.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS (with custom glassmorphism and premium themes)
- **State Management**: React Hooks & Context
- **Charts**: Lightweight Charts / Recharts

### Backend
- **Framework**: Python (FastAPI)
- **Database**: SQLite (tradebot.db)

## Project Structure

```
tradebot/
├── backend/            # Python Backend
│   ├── app/            # Application Logic
│   │   ├── models/     # Database Models
│   │   ├── routers/    # API Endpoints
│   │   ├── services/   # Business Logic
│   │   └── utils/      # Helper Functions
│   └── data/           # Data Storage
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/ # UI Components
│   │   ├── hooks/      # Custom Hooks
│   │   ├── pages/      # Route Components
│   │   ├── styles/     # CSS Modules (Variables, Themes, etc.)
│   │   └── utils/      # Client-side Utilities
└── ...
```

## How to Run

### Prerequisities
- Node.js (v18+)
- Python (v3.10+)

### Setup

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app/main.py
   # Or use the helper script:
   # ./start_server.ps1
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open your browser at `http://localhost:5173` (or the port shown in terminal).

## Key Features
- **Scanner**: Filter stocks by Shariah compliance, technical indicators, and fundamental metrics.
- **Dashboard**: High-level market overview and portfolio performance.
- **Alerts**: Receive notifications for price movements or technical signals (Telegram integration supported).
- **Themes**: Switch between Dark, Light, Ocean, Sunset, and Forest themes.