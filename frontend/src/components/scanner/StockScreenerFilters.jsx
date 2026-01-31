import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { initialFilters } from '../../utils/stock-filters';

/**
 * Advanced Stock Screener Filters
 * Provides filtering by market cap, P/E ratio, volume, sector, and price range
 */
export const StockScreenerFilters = ({ stocks, filters = initialFilters, onFilterChange, isOpen, onToggle }) => {
    const [expanded, setExpanded] = useState(false);

    // Market cap categories
    const marketCapOptions = [
        { value: 'all', label: 'All Market Caps' },
        { value: 'large', label: 'Large Cap (>₹20,000 Cr)' },
        { value: 'mid', label: 'Mid Cap (₹5,000-20,000 Cr)' },
        { value: 'small', label: 'Small Cap (<₹5,000 Cr)' }
    ];

    // P/E ratio categories
    const peOptions = [
        { value: 'all', label: 'All P/E Ratios' },
        { value: 'low', label: 'Undervalued (<15)' },
        { value: 'medium', label: 'Fair Value (15-25)' },
        { value: 'high', label: 'Growth (>25)' }
    ];

    // Volume categories
    const volumeOptions = [
        { value: 'all', label: 'All Volumes' },
        { value: 'high', label: 'High Volume (>1M)' },
        { value: 'medium', label: 'Medium (100K-1M)' },
        { value: 'low', label: 'Low (<100K)' }
    ];

    // Signal types
    const signalOptions = [
        { value: 'all', label: 'All Signals' },
        { value: 'buy', label: '🟢 Buy Signals' },
        { value: 'sell', label: '🔴 Sell Signals' },
        { value: 'hold', label: '🟡 Hold' }
    ];

    // Halal status
    const halalOptions = [
        { value: 'all', label: 'All Stocks' },
        { value: 'halal', label: '🛡️ Halal Only' },
        { value: 'non-halal', label: '⚠️ Non-Halal' },
        { value: 'pending', label: '⏳ Pending Review' }
    ];

    // Sectors (will be populated from stock data)
    const getSectors = () => {
        if (!stocks || stocks.length === 0) return [{ value: 'all', label: 'All Sectors' }];
        const sectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];
        return [
            { value: 'all', label: 'All Sectors' },
            ...sectors.map(s => ({ value: s, label: s }))
        ];
    };

    // Presets configuration
    const presets = [
        {
            id: 'growth',
            label: '🚀 High Growth',
            filters: { marketCap: 'mid', peRatio: 'high', volume: 'high', signalType: 'buy', halalStatus: 'halal' }
        },
        {
            id: 'value',
            label: '💎 Undervalued Gems',
            filters: { marketCap: 'small', peRatio: 'low', volume: 'medium', signalType: 'buy', halalStatus: 'halal' }
        },
        {
            id: 'safe',
            label: '🛡️ Safe Haven',
            filters: { marketCap: 'large', peRatio: 'medium', volume: 'high', signalType: 'all', halalStatus: 'halal' }
        },
        {
            id: 'halal_strict',
            label: '☪️ Halal Leaders',
            filters: { marketCap: 'large', peRatio: 'all', volume: 'all', signalType: 'buy', halalStatus: 'halal' }
        },
        {
            id: 'penny_volatility',
            label: '⚡ Penny Movers',
            filters: { marketCap: 'small', peRatio: 'all', volume: 'high', signalType: 'all', halalStatus: 'all' }
        }
    ];

    const applyPreset = (preset) => {
        const newFilters = { ...filters, ...preset.filters };
        onFilterChange(newFilters);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        onFilterChange(newFilters);
    };

    const resetFilters = () => {
        onFilterChange(initialFilters);
    };

    const activeFilterCount = Object.entries(filters).filter(
        ([, value]) => value !== 'all' && value !== ''
    ).length;

    if (!isOpen) return null;

    return (
        <div className="screener-filters">
            <div className="filters-header">
                <div className="filters-title">
                    <Filter size={18} />
                    <span>Advanced Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-badge">{activeFilterCount}</span>
                    )}
                </div>
                <div className="filters-actions">
                    <button className="filter-reset" onClick={resetFilters} title="Reset all filters">
                        <RotateCcw size={16} />
                        Reset
                    </button>
                    <button className="filter-expand" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button className="filter-close" onClick={onToggle}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className={`filters-body ${expanded ? 'expanded' : ''}`}>
                {/* Presets Row */}
                <div className="mb-4 flex flex-wrap gap-2 pb-4 border-b border-gray-700/50">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider self-center mr-2">Quick Scans:</span>
                    {presets.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => applyPreset(preset)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800 hover:bg-indigo-900/50 border border-gray-700 hover:border-indigo-500/50 text-gray-300 hover:text-indigo-300 transition-all flex items-center gap-1.5"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Row 1: Main filters */}
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Halal Status</label>
                        <select
                            value={filters.halalStatus}
                            onChange={(e) => handleFilterChange('halalStatus', e.target.value)}
                        >
                            {halalOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Signal</label>
                        <select
                            value={filters.signalType}
                            onChange={(e) => handleFilterChange('signalType', e.target.value)}
                        >
                            {signalOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sector</label>
                        <select
                            value={filters.sector}
                            onChange={(e) => handleFilterChange('sector', e.target.value)}
                        >
                            {getSectors().map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group price-range">
                        <label>Price Range (₹)</label>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.priceMin}
                                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.priceMax}
                                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Row 2: Advanced filters (expandable) */}
                {expanded && (
                    <div className="filter-row advanced">
                        <div className="filter-group">
                            <label>Market Cap</label>
                            <select
                                value={filters.marketCap}
                                onChange={(e) => handleFilterChange('marketCap', e.target.value)}
                            >
                                {marketCapOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>P/E Ratio</label>
                            <select
                                value={filters.peRatio}
                                onChange={(e) => handleFilterChange('peRatio', e.target.value)}
                            >
                                {peOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Volume</label>
                            <select
                                value={filters.volume}
                                onChange={(e) => handleFilterChange('volume', e.target.value)}
                            >
                                {volumeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockScreenerFilters;
