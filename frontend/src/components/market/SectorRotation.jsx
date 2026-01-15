import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RotateCcw, Activity } from 'lucide-react';

/**
 * Sector Rotation Component
 * Shows sector momentum using a quadrant chart (RRG-style)
 * Quadrants: Leading, Weakening, Lagging, Improving
 */
// Default sectors with mock rotation data
const getDefaultSectors = () => [
    { name: 'IT', change: 1.8, momentum: 45, relativeStrength: 65 },
    { name: 'Banking', change: -0.5, momentum: -25, relativeStrength: 30 },
    { name: 'Pharma', change: 2.2, momentum: 55, relativeStrength: 40 },
    { name: 'Auto', change: -1.2, momentum: -40, relativeStrength: -20 },
    { name: 'FMCG', change: 0.8, momentum: 20, relativeStrength: 15 },
    { name: 'Metal', change: 3.5, momentum: 75, relativeStrength: 80 },
    { name: 'Energy', change: -0.3, momentum: -15, relativeStrength: 25 },
    { name: 'Realty', change: 1.5, momentum: 35, relativeStrength: -10 },
    { name: 'Infra', change: 0.6, momentum: 15, relativeStrength: -30 },
    { name: 'Media', change: -2.1, momentum: -60, relativeStrength: -55 },
    { name: 'PSU', change: 0.4, momentum: 10, relativeStrength: 5 },
    { name: 'Telecom', change: -0.8, momentum: -20, relativeStrength: 10 }
];

const SectorRotation = ({ sectors = [] }) => {
    const [period, setPeriod] = useState('1M');
    const [selectedSector, setSelectedSector] = useState(null);

    // Helper function to determine quadrant - must be defined before useMemo
    const getQuadrant = (momentum, strength) => {
        if (momentum > 0 && strength > 0) return 'leading';
        if (momentum < 0 && strength > 0) return 'weakening';
        if (momentum < 0 && strength < 0) return 'lagging';
        return 'improving';
    };

    // Calculate momentum and relative strength for each sector
    const processedSectors = useMemo(() => {
        return (sectors.length > 0 ? sectors : getDefaultSectors()).map((sector, index) => {
            // Mock momentum calculation - in real app, use actual price data
            // Use deterministic values based on index to avoid hydration mismatch
            const mockMomentum = ((index * 37) % 200) - 100;
            const mockStrength = ((index * 53) % 200) - 100;
            
            const momentum = sector.momentum || mockMomentum;
            const relativeStrength = sector.relativeStrength || mockStrength;

            return {
                ...sector,
                momentum,
                relativeStrength,
                quadrant: getQuadrant(momentum, relativeStrength)
            };
        });
    }, [sectors]);


    const quadrantConfig = {
        leading: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            label: 'Leading',
            icon: TrendingUp
        },
        weakening: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            label: 'Weakening',
            icon: ArrowDownRight
        },
        lagging: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            text: 'text-red-400',
            label: 'Lagging',
            icon: TrendingDown
        },
        improving: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            label: 'Improving',
            icon: ArrowUpRight
        }
    };

    const periods = ['1W', '1M', '3M', '6M'];

    const groupedSectors = useMemo(() => {
        return processedSectors.reduce((acc, sector) => {
            if (!acc[sector.quadrant]) acc[sector.quadrant] = [];
            acc[sector.quadrant].push(sector);
            return acc;
        }, { leading: [], weakening: [], lagging: [], improving: [] });
    }, [processedSectors]);

    return (
        <div className="glass-card rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-900/80">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <RotateCcw className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Sector Rotation</h3>
                            <p className="text-xs text-gray-400">Relative Rotation Graph (RRG) Style</p>
                        </div>
                    </div>

                    {/* Period Selector */}
                    <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
                        {periods.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p
                                    ? 'bg-indigo-500/20 text-indigo-400'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quadrant Grid */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                    {['leading', 'weakening', 'improving', 'lagging'].map((quadrant) => {
                        const config = quadrantConfig[quadrant];
                        const Icon = config.icon;
                        const sectorList = groupedSectors[quadrant] || [];

                        return (
                            <div
                                key={quadrant}
                                className={`p-4 rounded-xl ${config.bg} border ${config.border} transition-all hover:scale-[1.02]`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className={`w-4 h-4 ${config.text}`} />
                                    <span className={`text-sm font-bold ${config.text}`}>
                                        {config.label}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {sectorList.length} sectors
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {sectorList.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic">No sectors</p>
                                    ) : (
                                        sectorList.slice(0, 3).map((sector) => (
                                            <div
                                                key={sector.name}
                                                onClick={() => setSelectedSector(sector)}
                                                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 cursor-pointer transition-all"
                                            >
                                                <span className="text-sm font-medium text-white">{sector.name}</span>
                                                <span className={`text-xs font-bold ${sector.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {sector.change >= 0 ? '+' : ''}{sector.change?.toFixed(1)}%
                                                </span>
                                            </div>
                                        ))
                                    )}
                                    {sectorList.length > 3 && (
                                        <p className="text-xs text-gray-500 text-center pt-1">
                                            +{sectorList.length - 3} more
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-xs text-gray-400 text-center">
                        <strong className="text-emerald-400">Leading:</strong> Strong momentum & strength •
                        <strong className="text-yellow-400 ml-2">Weakening:</strong> Losing momentum •
                        <strong className="text-red-400 ml-2">Lagging:</strong> Weak performance •
                        <strong className="text-blue-400 ml-2">Improving:</strong> Gaining momentum
                    </p>
                </div>
            </div>

            {/* Selected Sector Detail */}
            {selectedSector && (
                <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white">{selectedSector.name}</h4>
                            <p className="text-xs text-gray-400">
                                Quadrant: {quadrantConfig[selectedSector.quadrant]?.label}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-bold ${selectedSector.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {selectedSector.change >= 0 ? '+' : ''}{selectedSector.change?.toFixed(2)}%
                            </p>
                            <p className="text-xs text-gray-500">{period} Change</p>
                        </div>
                        <button
                            onClick={() => setSelectedSector(null)}
                            className="ml-4 p-1 rounded hover:bg-gray-700/50 text-gray-400"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};



export default SectorRotation;
