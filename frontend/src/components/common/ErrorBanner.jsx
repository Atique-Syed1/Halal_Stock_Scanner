import React from 'react';
import { WifiOff } from 'lucide-react';

const ErrorBanner = ({ message }) => (
    <div className="mb-6 bg-red-900/30 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200">
        <WifiOff className="w-5 h-5" />
        <div>
            <p className="font-bold">Connection Error</p>
            <p className="text-sm">{message}</p>
            <p className="text-xs mt-1 text-red-300">To use Live Mode, you must run `trade_bot_backend.py` locally on port 8000.</p>
        </div>
    </div>
);

export default ErrorBanner;
