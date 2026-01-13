# 📈 HalalTrade Pro

**India's First AI-Powered Shariah-Compliant Stock Scanner**

[![Live Demo](https://img.shields.io/badge/Live-Demo-10b981?style=for-the-badge)](https://trading-bot-002.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

![HalalTrade Pro Dashboard](./frontend/public/icons/icon-192x192.png)

---

## 🌟 Features

### Core Features
- 🛡️ **Shariah Screening** - Automatic halal/non-halal classification for 500+ NSE stocks
- 📊 **Real-time Scanner** - Live price updates via WebSocket with buy/sell signals
- 🤖 **AI Analysis** - Get AI-powered insights and recommendations for any stock
- 💼 **Portfolio Tracking** - Track holdings, P&L, day's gain with analytics charts
- 🔔 **Smart Alerts** - Price alerts with Telegram notifications
- 📈 **Backtesting** - Test trading strategies on historical data

### Technical Highlights
- ⚡ Real-time WebSocket price updates
- 📱 PWA - Install as mobile/desktop app
- 🌙 Dark/Light mode
- 📊 Interactive charts with Recharts
- 🧪 Comprehensive test coverage

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build tool & dev server |
| TypeScript | Type safety |
| CSS3 | Custom styling |
| Recharts | Charts & analytics |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Python | Backend language |
| FastAPI | REST API framework |
| WebSocket | Real-time updates |
| SQLAlchemy | Database ORM |

### Testing
| Technology | Purpose |
|------------|---------|
| Vitest | Unit testing |
| React Testing Library | Component tests |
| Playwright | E2E browser testing |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| GitHub | Version control |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m app.main
```

The API will be available at `http://localhost:8000`

---

## 📁 Project Structure

```
tradebot/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── common/     # Shared components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   ├── portfolio/  # Portfolio components
│   │   │   ├── scanner/    # Stock scanner
│   │   │   └── settings/   # Settings components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript definitions
│   │   └── test/           # Test files
│   ├── public/             # Static assets
│   └── e2e/                # Playwright E2E tests
│
├── backend/                # Python FastAPI backend
│   └── app/
│       ├── routers/        # API route handlers
│       ├── models/         # Database models
│       └── services/       # Business logic
│
└── website/                # Landing page (separate deployment)
    ├── index.html
    ├── styles.css
    └── script.js
```

---

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

### Backend (.env)
```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-secret-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

---

## 🧪 Testing

### Run Unit Tests
```bash
cd frontend
npm run test
```

### Run E2E Tests
```bash
cd frontend
npm run test:e2e
```

---

## 📱 PWA Features

HalalTrade Pro is a Progressive Web App that can be installed on:
- 📱 Mobile devices (iOS & Android)
- 💻 Desktop (Windows, Mac, Linux)

Features:
- Offline support with Service Worker
- Push notifications (coming soon)
- Add to home screen

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Islamic finance principles from AAOIFI standards
- Stock data from NSE India
- UI inspiration from modern fintech apps

---

## 📞 Contact

- **Website**: [halaltrade.pro](https://halaltrade.pro)
- **Email**: contact@halaltrade.pro
- **Twitter**: [@HalalTradePro](https://twitter.com/HalalTradePro)

---

<p align="center">
  Made with ❤️ for the Muslim investor community
</p>