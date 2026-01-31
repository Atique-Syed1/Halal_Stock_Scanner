import React, { useState, lazy, Suspense } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { ScannerPage } from '../pages/ScannerPage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useStockData } from '../hooks/useStockData';
import { PageLoadingSkeleton, ModalSkeleton, PullToRefresh } from './common';
import ErrorBoundary from './common/ErrorBoundary';

// Lazy Components
const Dashboard = lazy(() => import('./dashboard/Dashboard'));
const MarketOverview = lazy(() => import('./market/MarketOverview'));
const Portfolio = lazy(() => import('./portfolio/Portfolio'));
const AlertSettings = lazy(() => import('./settings/AlertSettings'));

const HalalTradeApp = () => {
    // Global State
    const [activeTab, setActiveTab] = useLocalStorage('halaltrade-tab', 'dashboard');
    const [theme, setTheme] = useLocalStorage('halaltrade-theme', 'dark');
    const [useLiveMode] = useLocalStorage('halaltrade-live', true);

    // Auth State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isAuthenticated] = useState(!!localStorage.getItem('token'));

    // UI State (Global Modals)
    const [portfolioOpen, setPortfolioOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);

    // Data Hook (Global because it's used in CommandPalette and Scanner)
    const stockData = useStockData(useLiveMode);

    // Refresh Logic
    const [refreshKey, setRefreshKey] = useState(0);
    const handleRefresh = async () => {
        if (activeTab === 'scanner') {
            await stockData.handleScan();
        } else {
            setRefreshKey(k => k + 1);
            await new Promise(r => setTimeout(r, 600));
        }
    };

    // Selected Stock State (Shared between Scanner and CommandPalette)
    const [selectedStock, setSelectedStock] = useState(null);
    const [showHalalOnly, setShowHalalOnly] = useState(false);

    // Filtered stocks for CommandPalette
    const displayedStocks = showHalalOnly
        ? stockData.stocks.filter(s => s.shariahStatus === 'Halal' || s.shariahStatus === 'Likely Halal')
        : stockData.stocks;

    // Apply theme effect
    React.useEffect(() => {
        document.documentElement.className = '';
        if (theme === 'light') document.documentElement.classList.add('light-mode');
        else if (theme !== 'dark') document.documentElement.classList.add(`theme-${theme}`);
    }, [theme]);

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <MainLayout
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                theme={theme}
                setTheme={setTheme}
                isAuthenticated={isAuthenticated}
                // UI Controls
                commandPaletteOpen={commandPaletteOpen}
                setCommandPaletteOpen={setCommandPaletteOpen}
                shortcutsOpen={shortcutsOpen}
                setShortcutsOpen={setShortcutsOpen}
                authModalOpen={authModalOpen}
                setAuthModalOpen={setAuthModalOpen}
                // Actions
                onOpenPortfolio={() => setPortfolioOpen(true)}
                onOpenAlerts={() => setAlertOpen(true)}
                // Data
                stocks={displayedStocks}
                onSelectStock={setSelectedStock}
            >
                <ErrorBoundary>
                    <Suspense fallback={<PageLoadingSkeleton />}>
                        {activeTab === 'dashboard' && (
                            <Dashboard key={refreshKey} onNavigateToScanner={() => setActiveTab('scanner')} />
                        )}
                        {activeTab === 'market' && (
                            <MarketOverview key={refreshKey} />
                        )}
                        {activeTab === 'scanner' && (
                            <ScannerPage
                                {...stockData}
                                displayedStocks={displayedStocks}
                                selectedStock={selectedStock}
                                setSelectedStock={setSelectedStock}
                                showHalalOnly={showHalalOnly}
                                setShowHalalOnly={setShowHalalOnly}
                                onOpenPortfolio={() => setPortfolioOpen(true)}
                                onOpenAlerts={() => setAlertOpen(true)}
                            />
                        )}
                    </Suspense>
                </ErrorBoundary>

                {/* Global Modals */}
                {portfolioOpen && (
                    <Suspense fallback={<ModalSkeleton />}>
                        <Portfolio isOpen={portfolioOpen} onClose={() => setPortfolioOpen(false)} />
                    </Suspense>
                )}
                {alertOpen && (
                    <Suspense fallback={<ModalSkeleton />}>
                        <AlertSettings isOpen={alertOpen} onClose={() => setAlertOpen(false)} />
                    </Suspense>
                )}
            </MainLayout>
        </PullToRefresh>
    );
};

export default HalalTradeApp;
