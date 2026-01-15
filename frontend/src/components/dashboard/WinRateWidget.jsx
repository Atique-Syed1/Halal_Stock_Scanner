import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import API from '../../config/api';

const WinRateWidget = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In production, use API
                const res = await fetch(API.ANALYTICS_PERFORMANCE);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else {
                    // Fallback / Mock
                    setData({
                        winRate: 0,
                        totalTrades: 0,
                        wins: 0,
                        losses: 0,
                        netProfit: 0,
                        profitFactor: 0
                    });
                }
            } catch (err) {
                setData({ winRate: 0, totalTrades: 0, wins: 0, losses: 0, netProfit: 0, profitFactor: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-gray-800 rounded-xl"></div>;

    const winRate = data?.winRate || 0;

    // Donut chart calculation
    const radius = 15.9155;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (winRate / 100) * circumference;

    return (
        <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg text-gray-200 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Performance
                </h3>
            </div>

            <div className="flex items-center gap-8">
                {/* CSS Donut Chart */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="3"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="3"
                            strokeDasharray={`${winRate}, 100`}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-white">{winRate}%</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Win Rate</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-700/50">
                        <div className="text-gray-400 text-[10px] uppercase mb-1">Trades</div>
                        <div className="text-lg font-mono text-white">{data?.totalTrades || 0}</div>
                    </div>
                    <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-700/50">
                        <div className="text-gray-400 text-[10px] uppercase mb-1">Profit Factor</div>
                        <div className="text-lg font-mono text-blue-400">{data?.profitFactor || 0}</div>
                    </div>
                    <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-700/50 col-span-2">
                        <div className="text-gray-400 text-[10px] uppercase mb-1">Net P&L</div>
                        <div className={`text-xl font-mono font-bold ${data?.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {data?.netProfit >= 0 ? '+' : ''}₹{data?.netProfit?.toLocaleString() || 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WinRateWidget;
