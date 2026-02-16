import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, TrendingDown, Radio, Wifi, ChevronUp, ChevronDown } from 'lucide-react';
import { Sparkline } from '../common/Sparkline';
import { WatchlistButton } from './Watchlist';

// Row height for virtualization
const ROW_HEIGHT = 72;
// Number of rows to render outside visible area
const OVERSCAN = 5;

/**
 * Stock Table Component - Simple virtualization for performance
 */
export const StockTable = ({
    stocks = [],
    selectedStock,
    onSelectStock,
    wsConnected,
    isInWatchlist,
    onToggleWatchlist
}) => {
    const containerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(600);
    const [sortConfig, setSortConfig] = useState({ key: 'signal', direction: 'asc' });

    // Handle sort
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Sort stocks
    const sortedStocks = useMemo(() => {
        if (!stocks) return [];
        const sorted = [...stocks];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'symbol':
                        aValue = a.symbol;
                        bValue = b.symbol;
                        break;
                    case 'price':
                        aValue = a.price;
                        bValue = b.price;
                        break;
                    case 'change':
                        aValue = a.priceChangePercent;
                        bValue = b.priceChangePercent;
                        break;
                    case 'rsi':
                        aValue = parseFloat(a.technicals?.rsi || 0);
                        bValue = parseFloat(b.technicals?.rsi || 0);
                        break;
                    case 'shariah':
                        aValue = a.shariahStatus === 'Halal' ? 1 : 0;
                        bValue = b.shariahStatus === 'Halal' ? 1 : 0;
                        break;
                    case 'signal': {
                        const signalScore = { 'Buy': 3, 'Wait': 2, 'Sell': 1 };
                        aValue = signalScore[a.technicals?.signal] || 0;
                        bValue = signalScore[b.technicals?.signal] || 0;
                        break;
                    }
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [stocks, sortConfig]);

    // Handle scroll
    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);

    // Measure container height on mount
    useEffect(() => {
        if (containerRef.current) {
            setContainerHeight(containerRef.current.clientHeight);
        }
    }, []);

    // Calculate visible range
    const totalHeight = sortedStocks.length * ROW_HEIGHT;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
        sortedStocks.length,
        Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
    );

    // Get visible stocks
    const visibleStocks = sortedStocks.slice(startIndex, endIndex);

    return (
        <div className="lg:col-span-7 glass-card rounded-xl overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-gray-800/80 to-gray-900/80">
                <h2 className="font-bold text-lg flex items-center gap-2 text-white">
                    {wsConnected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-glow shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    )}
                    Market Scanner
                </h2>
                <div className="flex items-center gap-3">
                    {wsConnected && (
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-900/50">
                            <Wifi className="w-3 h-3 animate-pulse" /> Streaming
                        </span>
                    )}
                    <span className="text-xs font-medium text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800">
                        RSI + SMA50
                    </span>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {stocks.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4 border border-gray-700/50">
                            <Radio className="w-8 h-8 opacity-30" />
                        </div>
                        <p className="text-gray-400 font-medium">
                            Ready to Scan
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Click Scan to begin
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Column Headers - Responsive */}
                        <div className="flex items-center py-3 px-2 text-gray-500 uppercase text-[11px] tracking-wider font-semibold bg-gray-900/90 border-b border-gray-800/50 sticky top-0 z-10 min-w-[600px] lg:min-w-0">
                            <div className="w-12 flex-shrink-0"></div>
                            <SortableHeader label="Stock" sortKey="symbol" currentSort={sortConfig} onSort={handleSort} className="flex-1 min-w-[100px] px-2 md:px-3 cursor-pointer hover:text-white transition-colors" />
                            <SortableHeader label="Price" sortKey="price" currentSort={sortConfig} onSort={handleSort} className="w-24 md:w-28 px-2 md:px-3 cursor-pointer hover:text-white transition-colors" />
                            <div className="w-24 md:w-28 px-2 md:px-3 text-center hidden sm:block">Trend</div>
                            <SortableHeader label="Shariah" sortKey="shariah" currentSort={sortConfig} onSort={handleSort} className="w-20 md:w-24 px-2 md:px-3 text-center cursor-pointer hover:text-white transition-colors" />
                            <SortableHeader label="RSI" sortKey="rsi" currentSort={sortConfig} onSort={handleSort} className="w-14 md:w-16 px-2 md:px-3 text-center cursor-pointer hover:text-white transition-colors hidden sm:block" />
                            <SortableHeader label="Signal" sortKey="signal" currentSort={sortConfig} onSort={handleSort} className="w-20 md:w-24 px-2 md:px-3 text-right cursor-pointer hover:text-white transition-colors" />
                        </div>

                        {/* Virtualized Scroll Container */}
                        <div
                            ref={containerRef}
                            onScroll={handleScroll}
                            className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1"
                            style={{ minHeight: 0 }}
                        >
                            {/* Spacer for total scrollable height - Ensure min-width for horizontal scroll on mobile */}
                            <div style={{ height: totalHeight, position: 'relative', minWidth: '600px' }} className="lg:min-w-0">
                                {/* Only render visible rows */}
                                {visibleStocks.map((stock, i) => {
                                    const actualIndex = startIndex + i;
                                    return (
                                        <StockRow
                                            key={stock.symbol}
                                            stock={stock}
                                            isSelected={selectedStock?.symbol === stock.symbol}
                                            onSelect={() => onSelectStock(stock)}
                                            isWatched={isInWatchlist?.(stock.symbol)}
                                            onToggleWatchlist={() => onToggleWatchlist?.(stock)}
                                            style={{
                                                position: 'absolute',
                                                top: actualIndex * ROW_HEIGHT,
                                                left: 0,
                                                right: 0,
                                                height: ROW_HEIGHT
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const SortableHeader = ({ label, sortKey, currentSort, onSort, className }) => (
    <div className={`${className} flex items-center gap-1 select-none`} onClick={() => onSort(sortKey)}>
        {label}
        <div className="flex flex-col">
            <ChevronUp size={8} className={`${currentSort.key === sortKey && currentSort.direction === 'asc' ? 'text-emerald-400' : 'text-gray-700'}`} />
            <ChevronDown size={8} className={`${currentSort.key === sortKey && currentSort.direction === 'desc' ? 'text-emerald-400' : 'text-gray-700'}`} />
        </div>
    </div>
);

/**
 * Individual Stock Row - Memoized for performance
 */
const StockRow = memo(({ stock, isSelected, onSelect, isWatched, onToggleWatchlist, style }) => (
    <div
        style={style}
        onClick={onSelect}
        className={`
            flex items-center cursor-pointer transition-all duration-200 group border-b border-gray-800/30
            ${isSelected
                ? 'bg-blue-900/20 border-l-4 border-l-blue-500 shadow-lg shadow-blue-900/10'
                : 'hover:bg-gray-800/40 border-l-4 border-l-transparent hover:border-l-gray-700'}
        `}
    >
        {/* Watchlist */}
        <div className="w-12 flex-shrink-0 flex items-center justify-center">
            <WatchlistButton
                isWatched={isWatched}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist?.();
                }}
                size="sm"
            />
        </div>

        {/* Stock Name */}
        <div className="flex-1 min-w-[100px] px-2 md:px-3">
            <div className="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">
                {stock.symbol}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wide truncate max-w-[140px]">
                {stock.name}
            </div>
        </div>

        {/* Price */}
        <div className="w-24 md:w-28 px-2 md:px-3">
            <div className="font-mono text-[15px] font-medium text-gray-200">
                ₹{Number(stock.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {stock.priceChangePercent !== undefined && (
                <div className={`text-[11px] font-medium mt-1 ${stock.priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.priceChange >= 0 ? '+' : ''}{stock.priceChangePercent?.toFixed(2)}%
                </div>
            )}
        </div>

        {/* Trend Sparkline */}
        <div className="w-24 md:w-28 px-2 md:px-3 flex justify-center hidden sm:block">
            <Sparkline
                data={stock.priceHistory}
                width={100}
                height={36}
                color={stock.priceChange >= 0 ? '#10b981' : '#ef4444'}
            />
        </div>

        {/* Shariah Status */}
        <div className="w-20 md:w-24 px-2 md:px-3 flex justify-center">
            <ShariahBadge status={stock.shariahStatus} />
        </div>

        {/* RSI */}
        <div className="w-14 md:w-16 px-2 md:px-3 text-center hidden sm:block">
            <span className={`font-mono font-bold text-sm ${stock.technicals?.rsi < 30 ? 'text-emerald-400' :
                stock.technicals?.rsi > 70 ? 'text-red-400' : 'text-gray-400'
                }`}>
                {stock.technicals?.rsi || '-'}
            </span>
        </div>

        {/* Signal */}
        <div className="w-20 md:w-24 px-2 md:px-3 flex justify-end">
            <SignalBadge signal={stock.technicals?.signal} />
        </div>
    </div>
));

/**
 * Shariah Status Badge
 */
const ShariahBadge = memo(({ status }) => (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex w-fit items-center gap-1 border transition-all ${status === 'Halal' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
        status === 'Non-Halal' ? 'bg-red-500/5 text-red-400 border-red-500/30' :
            'bg-yellow-500/5 text-yellow-400 border-yellow-500/30'
        }`}>
        {status === 'Halal' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
        {status?.toUpperCase()}
    </span>
));

/**
 * Trading Signal Badge
 */
const SignalBadge = memo(({ signal }) => {
    if (signal === 'Buy') {
        return (
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                <TrendingUp className="w-3 h-3" /> BUY
            </span>
        );
    }
    if (signal === 'Sell') {
        return (
            <span className="text-red-400 font-bold text-xs flex items-center gap-1 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                <TrendingDown className="w-3 h-3" /> SELL
            </span>
        );
    }
    return <span className="text-gray-600 font-bold text-xs uppercase tracking-wider">Wait</span>;
});

export default StockTable;
