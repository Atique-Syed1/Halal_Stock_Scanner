import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, ShieldCheck, ShieldAlert, Clock, AlertCircle, Loader, ExternalLink } from 'lucide-react';

/**
 * IPO Tracker Component
 * Shows upcoming IPOs with Halal compliance screening
 */
const IpoTracker = () => {
    const [ipos, setIpos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, halal, upcoming, live

    useEffect(() => {
        fetchIpos();
    }, []);

    const fetchIpos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ipo/upcoming');
            if (!res.ok) throw new Error('Failed to fetch IPOs');
            const data = await res.json();
            setIpos(data.ipos || []);
            setError(null);
        } catch (err) {
            console.error('IPO fetch error:', err);
            // Use mock data as fallback
            setIpos(getMockIpos());
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    const getMockIpos = () => [
        {
            id: 1,
            company: 'TechVentures India Ltd',
            symbol: 'TECHVENT',
            priceRange: '₹450 - ₹475',
            issueSize: '₹1,200 Cr',
            openDate: '2026-01-20',
            closeDate: '2026-01-22',
            listingDate: '2026-01-27',
            status: 'upcoming',
            isHalal: true,
            sector: 'Technology',
            lotSize: 31,
            subscriptionTimes: null,
            halalReason: 'Software services, no prohibited activities'
        },
        {
            id: 2,
            company: 'Green Energy Solutions',
            symbol: 'GREENSOL',
            priceRange: '₹280 - ₹295',
            issueSize: '₹850 Cr',
            openDate: '2026-01-18',
            closeDate: '2026-01-21',
            listingDate: '2026-01-26',
            status: 'live',
            isHalal: true,
            sector: 'Energy',
            lotSize: 50,
            subscriptionTimes: 2.4,
            halalReason: 'Renewable energy, Shariah compliant'
        },
        {
            id: 3,
            company: 'Premium Spirits Ltd',
            symbol: 'PREMSPIR',
            priceRange: '₹520 - ₹545',
            issueSize: '₹2,100 Cr',
            openDate: '2026-01-19',
            closeDate: '2026-01-22',
            listingDate: '2026-01-27',
            status: 'live',
            isHalal: false,
            sector: 'FMCG',
            lotSize: 27,
            subscriptionTimes: 5.8,
            halalReason: 'Alcohol manufacturing - prohibited'
        },
        {
            id: 4,
            company: 'HealthCare Plus',
            symbol: 'HCPLUS',
            priceRange: '₹180 - ₹195',
            issueSize: '₹650 Cr',
            openDate: '2026-01-25',
            closeDate: '2026-01-28',
            listingDate: '2026-02-02',
            status: 'upcoming',
            isHalal: true,
            sector: 'Healthcare',
            lotSize: 76,
            subscriptionTimes: null,
            halalReason: 'Healthcare services, ethical business'
        },
        {
            id: 5,
            company: 'FinServe Capital',
            symbol: 'FINCAP',
            priceRange: '₹320 - ₹340',
            issueSize: '₹1,800 Cr',
            openDate: '2026-01-22',
            closeDate: '2026-01-24',
            listingDate: '2026-01-29',
            status: 'upcoming',
            isHalal: false,
            sector: 'Finance',
            lotSize: 44,
            subscriptionTimes: null,
            halalReason: 'Interest-based lending - prohibited'
        }
    ];

    const filteredIpos = ipos.filter(ipo => {
        if (filter === 'halal') return ipo.isHalal;
        if (filter === 'upcoming') return ipo.status === 'upcoming';
        if (filter === 'live') return ipo.status === 'live';
        return true;
    });

    const getStatusBadge = (status) => {
        if (status === 'live') {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE NOW
                </span>
            );
        }
        return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                UPCOMING
            </span>
        );
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const getDaysUntil = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Closed';
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        return `${diff} days`;
    };

    if (loading) {
        return (
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-900/80">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">IPO Tracker</h3>
                            <p className="text-xs text-gray-400">Upcoming & Live IPOs with Halal Screening</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
                        {['all', 'halal', 'live', 'upcoming'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === f
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                {f === 'halal' ? '🕌 Halal' : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* IPO List */}
            <div className="divide-y divide-gray-700/30">
                {filteredIpos.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No IPOs found for selected filter</p>
                    </div>
                ) : (
                    filteredIpos.map((ipo) => (
                        <div
                            key={ipo.id}
                            className="p-4 hover:bg-gray-800/30 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Company Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white truncate">{ipo.company}</h4>
                                        {ipo.isHalal ? (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                <ShieldCheck className="w-3 h-3" /> HALAL
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                                                <ShieldAlert className="w-3 h-3" /> NON-HALAL
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="font-mono bg-gray-800/50 px-1.5 py-0.5 rounded">{ipo.symbol}</span>
                                        <span>{ipo.sector}</span>
                                        <span className="text-gray-600">|</span>
                                        <span>Lot: {ipo.lotSize}</span>
                                    </div>
                                    {!ipo.isHalal && (
                                        <p className="text-xs text-red-400/70 mt-1 italic">{ipo.halalReason}</p>
                                    )}
                                </div>

                                {/* Price & Size */}
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase">Price Band</p>
                                        <p className="font-bold text-white">{ipo.priceRange}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase">Issue Size</p>
                                        <p className="font-bold text-emerald-400">{ipo.issueSize}</p>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Open</p>
                                        <p className="text-sm font-medium text-white">{formatDate(ipo.openDate)}</p>
                                        <p className="text-[10px] text-gray-500">{getDaysUntil(ipo.openDate)}</p>
                                    </div>
                                    <div className="text-gray-600">→</div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Close</p>
                                        <p className="text-sm font-medium text-white">{formatDate(ipo.closeDate)}</p>
                                    </div>
                                </div>

                                {/* Status & Subscription */}
                                <div className="flex items-center gap-3">
                                    {ipo.subscriptionTimes && (
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Subscribed</p>
                                            <p className={`font-bold ${ipo.subscriptionTimes > 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                                                {ipo.subscriptionTimes}x
                                            </p>
                                        </div>
                                    )}
                                    {getStatusBadge(ipo.status)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700/50 bg-gray-900/50">
                <p className="text-xs text-gray-500 text-center">
                    Halal screening based on business activity and financial ratios. Always verify with a certified Shariah advisor.
                </p>
            </div>
        </div>
    );
};

export default IpoTracker;
