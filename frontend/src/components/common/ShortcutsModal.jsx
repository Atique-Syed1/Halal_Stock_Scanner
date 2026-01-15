import React, { useEffect } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

/**
 * Keyboard Shortcuts Modal
 * Shows all available keyboard shortcuts
 */
const ShortcutsModal = ({ isOpen, onClose }) => {
    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const shortcuts = [
        {
            category: 'Navigation',
            items: [
                { keys: ['D'], description: 'Go to Dashboard' },
                { keys: ['S'], description: 'Go to Scanner' },
                { keys: ['M'], description: 'Go to Market' },
                { keys: ['W'], description: 'Open Watchlist' },
            ]
        },
        {
            category: 'Search & Commands',
            items: [
                { keys: ['Ctrl', 'K'], description: 'Open Command Palette' },
                { keys: ['?'], description: 'Show this help' },
                { keys: ['Escape'], description: 'Close modals' },
            ]
        },
        {
            category: 'Scanner Actions',
            items: [
                { keys: ['Ctrl', 'Enter'], description: 'Scan Market' },
                { keys: ['H'], description: 'Toggle Halal filter' },
                { keys: ['R'], description: 'Refresh data' },
            ]
        },
        {
            category: 'View',
            items: [
                { keys: ['T'], description: 'Toggle dark/light theme' },
                { keys: ['F'], description: 'Toggle fullscreen' },
            ]
        }
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <div
                    className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Keyboard className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
                                <p className="text-xs text-gray-400">Navigate faster with shortcuts</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 overflow-y-auto max-h-[60vh] space-y-6">
                        {shortcuts.map((section) => (
                            <div key={section.category}>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    {section.category}
                                </h3>
                                <div className="space-y-2">
                                    {section.items.map((shortcut, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
                                        >
                                            <span className="text-sm text-gray-300">{shortcut.description}</span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.keys.map((key, keyIndex) => (
                                                    <React.Fragment key={keyIndex}>
                                                        <kbd className="px-2 py-1 text-xs font-mono font-bold text-gray-200 bg-gray-700 border border-gray-600 rounded shadow-sm min-w-[28px] text-center">
                                                            {key === 'Ctrl' && navigator.platform.includes('Mac') ? '⌘' : key}
                                                        </kbd>
                                                        {keyIndex < shortcut.keys.length - 1 && (
                                                            <span className="text-gray-500 text-xs">+</span>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-700 rounded">?</kbd> anytime to show this
                            </p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShortcutsModal;
