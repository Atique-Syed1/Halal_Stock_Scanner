import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Loading skeleton for lazy-loaded components
 */
export const LoadingSkeleton = ({ height = 'h-64', message = 'Loading...' }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${height} bg-gray-800/30 rounded-xl border border-gray-700/50`}>
            <Loader className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
            <p className="text-gray-400 text-sm">{message}</p>
        </div>
    );
};

/**
 * Full page loading skeleton
 */
export const PageLoadingSkeleton = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading content...</p>
        </div>
    );
};

/**
 * Card skeleton for dashboard
 */
export const CardSkeleton = () => {
    return (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
        </div>
    );
};

/**
 * Dashboard skeleton - complete layout
 */
export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="h-8 bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-64"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-12 bg-gray-700/50 rounded-xl w-40"></div>
                    <div className="h-12 bg-gray-700/50 rounded-xl w-32"></div>
                </div>
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                        <div className="flex justify-between">
                            <div className="flex-1">
                                <div className="h-4 bg-gray-700 rounded w-20 mb-3"></div>
                                <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-gray-700/50 rounded w-16"></div>
                            </div>
                            <div className="w-12 h-12 bg-gray-700/50 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main content grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart placeholder */}
                <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 h-80">
                    <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="h-full bg-gray-700/30 rounded-lg"></div>
                </div>
                {/* Side panels */}
                <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 h-36">
                        <div className="h-5 bg-gray-700 rounded w-24 mb-3"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 h-36">
                        <div className="h-5 bg-gray-700 rounded w-28 mb-3"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Table skeleton for stock table
 */
export const TableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700/50">
                <div className="flex gap-4">
                    <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                </div>
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="px-4 py-3 border-b border-gray-700/30 flex gap-4">
                    <div className="h-4 bg-gray-700/50 rounded w-28 animate-pulse"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-20 animate-pulse"></div>
                </div>
            ))}
        </div>
    );
};

/**
 * Stock detail panel skeleton
 */
export const StockDetailSkeleton = () => {
    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="h-7 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-48"></div>
                </div>
                <div className="h-8 bg-emerald-700/30 rounded-full w-20"></div>
            </div>

            {/* Price section */}
            <div className="mb-6">
                <div className="h-10 bg-gray-700 rounded w-28 mb-2"></div>
                <div className="h-5 bg-gray-700/50 rounded w-20"></div>
            </div>

            {/* Chart placeholder */}
            <div className="h-48 bg-gray-700/30 rounded-xl mb-6"></div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-700/30 rounded-lg p-3">
                        <div className="h-3 bg-gray-700 rounded w-16 mb-2"></div>
                        <div className="h-5 bg-gray-700 rounded w-20"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Chart skeleton
 */
export const ChartSkeleton = ({ height = 'h-64' }) => {
    return (
        <div className={`${height} bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 animate-pulse`}>
            <div className="flex justify-between items-center mb-4">
                <div className="h-5 bg-gray-700 rounded w-32"></div>
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-6 bg-gray-700/50 rounded w-10"></div>
                    ))}
                </div>
            </div>
            <div className="h-full bg-gray-700/30 rounded-lg flex items-end justify-around px-4 pb-4">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-600/50 rounded-t w-4"
                        style={{ height: `${((i * 13) % 60) + 20}%` }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

/**
 * Modal loading skeleton
 */
export const ModalSkeleton = () => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center">
                <Loader className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-gray-300">Loading...</p>
            </div>
        </div>
    );
};

export default LoadingSkeleton;
