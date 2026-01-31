import React, { useState, useRef, lazy, Suspense, useMemo } from 'react';
import Header from '../components/scanner/Header';
import StatsCards from '../components/scanner/StatsCards';
import { StockTable, WatchlistPanel, StockScreenerFilters } from '../components/scanner';
import StockDetailPanel from '../components/scanner/StockDetailPanel';
import EmptyDetailPanel from '../components/scanner/EmptyDetailPanel';
import ErrorBanner from '../components/common/ErrorBanner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { PageLoadingSkeleton, ModalSkeleton } from '../components/common';
import { useWatchlist } from '../hooks/useWatchlist';
import API from '../config/api';
import { filterStocks, initialFilters } from '../utils/stock-filters';

// Lazy load modals
const TelegramSettings = lazy(() => import('../components/settings/TelegramSettings'));
const StockListSettings = lazy(() => import('../components/settings/StockListSettings'));
const CompareStocks = lazy(() => import('../components/scanner/CompareStocks'));

export const ScannerPage = ({
    stocks,
    displayedStocks, // Filtered list
    isScanning,
    handleScan,
    wsConnected,
    wsConnecting,
    lastUpdate,
    priceUpdates,
    errorMsg,
    selectedStock,
    setSelectedStock,
    showHalalOnly,
    setShowHalalOnly,
    // Global Modal Triggers
    onOpenPortfolio,
    onOpenAlerts,
}) => {
    // Local UI State
    const [watchlistOpen, setWatchlistOpen] = useState(false);
    const [telegramOpen, setTelegramOpen] = useState(false);
    const [stockListOpen, setStockListOpen] = useState(false);
    const [compareOpen, setCompareOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Filtering State
    const [filters, setFilters] = useState(initialFilters);

    // Compute filtered stocks
    const filteredStocks = useMemo(() => {
        return filterStocks(displayedStocks || [], filters);
    }, [displayedStocks, filters]);

    // Data State (could be in a hook, but fine here for now)
    const [universeInfo, setUniverseInfo] = useState({ count: 25, name: 'Default' });
    const [telegramEnabled, setTelegramEnabled] = useState(false);
    const detailPanelRef = useRef(null);

    // Watchlist Hook
    const {
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        removeFromWatchlist,
        clearWatchlist,
        watchlistCount
    } = useWatchlist();

    // Fetch scanner specific settings on mount
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [stockRes, tgRes] = await Promise.all([
                    fetch(API.STOCKS_LIST),
                    fetch(API.TELEGRAM_CONFIG)
                ]);
                const stockData = await stockRes.json();
                const tgData = await tgRes.json();
                setUniverseInfo(stockData);
                setTelegramEnabled(tgData.enabled && tgData.configured);
            } catch (err) {
                // Silent fail, use defaults
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="animate-fade-in">
            {/* SCANNER HEADER */}
            <Header
                showHalalOnly={showHalalOnly}
                setShowHalalOnly={setShowHalalOnly}
                isScanning={isScanning}
                handleScan={handleScan}
                wsConnected={wsConnected}
                wsConnecting={wsConnecting}
                lastUpdate={lastUpdate}
                watchlistCount={watchlistCount}
                onOpenWatchlist={() => setWatchlistOpen(true)}
                telegramEnabled={telegramEnabled}
                onOpenTelegram={() => setTelegramOpen(true)}
                stockListCount={universeInfo.count}
                onOpenStockList={() => setStockListOpen(true)}
                onOpenPortfolio={onOpenPortfolio}
                onOpenAlerts={onOpenAlerts}
                onOpenCompare={() => setCompareOpen(true)}
                onOpenFilters={() => setFiltersOpen(!filtersOpen)}
                isFiltersOpen={filtersOpen}
                stocks={stocks}
            />

            {/* ADVANCED FILTERS */}
            <StockScreenerFilters
                isOpen={filtersOpen}
                onToggle={() => setFiltersOpen(false)}
                stocks={displayedStocks}
                filters={filters}
                onFilterChange={setFilters}
            />

            {/* ERROR MESSAGE */}
            {errorMsg && <ErrorBanner message={errorMsg} />}

            {/* STATS CARDS */}
            <StatsCards
                stocks={stocks}
                wsConnected={wsConnected}
                priceUpdates={priceUpdates}
            />

            {/* MAIN GRID */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <StockTable
                    stocks={filteredStocks}
                    selectedStock={selectedStock}
                    onSelectStock={(stock) => {
                        setSelectedStock(stock);
                        // Scroll to detail panel on mobile
                        if (window.innerWidth < 1024 && detailPanelRef.current) {
                            setTimeout(() => {
                                detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                        }
                    }}
                    wsConnected={wsConnected}
                    isInWatchlist={isInWatchlist}
                    onToggleWatchlist={toggleWatchlist}
                />

                <div className="flex flex-col gap-4" ref={detailPanelRef}>
                    {selectedStock ? (
                        <ErrorBoundary>
                            <Suspense fallback={<PageLoadingSkeleton />}>
                                <StockDetailPanel
                                    stock={selectedStock}
                                    wsConnected={wsConnected}
                                />
                            </Suspense>
                        </ErrorBoundary>
                    ) : (
                        <EmptyDetailPanel />
                    )}
                </div>
            </div>

            {/* LOCAL MODALS */}
            <WatchlistPanel
                isOpen={watchlistOpen}
                onClose={() => setWatchlistOpen(false)}
                watchlist={watchlist}
                stocks={stocks}
                onRemove={removeFromWatchlist}
                onSelectStock={setSelectedStock}
                onClear={clearWatchlist}
            />

            {telegramOpen && (
                <Suspense fallback={<ModalSkeleton />}>
                    <ErrorBoundary minimal>
                        <TelegramSettings
                            isOpen={telegramOpen}
                            onClose={() => setTelegramOpen(false)}
                        />
                    </ErrorBoundary>
                </Suspense>
            )}

            {stockListOpen && (
                <Suspense fallback={<ModalSkeleton />}>
                    <ErrorBoundary minimal>
                        <StockListSettings
                            isOpen={stockListOpen}
                            onClose={() => setStockListOpen(false)}
                            onListChange={async () => {
                                try {
                                    const res = await fetch(API.STOCKS_LIST);
                                    const data = await res.json();
                                    setUniverseInfo(data);
                                } catch (err) {
                                    // Silent fail
                                }
                            }}
                        />
                    </ErrorBoundary>
                </Suspense>
            )}

            {compareOpen && (
                <Suspense fallback={<ModalSkeleton />}>
                    <ErrorBoundary minimal>
                        <CompareStocks
                            isOpen={compareOpen}
                            onClose={() => setCompareOpen(false)}
                            stocks={stocks}
                        />
                    </ErrorBoundary>
                </Suspense>
            )}
        </div>
    );
};
