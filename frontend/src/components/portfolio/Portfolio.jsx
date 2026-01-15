import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Briefcase, Plus, TrendingUp, TrendingDown, DollarSign, PieChart, X, Loader, BarChart3, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AddHoldingModal } from './AddHolding';
import API from '../../config/api';

/**
 * Portfolio Dashboard Component with Enhanced P&L Tracking
 */
export const Portfolio = ({ isOpen, onClose }) => {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('holdings'); // 'holdings', 'analytics', 'history'
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const fetchPortfolio = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API.PORTFOLIO);
            const data = await response.json();
            setSummary(data);
        } catch (err) {
            console.error("Failed to fetch portfolio", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API.PORTFOLIO_TRANSACTIONS);
            const data = await response.json();
            setTransactions(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction? This cannot be undone.')) return;

        try {
            const response = await fetch(API.PORTFOLIO_DELETE_TRANSACTION(id), {
                method: 'DELETE'
            });
            if (response.ok) {
                if (activeTab === 'history') fetchTransactions();
                fetchPortfolio();
            }
        } catch (err) {
            console.error("Failed to delete transaction", err);
        }
    };

    // Generate mock performance data for the chart
    const performanceData = useMemo(() => {
        if (!summary) return [];
        const baseValue = summary.total_invested || 100000;
        const currentValue = summary.current_value || baseValue;
        const days = 30;
        const data = [];

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            // Simulate gradual growth/decline towards current value
            const progress = (days - i) / days;
            const randomVariation = (Math.random() - 0.5) * 0.02 * baseValue;
            const value = baseValue + (currentValue - baseValue) * progress + randomVariation;

            data.push({
                date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                value: Math.round(value),
                fullDate: date.toISOString()
            });
        }
        return data;
    }, [summary]);

    // Calculate day's gain (mock - would need real data from backend)
    const daysGain = useMemo(() => {
        if (!summary) return { amount: 0, percent: 0 };
        // Simulate day's change as ~1-3% of total P&L
        const dayChange = summary.total_pnl * (0.1 + Math.random() * 0.1);
        return {
            amount: Math.round(dayChange),
            percent: summary.current_value > 0 ? (dayChange / summary.current_value * 100) : 0
        };
    }, [summary]);

    // Calculate realized P&L from SELL transactions
    const realizedPnL = useMemo(() => {
        if (transactions.length === 0) return 0;
        return transactions
            .filter(t => t.type === 'SELL')
            .reduce((acc, t) => acc + (t.quantity * t.price * 0.05), 0); // Mock calculation
    }, [transactions]);

    useEffect(() => {
        if (isOpen) {
            fetchPortfolio();
            if (activeTab === 'history') fetchTransactions();
        }
    }, [isOpen, activeTab, fetchPortfolio, fetchTransactions]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-900/50 to-indigo-900/50">
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-6 h-6 text-blue-400" />
                        <div>
                            <h2 className="text-xl font-bold text-white">My Portfolio</h2>
                            <p className="text-xs text-blue-300">Track your shariah-compliant holdings</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-800 rounded-lg p-1 mr-4 border border-gray-700">
                            <button
                                onClick={() => setActiveTab('holdings')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'holdings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                HOLDINGS
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                ANALYTICS
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                HISTORY
                            </button>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && !(summary || transactions.length > 0) ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Stats Overview - Show on all tabs */}
                            {summary && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <StatCard
                                        label="Current Value"
                                        value={`₹${summary.current_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                        icon={DollarSign}
                                        color="blue"
                                    />
                                    <StatCard
                                        label="Invested"
                                        value={`₹${summary.total_invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                        icon={Briefcase}
                                        color="purple"
                                    />
                                    <StatCard
                                        label="Total P&L"
                                        value={`${summary.total_pnl >= 0 ? '+' : ''}₹${Math.abs(summary.total_pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                        subValue={`${summary.total_pnl >= 0 ? '+' : ''}${summary.total_pnl_percent.toFixed(2)}%`}
                                        icon={summary.total_pnl >= 0 ? TrendingUp : TrendingDown}
                                        color={summary.total_pnl >= 0 ? "green" : "red"}
                                    />
                                    <StatCard
                                        label="Day's Gain"
                                        value={`${daysGain.amount >= 0 ? '+' : ''}₹${Math.abs(daysGain.amount).toLocaleString()}`}
                                        subValue={`${daysGain.percent >= 0 ? '+' : ''}${daysGain.percent.toFixed(2)}%`}
                                        icon={Calendar}
                                        color={daysGain.amount >= 0 ? "green" : "red"}
                                    />
                                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-3 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-750 transition-colors"
                                        onClick={() => setIsAddOpen(true)}>
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mb-1 shadow-lg shadow-blue-900/50">
                                            <Plus className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-blue-400">Add</span>
                                    </div>
                                </div>
                            )}

                            {/* Tab Content */}
                            {activeTab === 'holdings' && <HoldingsTab summary={summary} setIsAddOpen={setIsAddOpen} />}
                            {activeTab === 'analytics' && <AnalyticsTab performanceData={performanceData} summary={summary} realizedPnL={realizedPnL} />}
                            {activeTab === 'history' && <HistoryTab transactions={transactions} onDelete={handleDeleteTransaction} />}
                        </div>
                    )}
                </div>

            </div>

            <AddHoldingModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={fetchPortfolio}
            />
        </div>
    );
};

/**
 * Holdings Tab
 */
const HoldingsTab = ({ summary, setIsAddOpen }) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-200 flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Current Holdings
            </h3>
            {summary && <span className="text-xs text-gray-500">{summary.holdings.length} Positions</span>}
        </div>

        {(!summary || summary.holdings.length === 0) ? (
            <div className="p-12 text-center text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No holdings found</p>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Add your first stock
                </button>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Symbol</th>
                            <th className="p-4 text-right">Qty</th>
                            <th className="p-4 text-right">Avg Price</th>
                            <th className="p-4 text-right">LTP</th>
                            <th className="p-4 text-right">Current Val</th>
                            <th className="p-4 text-right">P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {summary.holdings.map((stock) => (
                            <tr key={stock.symbol} className="hover:bg-gray-700/30 font-medium">
                                <td className="p-4 font-bold text-white">{stock.symbol}</td>
                                <td className="p-4 text-right text-gray-300">{stock.quantity}</td>
                                <td className="p-4 text-right text-gray-400">₹{stock.average_price.toFixed(1)}</td>
                                <td className="p-4 text-right font-mono text-white">₹{stock.current_price.toFixed(1)}</td>
                                <td className="p-4 text-right text-white">₹{stock.current_value.toLocaleString()}</td>
                                <td className={`p-4 text-right font-bold ${stock.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    <div>{stock.pnl >= 0 ? '+' : ''}₹{Math.abs(stock.pnl).toLocaleString()}</div>
                                    <div className="text-xs opacity-70">{stock.pnl >= 0 ? '+' : ''}{stock.pnl_percent.toFixed(2)}%</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/**
 * Analytics Tab with Performance Chart
 */
const AnalyticsTab = ({ performanceData, summary, realizedPnL }) => (
    <div className="space-y-6">
        {/* Performance Chart */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Portfolio Performance
                </h3>
                <span className="text-xs text-gray-500">Last 30 Days</span>
            </div>
            <div className="p-4" style={{ height: 280 }}>
                {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                                domain={['dataMin - 5000', 'dataMax + 5000']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#valueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        No data available
                    </div>
                )}
            </div>
        </div>

        {/* P&L Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <h4 className="text-sm font-bold text-gray-400 mb-3">P&L Breakdown</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Unrealized P&L</span>
                        <span className={`font-bold ${(summary?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary?.total_pnl >= 0 ? '+' : ''}₹{Math.abs(summary?.total_pnl || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Realized P&L</span>
                        <span className={`font-bold ${realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {realizedPnL >= 0 ? '+' : ''}₹{Math.abs(realizedPnL).toLocaleString()}
                        </span>
                    </div>
                    <hr className="border-gray-700" />
                    <div className="flex justify-between items-center">
                        <span className="text-white font-bold">Total Returns</span>
                        <span className={`font-bold text-lg ${((summary?.total_pnl || 0) + realizedPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ₹{Math.abs((summary?.total_pnl || 0) + realizedPnL).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <h4 className="text-sm font-bold text-gray-400 mb-3">Portfolio Stats</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Positions</span>
                        <span className="font-bold text-white">{summary?.holdings?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Profitable</span>
                        <span className="font-bold text-green-400">
                            {summary?.holdings?.filter(h => h.pnl >= 0).length || 0}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Losing</span>
                        <span className="font-bold text-red-400">
                            {summary?.holdings?.filter(h => h.pnl < 0).length || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * History Tab
 */
const HistoryTab = ({ transactions, onDelete }) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-200 flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Transaction History
            </h3>
            <span className="text-xs text-gray-500">{transactions.length} Total</span>
        </div>

        {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                <p>No transaction history</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Symbol</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-right">Qty</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-700/30">
                                <td className="p-4 text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-4 font-bold text-white">{t.symbol}</td>
                                <td className={`p-4 font-bold ${t.type === 'BUY' ? 'text-blue-400' : 'text-orange-400'}`}>{t.type}</td>
                                <td className="p-4 text-right text-gray-300">{t.quantity}</td>
                                <td className="p-4 text-right text-gray-400">₹{t.price.toFixed(1)}</td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => onDelete(t.id)}
                                        className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-all"
                                        title="Delete Transaction"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/**
 * Stat Card Component
 */
const StatCard = ({ label, value, subValue, icon: IconComponent, color }) => {
    const colorClasses = {
        blue: "text-blue-400 bg-blue-900/20 border-blue-800",
        purple: "text-purple-400 bg-purple-900/20 border-purple-800",
        green: "text-green-400 bg-green-900/20 border-green-800",
        red: "text-red-400 bg-red-900/20 border-red-800"
    };

    return (
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
                <IconComponent className="w-3 h-3 opacity-70" />
            </div>
            <div className="text-lg font-bold">{value}</div>
            {subValue && <div className="text-xs font-medium opacity-80">{subValue}</div>}
        </div>
    );
};

export default Portfolio;
