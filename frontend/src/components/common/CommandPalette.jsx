import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Command, ArrowRight, LayoutDashboard, ScanLine, Briefcase, Bell, Settings, Moon, Sun, X, Globe } from 'lucide-react';
import { useEscapeKey } from '../../hooks/useKeyboardShortcuts';

/**
 * Command Palette / Quick Search Component
 * Activated with Ctrl+K
 */
export const CommandPalette = ({
    isOpen,
    onClose,
    stocks = [],
    onSelectStock,
    onNavigate,
    onToggleTheme,
    darkMode
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // Close on Escape
    useEscapeKey(onClose, isOpen);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    // Command definitions
    const commands = useMemo(() => [
        { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => onNavigate?.('dashboard'), category: 'Navigation' },
        { id: 'market', label: 'Go to Market Overview', icon: Globe, action: () => onNavigate?.('market'), category: 'Navigation' },
        { id: 'scanner', label: 'Go to Scanner', icon: ScanLine, action: () => onNavigate?.('scanner'), category: 'Navigation' },
        { id: 'portfolio', label: 'Open Portfolio', icon: Briefcase, action: () => onNavigate?.('portfolio'), category: 'Navigation' },
        { id: 'alerts', label: 'Open Alerts', icon: Bell, action: () => onNavigate?.('alerts'), category: 'Navigation' },
        { id: 'theme', label: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: darkMode ? Sun : Moon, action: onToggleTheme, category: 'Settings' },
    ], [onNavigate, onToggleTheme, darkMode]);

    // Filter stocks based on query
    const filteredStocks = useMemo(() => {
        if (!query || query.length < 1) return [];
        const q = query.toLowerCase();
        return stocks
            .filter(s =>
                s.symbol.toLowerCase().includes(q) ||
                s.name?.toLowerCase().includes(q)
            )
            .slice(0, 5);
    }, [stocks, query]);

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query) return commands;
        const q = query.toLowerCase();
        return commands.filter(c => c.label.toLowerCase().includes(q));
    }, [commands, query]);

    // Combined results
    const results = useMemo(() => {
        const stockResults = filteredStocks.map(s => ({
            id: `stock-${s.symbol}`,
            label: s.symbol,
            sublabel: s.name,
            icon: null,
            action: () => onSelectStock?.(s),
            category: 'Stocks'
        }));
        return [...stockResults, ...filteredCommands];
    }, [filteredStocks, filteredCommands, onSelectStock]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    results[selectedIndex].action();
                    onClose();
                }
                break;
        }
    };

    // Reset selection when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Palette */}
            <div className="relative w-full max-w-xl mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search stocks, commands..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                    />
                    <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Command className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No results found</p>
                            <p className="text-xs mt-1">Try searching for a stock or command</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {/* Group by category */}
                            {['Stocks', 'Navigation', 'Settings'].map(category => {
                                const categoryResults = results.filter(r => r.category === category);
                                if (categoryResults.length === 0) return null;

                                return (
                                    <div key={category}>
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {category}
                                        </div>
                                        {categoryResults.map((result, idx) => {
                                            const globalIndex = results.indexOf(result);
                                            const Icon = result.icon;

                                            return (
                                                <button
                                                    key={result.id}
                                                    onClick={() => {
                                                        result.action();
                                                        onClose();
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${globalIndex === selectedIndex
                                                            ? 'bg-emerald-500/20 text-white'
                                                            : 'text-gray-300 hover:bg-gray-800'
                                                        }`}
                                                >
                                                    {Icon ? (
                                                        <Icon className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                                                            {result.label[0]}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{result.label}</div>
                                                        {result.sublabel && (
                                                            <div className="text-xs text-gray-500 truncate">{result.sublabel}</div>
                                                        )}
                                                    </div>
                                                    <ArrowRight className={`w-4 h-4 transition-opacity ${globalIndex === selectedIndex ? 'opacity-100' : 'opacity-0'
                                                        }`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↑↓</kbd> Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↵</kbd> Select
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Command className="w-3 h-3" />K to open
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
