import React, { useState, lazy, Suspense } from 'react';
import { AlertTriangle, Activity, Radio, BarChart2, Newspaper, Bot, Loader } from 'lucide-react';
import { MAX_DEBT_RATIO, MAX_CASH_RATIO } from '../../data/stockData';
import { BacktestModal, BacktestButton } from '../backtest/Backtest';
import { NewsPanel } from './NewsPanel';
import { AIAnalystModal } from './AIAnalyst';

// Lazy load the AdvancedChart to defer loading heavy chart libraries (recharts + lightweight-charts)
const AdvancedChart = lazy(() => import('../common/AdvancedChart'));

// Chart loading placeholder
const ChartLoadingSkeleton = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden" style={{ height: 280 }}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-700/50">
            <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse"></div>
            <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-700/50 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
        </div>
        <div className="flex items-center justify-center h-48">
            <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
    </div>
);

/**
 * Stock Detail Panel - Shows Shariah compliance, chart, and technical analysis
 */
export const StockDetailPanel = ({ stock, wsConnected }) => {
    const [backtestOpen, setBacktestOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('news'); // Default to News to match screenshot for first impression
    const [aiOpen, setAiOpen] = useState(false);

    if (!stock) return null;

    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{stock.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-sm font-medium">{stock.sector}</span>
                        <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                            {stock.symbol}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-white tracking-tight flex items-center justify-end gap-3">
                        ₹{(stock.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => setAiOpen(true)}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all hover:scale-105"
                        >
                            <Bot className="w-3.5 h-3.5" /> Ask AI
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Modal */}
            <AIAnalystModal
                isOpen={aiOpen}
                onClose={() => setAiOpen(false)}
                stock={stock}
            />

            {/* Advanced TradingView-style Chart - Lazy loaded */}
            <div className="mb-6">
                <Suspense fallback={<ChartLoadingSkeleton />}>
                    <AdvancedChart
                        symbol={stock.symbol}
                        height={280}
                        showVolume={true}
                        showIndicators={true}
                        defaultPeriod="1y"
                    />
                </Suspense>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'analysis'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <BarChart2 className="w-4 h-4" /> Analysis
                </button>
                <button
                    onClick={() => setActiveTab('news')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'news'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <Newspaper className="w-4 h-4" /> News
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'analysis' ? (
                    <div className="space-y-6 animate-fade-in">
                        <ShariahReport stock={stock} />

                        {stock.shariahStatus === 'Halal' ? (
                            <>
                                <TechnicalAnalysis stock={stock} />
                                <div className="mt-4">
                                    <BacktestButton onClick={() => setBacktestOpen(true)} />
                                </div>
                            </>
                        ) : (
                            <div className="bg-red-900/10 border border-red-900/50 p-4 rounded-lg flex items-center gap-3 text-red-200">
                                <AlertTriangle className="w-5 h-5" />
                                <p className="text-sm">Analysis disabled for Non-Halal stock.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                            <Newspaper className="w-4 h-4 text-blue-400" />
                            <h3 className="font-bold text-white">Recent News</h3>
                        </div>

                        {/* Mock News Items to match visual reference */}
                        <NewsItem
                            source="Yahoo Finance"
                            date="2026-01-08 11:46"
                            title={`${stock.name}, AWS partner to drive enterprise GenAI adoption`}
                        />
                        <NewsItem
                            source="Yahoo Finance"
                            date="2026-01-07 15:43"
                            title="Asian Equities Traded in the US as American Depositary Receipts Decline"
                        />
                        <NewsItem
                            source="Yahoo Finance"
                            date="2025-12-29 15:44"
                            title={`${stock.symbol} leads sector gains on strong quarterly volume growth`}
                        />
                    </div>
                )}
            </div>

            {/* Backtest Modal */}
            <BacktestModal
                isOpen={backtestOpen}
                onClose={() => setBacktestOpen(false)}
                stock={stock}
            />
        </div>
    );
};

/**
 * Shariah Compliance Report Component
 */
const ShariahReport = ({ stock }) => {
    const debtRatio = stock.financials?.debtToMcap
        ? stock.financials.debtToMcap * 100
        : stock.shariah?.debtRatio || 0;

    const cashRatio = stock.financials?.cashToMcap
        ? stock.financials.cashToMcap * 100
        : stock.shariah?.cashRatio || 0;

    return (
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Shariah Compliance Report
            </h3>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Business Activity</span>
                    <span className={
                        stock.shariahStatus === 'Non-Halal' && stock.shariahReason?.includes('Sector')
                            ? 'text-red-400' : 'text-emerald-400'
                    }>
                        {stock.shariahStatus === 'Non-Halal' && stock.shariahReason?.includes('Sector') ? 'Fail' : 'Pass'}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Debt to Market Cap</span>
                    <span className={debtRatio > 30 ? 'text-red-400' : 'text-emerald-400'}>
                        {debtRatio.toFixed(1)}%
                        {debtRatio > 30 ? ' (>30%)' : ' (Pass)'}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cash to Market Cap</span>
                    <span className={cashRatio > 30 ? 'text-yellow-400' : 'text-emerald-400'}>
                        {cashRatio.toFixed(1)}%
                    </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
                    <span className="font-bold text-gray-300">Final Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${stock.shariahStatus === 'Halal' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                        {stock.shariahStatus.toUpperCase()}
                    </span>
                </div>
                {stock.shariahStatus !== 'Halal' && (
                    <div className="text-xs text-red-300 mt-2 bg-red-900/20 p-2 rounded">
                        Reason: {stock.shariahReason}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Technical Analysis Component
 */
const TechnicalAnalysis = ({ stock }) => {
    if (!stock?.technicals) {
        return (
            <div className="p-4 rounded-lg bg-gray-800 border-dashed border border-gray-600 text-center">
                <p className="text-gray-400 text-sm">Technical analysis temporarily unavailable</p>
            </div>
        );
    }

    const { signal, signalStrength, sl, tp, gain } = stock.technicals;
    const safeSignal = signal || 'Hold';

    return (
        <div className="space-y-4">
            {/* Signal Card */}
            <div className={`p-4 rounded-lg border flex items-center justify-between ${safeSignal === 'Buy'
                ? 'bg-blue-900/20 border-blue-500/50'
                : 'bg-gray-700/20 border-gray-600'
                }`}>
                <div>
                    <p className="text-xs text-gray-400 uppercase">Algo Signal</p>
                    <p className={`text-xl font-bold ${safeSignal === 'Buy' ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                        {safeSignal.toUpperCase()}
                    </p>
                </div>
                {safeSignal === 'Buy' && (
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase">Confidence</p>
                        <p className="text-xl font-bold text-white">{signalStrength || 0}%</p>
                    </div>
                )}
            </div>

            {/* Trade Setup */}
            {safeSignal === 'Buy' && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3 text-yellow-400">
                        <Activity className="w-4 h-4" />
                        <span className="font-bold text-sm uppercase">Trade Setup</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-800 p-2 rounded">
                            <div className="text-xs text-gray-500">Entry</div>
                            <div className="font-mono text-white">₹{stock.price?.toFixed(0)}</div>
                        </div>
                        <div className="bg-red-900/20 p-2 rounded border border-red-900/30">
                            <div className="text-xs text-red-400">Stop Loss</div>
                            <div className="font-mono text-red-200">₹{sl}</div>
                        </div>
                        <div className="bg-emerald-900/20 p-2 rounded border border-emerald-900/30">
                            <div className="text-xs text-emerald-400">Target</div>
                            <div className="font-mono text-emerald-200">₹{tp}</div>
                        </div>
                    </div>

                    <div className="mt-3 text-center">
                        <span className="text-xs text-gray-500">Potential Gain: </span>
                        <span className="text-sm font-bold text-emerald-400">+{gain}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockDetailPanel;

const NewsItem = ({ source, date, title }) => (
    <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 hover:border-gray-700 hover:bg-gray-800/40 transition-all cursor-pointer group">
        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold tracking-wider text-blue-400 uppercase">
            <span>{source}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-500">{date}</span>
        </div>
        <h4 className="text-sm font-medium text-gray-200 leading-snug group-hover:text-white transition-colors">
            {title}
        </h4>
    </div>
);
