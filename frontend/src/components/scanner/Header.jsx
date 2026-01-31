import React, { lazy } from 'react';
import { ScanLine, Wifi, Filter, RefreshCw, Search } from 'lucide-react';
import { WatchlistIndicator } from './index'; // Assuming index.js exports it, or adjust path
import { ExportButton } from '../common';

// Lazy load buttons to avoid circular deps if any, or just standard import if they are small
// Using direct imports for buttons as they were in the main file
const TelegramButton = lazy(() => import('../settings/TelegramSettings').then(m => ({ default: m.TelegramButton })));
const StockListButton = lazy(() => import('../settings/StockListSettings').then(m => ({ default: m.StockListButton })));

const Header = ({
    showHalalOnly, setShowHalalOnly,
    isScanning, handleScan,
    wsConnected, wsConnecting, lastUpdate,
    watchlistCount, onOpenWatchlist,
    telegramEnabled, onOpenTelegram,
    stockListCount, onOpenStockList,
    onOpenPortfolio, onOpenAlerts, onOpenCompare,
    onOpenFilters, isFiltersOpen,
    stocks
}) => (
    <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-6 p-1">
            {/* BRANDING SECTION */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center gap-3 justify-center md:justify-start">
                        <ScanLine className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
                        Stock Scanner
                    </h1>
                    <div className="flex items-center gap-2 mt-2 ml-1 justify-center md:justify-start">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${wsConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}>
                            <Wifi className={`w-3 h-3 ${wsConnected ? 'animate-pulse' : ''}`} />
                            {wsConnected ? 'Live Market Active' : wsConnecting ? 'Connecting...' : 'Connecting...'}
                        </div>
                        {wsConnected && (
                            <span className="text-[10px] text-gray-500 font-mono">
                                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTION TOOLBAR - Responsive Wrap */}
            <div className="w-full xl:w-auto flex flex-col sm:flex-row items-center gap-3 bg-gray-800/40 p-2 rounded-2xl border border-gray-700/50 backdrop-blur-sm">

                {/* GROUP 1 & 2 WRAPPER FOR MOBILE */}
                <div className="flex w-full sm:w-auto justify-between sm:justify-start gap-2">
                    {/* GROUP 1: NAVIGATION */}
                    <div className="flex items-center gap-1 md:gap-2 pr-2 sm:pr-4 sm:border-r border-gray-700/50">
                        <button
                            onClick={onOpenPortfolio}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all text-gray-400 hover:text-white hover:bg-gray-700/50"
                        >
                            <div className="md:hidden">💼</div>
                            <span className="hidden md:inline">Portfolio</span>
                        </button>

                        <WatchlistIndicator
                            count={watchlistCount}
                            onClick={onOpenWatchlist}
                        />
                    </div>

                    {/* GROUP 2: TOOLS */}
                    <div className="flex items-center gap-1 md:gap-2 pr-0 sm:pr-4 sm:border-r border-gray-700/50">
                        <StockListButton
                            onClick={onOpenStockList}
                            count={stockListCount}
                        />

                        <button
                            onClick={onOpenCompare}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all tooltip"
                            title="Compare Stocks"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5" /><path d="M21 3l-7 7" /><path d="M21 21v-5h-5" /><path d="M21 21l-7-7" /><path d="M3 21h5v-5" /><path d="M3 21l7-7" /><path d="M3 3h5v5" /><path d="M3 3l7 7" /></svg>
                        </button>

                        <button
                            onClick={onOpenAlerts}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all tooltip"
                            title="Alerts"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                        </button>

                        <TelegramButton
                            onClick={onOpenTelegram}
                            isEnabled={telegramEnabled}
                        />

                        <ExportButton stocks={stocks} type="scan" />
                    </div>
                </div>

                {/* GROUP 3: PRIMARY ACTION */}
                <div className="flex w-full sm:w-auto items-center gap-3 pl-0 sm:pl-2">
                    <button
                        onClick={onOpenFilters}
                        className={`p-2 rounded-lg transition-all border ${isFiltersOpen
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                            : 'border-transparent text-gray-400 hover:bg-gray-700/50'}`}
                        title="Advanced Filters"
                    >
                        <Filter className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setShowHalalOnly(!showHalalOnly)}
                        className={`p-2 rounded-lg transition-all border ${showHalalOnly
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                            : 'border-transparent text-gray-400 hover:bg-gray-700/50'}`}
                        title={showHalalOnly ? "Showing Halal Only" : "Filter Halal"}
                    >
                        <div className="flex items-center gap-1 font-bold text-xs">
                            <span>☪️</span>
                            <span className="hidden sm:inline">Halal</span>
                        </div>
                    </button>

                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-900/20"
                    >
                        {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default Header;
