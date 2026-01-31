import React from 'react';
import { Search } from 'lucide-react';

const EmptyDetailPanel = () => (
    <div className="glass-card rounded-xl p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 opacity-30" />
        </div>
        <p className="text-gray-400 font-medium">Select a stock</p>
        <p className="text-sm text-gray-500 mt-1">View detailed Shariah & Technical Report</p>
    </div>
);

export default EmptyDetailPanel;
