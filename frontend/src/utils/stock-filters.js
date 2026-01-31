export const filterStocks = (stocks, filters) => {
    if (!stocks) return [];
    
    let filtered = [...stocks];

    // Market cap filter
    if (filters.marketCap !== 'all') {
        filtered = filtered.filter(stock => {
            const mcap = stock.marketCap || 0;
            switch (filters.marketCap) {
                case 'large': return mcap >= 20000;
                case 'mid': return mcap >= 5000 && mcap < 20000;
                case 'small': return mcap < 5000;
                default: return true;
            }
        });
    }

    // P/E ratio filter
    if (filters.peRatio !== 'all') {
        filtered = filtered.filter(stock => {
            const pe = stock.peRatio || 0;
            switch (filters.peRatio) {
                case 'low': return pe > 0 && pe < 15;
                case 'medium': return pe >= 15 && pe <= 25;
                case 'high': return pe > 25;
                default: return true;
            }
        });
    }

    // Volume filter
    if (filters.volume !== 'all') {
        filtered = filtered.filter(stock => {
            const vol = stock.volume || 0;
            switch (filters.volume) {
                case 'high': return vol >= 1000000;
                case 'medium': return vol >= 100000 && vol < 1000000;
                case 'low': return vol < 100000;
                default: return true;
            }
        });
    }

    // Sector filter
    if (filters.sector !== 'all') {
        filtered = filtered.filter(stock => stock.sector === filters.sector);
    }

    // Price range filter
    if (filters.priceMin) {
        filtered = filtered.filter(stock => stock.price >= parseFloat(filters.priceMin));
    }
    if (filters.priceMax) {
        filtered = filtered.filter(stock => stock.price <= parseFloat(filters.priceMax));
    }

    // Signal type filter
    if (filters.signalType !== 'all') {
        filtered = filtered.filter(stock => {
            const signal = (stock.signal || '').toLowerCase();
            return signal.includes(filters.signalType);
        });
    }

    // Halal status filter
    if (filters.halalStatus !== 'all') {
        filtered = filtered.filter(stock => {
            const status = (stock.halalStatus || '').toLowerCase();
            if (filters.halalStatus === 'halal') return status === 'halal';
            if (filters.halalStatus === 'non-halal') return status === 'non-halal' || status === 'haram';
            if (filters.halalStatus === 'pending') return status === 'pending' || !status;
            return true;
        });
    }

    return filtered;
};

export const initialFilters = {
    marketCap: 'all',
    peRatio: 'all',
    volume: 'all',
    sector: 'all',
    priceMin: '',
    priceMax: '',
    signalType: 'all',
    halalStatus: 'all'
};
