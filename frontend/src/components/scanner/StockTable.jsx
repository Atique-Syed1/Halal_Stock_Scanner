import React from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, TrendingDown, Radio, Wifi } from 'lucide-react';
import { LivePriceCell } from '../common/LivePriceCell';
import { Sparkline } from '../common/Sparkline';
import { WatchlistButton } from './Watchlist';

/**
 * Stock Table Component - Displays list of stocks with prices, charts, and signals
 */
export const StockTable = ({
    stocks,
    selectedStock,
    onSelectStock,
    previousPrices,
    useLiveMode,
    wsConnected,
    // Watchlist props
    isInWatchlist,
    onToggleWatchlist
}) => {
    // Sort: Buy signals first
    const sortedStocks = [...stocks].sort((a, b) => {
        const signalA = a?.technicals?.signal;
        const signalB = b?.technicals?.signal;
        if (signalA === 'Buy' && signalB !== 'Buy') return -1;
        if (signalB === 'Buy' && signalA !== 'Buy') return 1;
        return 0;
    });

    return (
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-gray-800/80 to-gray-900/80">
                <h2 className="font-bold text-lg flex items-center gap-2 text-white">
                    {useLiveMode && wsConnected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-glow shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    )}
                    Market Scanner
                </h2>
                <div className="flex items-center gap-3">
                    {useLiveMode && wsConnected && (
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-900/50">
                            <Wifi className="w-3 h-3 animate-pulse" /> Streaming
                        </span>
                    )}
                    <span className="text-xs font-medium text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800">
                        RSI + SMA50
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                {stocks.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4 border border-gray-700/50">
                            <Radio className="w-8 h-8 opacity-30" />
                        </div>
                        <p className="text-gray-400 font-medium">
                            {useLiveMode ? 'Ready to Scan' : 'No Data'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {useLiveMode ? 'Ensure backend is running' : 'Click Scan to begin'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm border-separate border-spacing-y-1 px-2">
                        <thead className="text-gray-500 uppercase text-[11px] tracking-wider font-semibold sticky top-0 backdrop-blur-md bg-gray-900/90 z-10">
                            <tr>
                                <th className="py-4 px-6 w-10"></th>
                                <th className="py-4 px-6">Stock</th>
                                <th className="py-4 px-6">Price <span className="text-emerald-500 ml-1">●</span></th>
                                <th className="py-4 px-6 text-center">Trend</th>
                                <th className="py-4 px-6 text-center">Shariah</th>
                                <th className="py-4 px-6 text-center">RSI</th>
                                <th className="py-4 px-6 text-right">Signal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStocks.map((stock, index) => (
                                <StockRow
                                    key={stock.symbol}
                                    stock={stock}
                                    isSelected={selectedStock?.symbol === stock.symbol}
                                    onSelect={() => onSelectStock(stock)}
                                    previousPrice={previousPrices[stock.symbol]}
                                    isLive={useLiveMode && wsConnected}
                                    isWatched={isInWatchlist?.(stock.symbol)}
                                    onToggleWatchlist={() => onToggleWatchlist?.(stock)}
                                    className={`
                                        cursor-pointer transition-all duration-200 group
                                        animate-enter opacity-0 fill-mode-forwards
                                        ${selectedStock?.symbol === stock.symbol
                                            ? 'bg-blue-900/10 border-l-4 border-blue-500 shadow-lg shadow-blue-900/10'
                                            : 'hover:bg-gray-800/40 border-l-4 border-transparent hover:border-gray-700'}
                                    `}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

/**
 * Individual Stock Row
 */
const StockRow = ({ stock, isSelected, onSelect, previousPrice, isLive, isWatched, onToggleWatchlist, className, style }) => (
    <tr
        onClick={onSelect}
        className={className}
        style={style}
    >
        <td className="py-4 px-4 pl-6">
            <WatchlistButton
                isWatched={isWatched}
                onClick={onToggleWatchlist}
                size="sm"
            />
        </td>
        <td className="py-4 px-6">
            <div className="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">{stock.symbol}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wide truncate max-w-[140px]">{stock.name}</div>
        </td>
        <td className="py-4 px-6">
            <div className="font-mono text-[15px] font-medium text-gray-200">
                ₹{Number(stock.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {stock.priceChangePercent !== undefined && (
                <div className={`text-[11px] font-medium mt-1 ${stock.priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.priceChange >= 0 ? '+' : ''}{stock.priceChangePercent?.toFixed(2)}%
                </div>
            )}
        </td>
        <td className="py-4 px-6 text-center">
            <div className="flex justify-center">
                <Sparkline
                    data={stock.priceHistory}
                    width={100}
                    height={36}
                    color={stock.priceChange >= 0 ? '#10b981' : '#ef4444'}
                />
            </div>
        </td>
        <td className="py-4 px-6 text-center">
            <div className="flex justify-center">
                <ShariahBadge status={stock.shariahStatus} />
            </div>
        </td>
        <td className="py-4 px-6 text-center">
            <div className={`font-mono font-bold text-sm ${stock.technicals?.rsi < 30 ? 'text-emerald-400' :
                stock.technicals?.rsi > 70 ? 'text-red-400' : 'text-gray-400'
                }`}>
                {stock.technicals?.rsi || '-'}
            </div>
        </td>
        <td className="py-4 px-6 text-right">
            <div className="flex justify-end">
                <SignalBadge signal={stock.technicals?.signal} />
            </div>
        </td>
    </tr>
);

/**
 * Shariah Status Badge
 */
const ShariahBadge = ({ status }) => (
    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex w-fit items-center gap-1.5 border transition-all ${status === 'Halal' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
        status === 'Non-Halal' ? 'bg-red-500/5 text-red-400 border-red-500/30' :
            'bg-yellow-500/5 text-yellow-400 border-yellow-500/30'
        }`}>
        {status === 'Halal' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
        {status?.toUpperCase()}
    </span>
);

/**
 * Trading Signal Badge
 */
const SignalBadge = ({ signal }) => {
    if (signal === 'Buy') {
        return (
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 bg-emerald-400/10 px-3 py-1 rounded border border-emerald-400/20">
                <TrendingUp className="w-3.5 h-3.5" /> BUY
            </span>
        );
    }
    if (signal === 'Sell') {
        return (
            <span className="text-red-400 font-bold text-xs flex items-center gap-1.5 bg-red-400/10 px-3 py-1 rounded border border-red-400/20">
                <TrendingDown className="w-3.5 h-3.5" /> SELL
            </span>
        );
    }
    return <span className="text-gray-600 font-bold text-xs uppercase tracking-wider">Wait</span>;
};

export default StockTable;
