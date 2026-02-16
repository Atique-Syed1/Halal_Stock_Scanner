import React from 'react';
import { BarChart2, ShieldCheck, TrendingUp, Target, Zap } from 'lucide-react';
import StatCard from '../common/StatCard';

const StatsCards = ({ stocks, wsConnected, priceUpdates }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard
            label="Total Scanned"
            value={stocks.length}
            icon={<BarChart2 className="w-4 h-4" />}
        />
        <StatCard
            label="Halal Compliant"
            value={stocks.filter(s => s.shariahStatus === 'Halal').length}
            color="emerald"
            icon={<ShieldCheck className="w-4 h-4" />}
        />
        <StatCard
            label="Buy Signals"
            value={stocks.filter(s => s.technicals.signal === 'Buy' && s.shariahStatus === 'Halal').length}
            color="blue"
            icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
            label="Avg Potential"
            value={stocks.length > 0 ? '3.2%' : '0%'}
            color="yellow"
            icon={<Target className="w-4 h-4" />}
        />
        {wsConnected && (
            <div className="stat-card card-hover group col-span-2 sm:col-span-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3 text-yellow-400 animate-pulse" /> Live Updates
                </p>
                <p className="text-2xl font-bold text-yellow-400 group-hover:scale-105 transition-transform">
                    {priceUpdates}
                </p>
            </div>
        )}
    </div>
);

export default StatsCards;
