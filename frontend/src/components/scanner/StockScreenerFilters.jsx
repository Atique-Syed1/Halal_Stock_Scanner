import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

/**
 * Advanced Stock Screener Filters
 * Provides filtering by market cap, P/E ratio, volume, sector, and price range
 */
export const StockScreenerFilters = ({ stocks, onFilterChange, isOpen, onToggle }) => {
    const [filters, setFilters] = useState({
        marketCap: 'all',
        peRatio: 'all',
        volume: 'all',
        sector: 'all',
        priceMin: '',
        priceMax: '',
        signalType: 'all',
        halalStatus: 'all'
    });

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

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (currentFilters) => {
        if (!stocks) return;

        let filtered = [...stocks];

        // Market cap filter
        if (currentFilters.marketCap !== 'all') {
            filtered = filtered.filter(stock => {
                const mcap = stock.marketCap || 0;
                switch (currentFilters.marketCap) {
                    case 'large': return mcap >= 20000;
                    case 'mid': return mcap >= 5000 && mcap < 20000;
                    case 'small': return mcap < 5000;
                    default: return true;
                }
            });
        }

        // P/E ratio filter
        if (currentFilters.peRatio !== 'all') {
            filtered = filtered.filter(stock => {
                const pe = stock.peRatio || 0;
                switch (currentFilters.peRatio) {
                    case 'low': return pe > 0 && pe < 15;
                    case 'medium': return pe >= 15 && pe <= 25;
                    case 'high': return pe > 25;
                    default: return true;
                }
            });
        }

        // Volume filter
        if (currentFilters.volume !== 'all') {
            filtered = filtered.filter(stock => {
                const vol = stock.volume || 0;
                switch (currentFilters.volume) {
                    case 'high': return vol >= 1000000;
                    case 'medium': return vol >= 100000 && vol < 1000000;
                    case 'low': return vol < 100000;
                    default: return true;
                }
            });
        }

        // Sector filter
        if (currentFilters.sector !== 'all') {
            filtered = filtered.filter(stock => stock.sector === currentFilters.sector);
        }

        // Price range filter
        if (currentFilters.priceMin) {
            filtered = filtered.filter(stock => stock.price >= parseFloat(currentFilters.priceMin));
        }
        if (currentFilters.priceMax) {
            filtered = filtered.filter(stock => stock.price <= parseFloat(currentFilters.priceMax));
        }

        // Signal type filter
        if (currentFilters.signalType !== 'all') {
            filtered = filtered.filter(stock => {
                const signal = (stock.signal || '').toLowerCase();
                return signal.includes(currentFilters.signalType);
            });
        }

        // Halal status filter
        if (currentFilters.halalStatus !== 'all') {
            filtered = filtered.filter(stock => {
                const status = (stock.halalStatus || '').toLowerCase();
                if (currentFilters.halalStatus === 'halal') return status === 'halal';
                if (currentFilters.halalStatus === 'non-halal') return status === 'non-halal' || status === 'haram';
                if (currentFilters.halalStatus === 'pending') return status === 'pending' || !status;
                return true;
            });
        }

        onFilterChange(filtered);
    };

    const resetFilters = () => {
        const defaultFilters = {
            marketCap: 'all',
            peRatio: 'all',
            volume: 'all',
            sector: 'all',
            priceMin: '',
            priceMax: '',
            signalType: 'all',
            halalStatus: 'all'
        };
        setFilters(defaultFilters);
        onFilterChange(stocks); // Return all stocks
    };

    const activeFilterCount = Object.entries(filters).filter(
        ([key, value]) => value !== 'all' && value !== ''
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
