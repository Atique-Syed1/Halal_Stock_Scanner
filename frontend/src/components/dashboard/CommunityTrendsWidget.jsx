import React from 'react';
import { Users, Eye, TrendingUp, TrendingDown } from 'lucide-react';

const CommunityTrendsWidget = ({ trends }) => {
    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-purple-400" />
                <h3 className="font-semibold text-white">Community Sentiment</h3>
            </div>
            
            <div className="space-y-4">
                {(!trends || trends.length === 0) ? (
                    <p className="text-gray-500 text-sm">No community data available</p>
                ) : (
                    trends.map((stock) => (
                        <div key={stock.symbol} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{stock.symbol}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Eye size={10} /> {stock.watchers.toLocaleString()}
                                    </span>
                                </div>
                                <span className={`text-xs font-bold ${stock.sentiment >= 60 ? 'text-green-400' : stock.sentiment <= 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {stock.sentiment}% Bullish
                                </span>
                            </div>
                            
                            {/* Sentiment Bar */}
                            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden flex">
                                <div 
                                    className={`h-full ${stock.sentiment >= 60 ? 'bg-green-500' : stock.sentiment <= 40 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                                    style={{ width: `${stock.sentiment}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-700/50 text-center">
                <p className="text-[10px] text-gray-500">Based on watchlist activity & search volume</p>
            </div>
        </div>
    );
};

export default CommunityTrendsWidget;
