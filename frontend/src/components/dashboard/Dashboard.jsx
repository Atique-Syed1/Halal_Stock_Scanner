import React, { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Bell,
    Star,
    Activity,
    BarChart2,
    RefreshCw,
    ShieldCheck,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Zap
} from 'lucide-react';
import API from '../../config/api';
import { DashboardSkeleton } from '../common/LoadingSkeleton';
import WinRateWidget from './WinRateWidget';
import RiskMetricsWidget from './RiskMetricsWidget';
import CommunityTrendsWidget from './CommunityTrendsWidget';

/**
 * ====================================================================
 * STAT CARD COMPONENT
 * ====================================================================
 */
const StatCard = ({ title, value, subtitle, icon, trend, trendValue, color = "emerald" }) => {
    const Icon = icon;
    const colorClasses = {
        emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
        blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
        amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
        red: "from-red-500/20 to-red-600/10 border-red-500/30",
        purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30"
    };

    const iconColors = {
        emerald: "text-emerald-400",
        blue: "text-blue-400",
        amber: "text-amber-400",
        red: "text-red-400",
        purple: "text-purple-400"
    };

    return (
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm p-5 transition-all hover:scale-[1.02]`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-gray-800/50 ${iconColors[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

/**
 * ====================================================================
 * MARKET STATUS BADGE
 * ====================================================================
 */
const MarketStatusBadge = ({ status, message, time }) => {
    const statusStyles = {
        open: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        "pre-market": "bg-amber-500/20 text-amber-400 border-amber-500/30",
        closed: "bg-red-500/20 text-red-400 border-red-500/30"
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${statusStyles[status] || statusStyles.closed}`}>
            <div className={`w-3 h-3 rounded-full ${status === 'open' ? 'bg-emerald-400 animate-pulse' : status === 'pre-market' ? 'bg-amber-400' : 'bg-red-400'}`} />
            <div>
                <p className="font-semibold">{message}</p>
                <p className="text-xs opacity-70">{time}</p>
            </div>
        </div>
    );
};

/**
 * ====================================================================
 * TOP MOVERS LIST
 * ====================================================================
 */
const TopMoversList = ({ title, stocks, type }) => {
    const isGainer = type === 'gainers';

    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 mb-4">
                {isGainer ? (
                    <TrendingUp size={18} className="text-emerald-400" />
                ) : (
                    <TrendingDown size={18} className="text-red-400" />
                )}
                <h3 className="font-semibold text-white">{title}</h3>
            </div>
            <div className="space-y-3">
                {stocks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No data available</p>
                ) : (
                    stocks.map((stock, index) => (
                        <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-xs w-4">{index + 1}</span>
                                <div>
                                    <p className="font-medium text-white">{stock.symbol}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[100px]">{stock.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-white">₹{stock.price?.toFixed(2)}</p>
                                <p className={`text-xs ${isGainer ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isGainer ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

/**
 * ====================================================================
 * HALAL PICKS PANEL
 * ====================================================================
 */
const HalalPicksPanel = ({ picks }) => {
    return (
        <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/50 rounded-xl border border-emerald-500/30 p-4">
            <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-emerald-400" />
                <h3 className="font-semibold text-white">Halal Buy Signals</h3>
            </div>
            <div className="space-y-3">
                {picks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No active buy signals</p>
                ) : (
                    picks.map((stock) => (
                        <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-emerald-500/20 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Zap size={14} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{stock.symbol}</p>
                                    <p className="text-xs text-gray-400">RSI: {stock.rsi?.toFixed(1)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">
                                    {stock.signal}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

/**
 * ====================================================================
 * ACTIVE ALERTS PANEL
 * ====================================================================
 */
const AlertsPanel = ({ alerts }) => {
    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-amber-400" />
                <h3 className="font-semibold text-white">Active Alerts</h3>
            </div>
            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <p className="text-gray-500 text-sm">No active alerts</p>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className={`flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0 ${alert.triggeredAt ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${alert.active ? 'bg-amber-400' : 'bg-gray-500'}`} />
                                <div>
                                    <p className="font-medium text-white">{alert.symbol}</p>
                                    <p className="text-xs text-gray-400">{alert.condition} ₹{alert.targetPrice}</p>
                                </div>
                            </div>
                            {alert.triggeredAt && (
                                <span className="text-xs text-emerald-400">Triggered</span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

/**
 * ====================================================================
 * SECTOR BREAKDOWN
 * ====================================================================
 */
const SectorBreakdown = ({ sectors }) => {
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-red-500', 'bg-cyan-500'];

    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 mb-4">
                <PieChart size={18} className="text-blue-400" />
                <h3 className="font-semibold text-white">Sector Breakdown</h3>
            </div>
            <div className="space-y-3">
                {sectors.map((sector, index) => (
                    <div key={sector.sector} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{sector.sector}</span>
                                <span className="text-gray-400">{sector.count}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * ====================================================================
 * MINI PERFORMANCE CHART (Simple CSS-based)
 * ====================================================================
 */
const MiniPerformanceChart = ({ dataPoints, changePercent }) => {
    if (!dataPoints || dataPoints.length < 2) {
        return <div className="h-20 flex items-center justify-center text-gray-500">No data</div>;
    }

    const values = dataPoints.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const isPositive = changePercent >= 0;

    return (
        <div className="h-20 flex items-end gap-[2px]">
            {dataPoints.slice(-30).map((point, index) => {
                const height = ((point.value - min) / range) * 100;
                return (
                    <div
                        key={index}
                        className={`flex-1 rounded-t transition-all ${isPositive ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${point.date}: ₹${point.value.toFixed(0)}`}
                    />
                );
            })}
        </div>
    );
};

/**
 * ====================================================================
 * MAIN DASHBOARD COMPONENT
 * ====================================================================
 */
const Dashboard = ({ onNavigateToScanner }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('1m');

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const [dashRes, perfRes] = await Promise.all([
                fetch(API.DASHBOARD),
                fetch(API.DASHBOARD_PERFORMANCE(selectedPeriod))
            ]);

            if (!dashRes.ok) throw new Error('Failed to fetch dashboard');

            const dashData = await dashRes.json();
            const perfData = await perfRes.json();

            setDashboardData(dashData);
            setPerformanceData(perfData);
            setError(null);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [fetchDashboard]);

    if (loading && !dashboardData) {
        return <DashboardSkeleton />;
    }

    if (error && !dashboardData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertTriangle size={32} className="text-amber-400 mx-auto mb-4" />
                    <p className="text-gray-400">{error}</p>
                    <button
                        onClick={fetchDashboard}
                        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { portfolio, market, stats, topMovers, halalPicks, alerts, communityTrends } = dashboardData || {};

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 text-sm">Your trading overview at a glance</p>
                </div>
                <div className="flex items-center gap-3">
                    {market && (
                        <MarketStatusBadge
                            status={market.status}
                            message={market.message}
                            time={market.time}
                        />
                    )}
                    <button
                        onClick={fetchDashboard}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-gray-400 hover:text-white"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Portfolio Value"
                    value={`₹${(portfolio?.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    subtitle={`Invested: ₹${(portfolio?.totalInvested || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    icon={DollarSign}
                    trend={portfolio?.todayPnL >= 0 ? 'up' : 'down'}
                    trendValue={`${portfolio?.todayPnLPercent?.toFixed(2) || 0}%`}
                    color="emerald"
                />
                <StatCard
                    title="Today's P&L"
                    value={`${portfolio?.todayPnL >= 0 ? '+' : ''}₹${(portfolio?.todayPnL || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    subtitle={`${portfolio?.holdingsCount || 0} holdings`}
                    icon={Activity}
                    color={portfolio?.todayPnL >= 0 ? 'emerald' : 'red'}
                />
                <StatCard
                    title="Halal Stocks"
                    value={`${stats?.halalStocks || 0} / ${stats?.totalStocks || 0}`}
                    subtitle="Shariah compliant"
                    icon={ShieldCheck}
                    color="blue"
                />
                <StatCard
                    title="Watchlist & Alerts"
                    value={`${stats?.watchlistCount || 0} | ${stats?.activeAlerts || 0}`}
                    subtitle="Watching | Active alerts"
                    icon={Star}
                    color="amber"
                />
            </div>

            {/* Analytics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WinRateWidget />
                <RiskMetricsWidget />
            </div>

            {/* Performance Chart Section */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <BarChart2 size={18} className="text-emerald-400" />
                        <h3 className="font-semibold text-white">Portfolio Performance</h3>
                    </div>
                    <div className="flex gap-2">
                        {['1w', '1m', '3m', '6m', '1y'].map(period => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1 rounded text-xs font-medium transition ${selectedPeriod === period
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                {period.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6 mb-4">
                    <div>
                        <p className="text-gray-400 text-sm">Current Value</p>
                        <p className="text-xl font-bold text-white">
                            ₹{(performanceData?.currentValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Change</p>
                        <p className={`text-xl font-bold ${performanceData?.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {performanceData?.changePercent >= 0 ? '+' : ''}{performanceData?.changePercent?.toFixed(2) || 0}%
                        </p>
                    </div>
                </div>
                <MiniPerformanceChart
                    dataPoints={performanceData?.dataPoints || []}
                    changePercent={performanceData?.changePercent || 0}
                />
            </div>

            {/* Three Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Top Gainers */}
                <TopMoversList
                    title="Top Gainers"
                    stocks={topMovers?.gainers || []}
                    type="gainers"
                />

                {/* Top Losers */}
                <TopMoversList
                    title="Top Losers"
                    stocks={topMovers?.losers || []}
                    type="losers"
                />

                {/* Halal Picks */}
                <HalalPicksPanel picks={halalPicks || []} />
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Community Trends - NEW */}
                <CommunityTrendsWidget trends={communityTrends || []} />

                {/* Active Alerts */}
                <AlertsPanel alerts={alerts || []} />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={onNavigateToScanner}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium"
                >
                    <Activity size={18} />
                    Go to Scanner
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
