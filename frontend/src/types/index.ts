/**
 * Common types for HalalTrade Pro
 */

// Stock data types
export interface Stock {
    symbol: string;
    name: string;
    price: number;
    priceChange?: number;
    priceChangePercent?: number;
    priceHistory?: number[];
    shariahStatus: 'Halal' | 'Non-Halal' | 'Pending';
    technicals?: {
        rsi?: number;
        signal?: 'Buy' | 'Sell' | 'Hold';
        sma50?: number;
        sma200?: number;
    };
}

// Portfolio types
export interface Holding {
    symbol: string;
    quantity: number;
    average_price: number;
    current_price: number;
    current_value: number;
    pnl: number;
    pnl_percent: number;
}

export interface PortfolioSummary {
    current_value: number;
    total_invested: number;
    total_pnl: number;
    total_pnl_percent: number;
    holdings: Holding[];
}

export interface Transaction {
    id: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    date: string;
}

// Alert types
export interface Alert {
    id: string;
    symbol: string;
    condition: 'above' | 'below';
    price: number;
    enabled: boolean;
    triggered?: boolean;
}

// Component prop types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface TabProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}
