import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
import API from '../../config/api';

const RiskMetricsWidget = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(API.ANALYTICS_RISK);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else {
                    setData({
                        sharpeRatio: 0,
                        maxDrawdown: 0,
                        volatility: 0,
                        beta: 0
                    });
                }
            } catch (err) {
                setData({ sharpeRatio: 0, maxDrawdown: 0, volatility: 0, beta: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-gray-800 rounded-xl"></div>;

    const getSharpeColor = (val) => {
        if (val >= 2.0) return 'text-emerald-400';
        if (val >= 1.0) return 'text-blue-400';
        return 'text-yellow-400';
    };

    return (
        <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg text-gray-200 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-purple-500" />
                    Risk Metrics
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                        <div className="text-gray-400 text-[10px] uppercase mb-1">Sharpe Ratio</div>
                        <div className={`text-2xl font-mono font-bold ${getSharpeColor(data?.sharpeRatio)}`}>
                            {data?.sharpeRatio}
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                        <div className="text-gray-400 text-[10px] uppercase mb-1 flex justify-between">
                            <span>Max Drawdown</span>
                            <span className="text-red-500">{data?.maxDrawdown}%</span>
                        </div>
                        {/* Progress Bar for Drawdown */}
                        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(Math.abs(data?.maxDrawdown), 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-gray-400 text-[10px] uppercase">Beta</div>
                            <Activity size={12} className="text-blue-400" />
                        </div>
                        <div className="text-xl font-mono text-white">
                            {data?.beta}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">vs NIFTY 50</div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                        <div className="text-gray-400 text-[10px] uppercase mb-1">Volatility (Ann.)</div>
                        <div className="text-xl font-mono text-white">
                            {data?.volatility}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RiskMetricsWidget;
