import React, { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Globe,
    BarChart3,
    Clock,
    RefreshCw,
    ChevronRight,
    Filter,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Zap
} from 'lucide-react';
import API from '../../config/api';
import { Sparkline } from '../common/Sparkline';
import IpoTracker from './IpoTracker';
import SectorRotation from './SectorRotation';
import './MarketOverview.css';

// ====================================================================
// INDEX CARD COMPONENT
// ====================================================================
const IndexCard = ({ index }) => {
    const isPositive = index.change >= 0;

    return (
        <div className="market-index-card glass-card">
            <div className="index-header">
                <span className="index-name">{index.name}</span>
                <div className={`index-badge ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {isPositive ? '+' : ''}{index.changePercent?.toFixed(2)}%
                </div>
            </div>
            <div className="index-value">
                ₹{index.value?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className="index-change">
                <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                    {isPositive ? '+' : ''}{index.change?.toFixed(2)}
                </span>
            </div>
            <div className="index-sparkline">
                <Sparkline
                    data={index.history || []}
                    width={120}
                    height={40}
                    color={isPositive ? '#10b981' : '#ef4444'}
                />
            </div>
        </div>
    );
};

// ====================================================================
// MARKET STATUS CARD
// ====================================================================
const MarketStatusCard = ({ status }) => {
    const statusConfig = {
        open: { color: 'emerald', label: 'Market Open', icon: Activity },
        'pre-market': { color: 'amber', label: 'Pre-Market', icon: Clock },
        closed: { color: 'red', label: 'Market Closed', icon: Clock }
    };

    const config = statusConfig[status?.status] || statusConfig.closed;
    const Icon = config.icon;

    return (
        <div className={`market-status-card status-${config.color}`}>
            <div className="status-indicator">
                <div className={`status-dot ${config.color}`} />
                <Icon size={16} />
            </div>
            <div className="status-info">
                <span className="status-label">{config.label}</span>
                <span className="status-time">{status?.nextEvent || 'Check back later'}</span>
            </div>
        </div>
    );
};

// ====================================================================
// SECTOR HEATMAP
// ====================================================================
const SectorHeatmap = ({ sectors }) => {
    const getColorClass = (change) => {
        if (change >= 2) return 'sector-very-positive';
        if (change >= 0.5) return 'sector-positive';
        if (change >= 0) return 'sector-neutral';
        if (change >= -0.5) return 'sector-slight-negative';
        if (change >= -2) return 'sector-negative';
        return 'sector-very-negative';
    };

    return (
        <div className="sector-heatmap-container glass-card">
            <div className="section-header">
                <div className="header-title">
                    <BarChart3 size={18} className="text-blue-400" />
                    <h3>Sector Performance</h3>
                </div>
                <span className="header-subtitle">Today's Change</span>
            </div>
            <div className="sector-grid">
                {sectors?.map((sector) => (
                    <div
                        key={sector.name}
                        className={`sector-cell ${getColorClass(sector.change)}`}
                        title={`${sector.name}: ${sector.change >= 0 ? '+' : ''}${sector.change?.toFixed(2)}%`}
                    >
                        <span className="sector-name">{sector.name}</span>
                        <span className="sector-change">
                            {sector.change >= 0 ? '+' : ''}{sector.change?.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
            <div className="heatmap-legend">
                <div className="legend-item"><span className="legend-box sector-very-negative" /> -2%+</div>
                <div className="legend-item"><span className="legend-box sector-negative" /> -0.5%</div>
                <div className="legend-item"><span className="legend-box sector-neutral" /> 0%</div>
                <div className="legend-item"><span className="legend-box sector-positive" /> +0.5%</div>
                <div className="legend-item"><span className="legend-box sector-very-positive" /> +2%+</div>
            </div>
        </div>
    );
};

// ====================================================================
// TOP MOVERS WIDGET
// ====================================================================
const TopMoversWidget = ({ movers, showHalalOnly, setShowHalalOnly }) => {
    const [activeTab, setActiveTab] = useState('gainers');

    const tabs = [
        { id: 'gainers', label: 'Gainers', icon: TrendingUp },
        { id: 'losers', label: 'Losers', icon: TrendingDown },
        { id: 'active', label: 'Most Active', icon: Zap }
    ];

    const currentMovers = movers?.[activeTab] || [];
    const filteredMovers = showHalalOnly
        ? currentMovers.filter(s => s.isHalal)
        : currentMovers;

    return (
        <div className="top-movers-widget glass-card">
            <div className="section-header">
                <div className="header-title">
                    <TrendingUp size={18} className="text-emerald-400" />
                    <h3>Top Movers</h3>
                </div>
                <button
                    onClick={() => setShowHalalOnly(!showHalalOnly)}
                    className={`halal-filter-btn ${showHalalOnly ? 'active' : ''}`}
                >
                    <Filter size={14} />
                    Halal Only
                </button>
            </div>

            <div className="movers-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`mover-tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="movers-list">
                {filteredMovers.length === 0 ? (
                    <div className="empty-movers">No stocks found</div>
                ) : (
                    filteredMovers.slice(0, 5).map((stock, index) => (
                        <div key={stock.symbol} className="mover-row">
                            <div className="mover-rank">{index + 1}</div>
                            <div className="mover-info">
                                <span className="mover-symbol">{stock.symbol}</span>
                                <span className="mover-name">{stock.name}</span>
                            </div>
                            <div className="mover-price">
                                ₹{stock.price?.toFixed(2)}
                            </div>
                            <div className={`mover-change ${stock.changePercent >= 0 ? 'positive' : 'negative'}`}>
                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                            </div>
                            {stock.isHalal && (
                                <span className="halal-badge-small">✓</span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ====================================================================
// GLOBAL MARKETS STRIP
// ====================================================================
const GlobalMarketsStrip = ({ globalMarkets }) => {
    return (
        <div className="global-markets-strip">
            <div className="global-header">
                <Globe size={16} className="text-purple-400" />
                <span>Global Markets</span>
            </div>
            <div className="global-markets-scroll">
                {globalMarkets?.map((market) => (
                    <div key={market.name} className="global-market-item">
                        <span className="market-label">{market.name}</span>
                        <span className={`market-change ${market.change >= 0 ? 'positive' : 'negative'}`}>
                            {market.change >= 0 ? '+' : ''}{market.change?.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ====================================================================
// MARKET BREADTH WIDGET
// ====================================================================
const MarketBreadthWidget = ({ breadth }) => {
    const advancePercent = breadth?.advances
        ? (breadth.advances / (breadth.advances + breadth.declines + breadth.unchanged)) * 100
        : 50;

    return (
        <div className="market-breadth-widget glass-card">
            <div className="section-header">
                <div className="header-title">
                    <Activity size={18} className="text-amber-400" />
                    <h3>Market Breadth</h3>
                </div>
            </div>
            <div className="breadth-bar-container">
                <div className="breadth-bar">
                    <div
                        className="breadth-advances"
                        style={{ width: `${advancePercent}%` }}
                    />
                </div>
            </div>
            <div className="breadth-stats">
                <div className="breadth-stat positive">
                    <span className="stat-value">{breadth?.advances || 0}</span>
                    <span className="stat-label">Advances</span>
                </div>
                <div className="breadth-stat neutral">
                    <span className="stat-value">{breadth?.unchanged || 0}</span>
                    <span className="stat-label">Unchanged</span>
                </div>
                <div className="breadth-stat negative">
                    <span className="stat-value">{breadth?.declines || 0}</span>
                    <span className="stat-label">Declines</span>
                </div>
            </div>
        </div>
    );
};

// ====================================================================
// LOADING SKELETON
// ====================================================================
const MarketOverviewSkeleton = () => (
    <div className="market-overview-skeleton">
        <div className="skeleton-header">
            <div className="skeleton-title" />
            <div className="skeleton-badge" />
        </div>
        <div className="skeleton-indices">
            {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-index-card" />
            ))}
        </div>
        <div className="skeleton-grid">
            <div className="skeleton-heatmap" />
            <div className="skeleton-movers" />
        </div>
    </div>
);

// ====================================================================
// MAIN MARKET OVERVIEW COMPONENT
// ====================================================================
const MarketOverview = () => {
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHalalOnly, setShowHalalOnly] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchMarketData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(API.MARKET_OVERVIEW);

            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }

            const data = await response.json();
            setMarketData(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Market data fetch error:', err);
            setError('Failed to load market data. Is the backend running?');
            // Use mock data as fallback
            setMarketData(getMockMarketData());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchMarketData]);

    if (loading && !marketData) {
        return <MarketOverviewSkeleton />;
    }

    return (
        <div className="market-overview">
            {/* Header */}
            <div className="market-overview-header">
                <div className="header-left">
                    <h1>Market Overview</h1>
                    <p className="header-subtitle">Real-time market snapshot</p>
                </div>
                <div className="header-right">
                    <MarketStatusCard status={marketData?.marketStatus} />
                    <button
                        onClick={fetchMarketData}
                        className="refresh-btn"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {lastUpdated && (
                        <span className="last-updated">
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="market-error-banner">
                    <span>{error}</span>
                    <button onClick={fetchMarketData}>Retry</button>
                </div>
            )}

            {/* Global Markets Strip */}
            <GlobalMarketsStrip globalMarkets={marketData?.globalMarkets} />

            {/* Index Cards */}
            <div className="indices-grid">
                {marketData?.indices?.map((index) => (
                    <IndexCard key={index.name} index={index} />
                ))}
            </div>

            {/* Main Grid - Heatmap + Movers */}
            <div className="market-main-grid">
                <SectorHeatmap sectors={marketData?.sectors} />
                <TopMoversWidget
                    movers={marketData?.topMovers}
                    showHalalOnly={showHalalOnly}
                    setShowHalalOnly={setShowHalalOnly}
                />
            </div>

            {/* Market Breadth */}
            <MarketBreadthWidget breadth={marketData?.breadth} />

            {/* Sector Rotation */}
            <div className="mt-6">
                <SectorRotation sectors={marketData?.sectors} />
            </div>

            {/* IPO Tracker */}
            <div className="mt-6">
                <IpoTracker />
            </div>
        </div>
    );
};

// ====================================================================
// MOCK DATA (Fallback when API unavailable)
// ====================================================================
const getMockMarketData = () => ({
    marketStatus: {
        status: 'open',
        nextEvent: 'Closes in 2h 30m'
    },
    indices: [
        { name: 'NIFTY 50', value: 24532.50, change: 125.30, changePercent: 0.51, history: generateMockHistory(24500) },
        { name: 'BANK NIFTY', value: 51842.15, change: -182.45, changePercent: -0.35, history: generateMockHistory(52000) },
        { name: 'SENSEX', value: 80765.38, change: 342.20, changePercent: 0.43, history: generateMockHistory(80500) }
    ],
    sectors: [
        { name: 'IT', change: 1.2 },
        { name: 'Banking', change: -0.35 },
        { name: 'Pharma', change: 0.8 },
        { name: 'Auto', change: -1.5 },
        { name: 'FMCG', change: 0.3 },
        { name: 'Metal', change: 2.1 },
        { name: 'Energy', change: -0.2 },
        { name: 'Realty', change: 1.5 },
        { name: 'Infra', change: 0.6 },
        { name: 'Media', change: -0.8 }
    ],
    globalMarkets: [
        { name: 'DOW', change: 0.35 },
        { name: 'S&P 500', change: 0.42 },
        { name: 'NASDAQ', change: 0.58 },
        { name: 'FTSE', change: -0.12 },
        { name: 'DAX', change: 0.25 },
        { name: 'Nikkei', change: 0.88 },
        { name: 'Hang Seng', change: -0.45 },
        { name: 'Gold', change: 0.15 },
        { name: 'Crude', change: -1.2 }
    ],
    topMovers: {
        gainers: [
            { symbol: 'TCS', name: 'Tata Consultancy', price: 4250.50, changePercent: 3.25, isHalal: true },
            { symbol: 'INFY', name: 'Infosys Ltd', price: 1842.30, changePercent: 2.80, isHalal: true },
            { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1685.45, changePercent: 2.45, isHalal: false },
            { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, changePercent: 2.12, isHalal: false },
            { symbol: 'WIPRO', name: 'Wipro Ltd', price: 542.60, changePercent: 1.95, isHalal: true }
        ],
        losers: [
            { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 842.30, changePercent: -3.15, isHalal: true },
            { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2654.80, changePercent: -2.85, isHalal: false },
            { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 12450.25, changePercent: -2.45, isHalal: true },
            { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6842.50, changePercent: -2.10, isHalal: false },
            { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1542.75, changePercent: -1.85, isHalal: true }
        ],
        active: [
            { symbol: 'TCS', name: 'Tata Consultancy', price: 4250.50, changePercent: 3.25, isHalal: true },
            { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, changePercent: 2.12, isHalal: false },
            { symbol: 'HDFC', name: 'HDFC Ltd', price: 2845.60, changePercent: 1.45, isHalal: false },
            { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1125.30, changePercent: 0.85, isHalal: false },
            { symbol: 'INFY', name: 'Infosys Ltd', price: 1842.30, changePercent: 2.80, isHalal: true }
        ]
    },
    breadth: {
        advances: 285,
        declines: 165,
        unchanged: 50
    }
});

const generateMockHistory = (basePrice) => {
    return Array.from({ length: 20 }, (_) =>
        basePrice + (Math.random() - 0.5) * basePrice * 0.02
    );
};

export default MarketOverview;
