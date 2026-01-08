import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Loader } from 'lucide-react';
import API from '../../config/api';

/**
 * Interactive Stock Chart Component
 * Shows historical price and volume data using Recharts
 */
export const InteractiveChart = ({ symbol, height = 300, hideControls = false, selectedPeriod }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState(selectedPeriod || '1y');
    const [error, setError] = useState(null);

    // Sync external period selection
    useEffect(() => {
        if (selectedPeriod) {
            setRange(selectedPeriod.toLowerCase());
        }
    }, [selectedPeriod]);

    useEffect(() => {
        const fetchData = async () => {
            if (!symbol) return;

            setLoading(true);
            setError(null);

            try {
                const res = await fetch(API.STOCK_HISTORY(symbol, range));
                if (!res.ok) throw new Error("Failed to fetch history");

                const historyData = await res.json();

                if (Array.isArray(historyData) && historyData.length > 0) {
                    setData(historyData);
                } else {
                    console.warn("Invalid chart data received:", historyData);
                    setError("No data available");
                    setData([]);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load chart data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, range]);

    // Formatters
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (range === '1d' || range === '5d') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatPrice = (val) => `₹${val.toFixed(2)}`;
    const formatVol = (val) => `${(val / 1000).toFixed(1)}k`;

    return (
        <div className={`w-full ${hideControls ? '' : 'bg-gray-900 rounded-lg p-4 border border-gray-700'}`}>
            {/* Header (Controls) */}
            {!hideControls && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Price Action
                    </h3>
                    <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                        {['1D', '5D', '1M', '3M', '1Y'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r.toLowerCase())} // Convert to lowercase for API consistency
                                className={`px-3 py-1 text-xs rounded-md transition-all ${range === r.toLowerCase()
                                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart Area */}
            <div className="relative" style={{ height: height, minHeight: 200, minWidth: '100%' }}>
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg">
                        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                )}

                {error ? (
                    <div className="h-full flex items-center justify-center text-red-400 text-sm">
                        {error}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#9ca3af"
                                fontSize={10}
                                tickMargin={10}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                stroke="#9ca3af"
                                fontSize={10}
                                tickFormatter={(val) => `₹${val}`}
                                width={50}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="close"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

// Custom Tooltip for Chart
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-800 border border-gray-700 p-3 rounded shadow-xl text-xs">
                <p className="text-gray-400 mb-1">{data.date ? new Date(data.date).toLocaleString() : ''}</p>
                <p className="font-bold text-white text-lg">₹{(data.close || 0).toFixed(2)}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-gray-300">
                    <div>Open: <span className="text-white">{data.open || '-'}</span></div>
                    <div>High: <span className="text-white">{data.high || '-'}</span></div>
                    <div>Low: <span className="text-white">{data.low || '-'}</span></div>
                    <div>Vol: <span className="text-white">{data.volume ? (data.volume / 1000).toFixed(1) + 'k' : '-'}</span></div>
                </div>
            </div>
        );
    }
    return null;
};
