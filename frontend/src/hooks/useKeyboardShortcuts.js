import { useEffect, useCallback } from 'react';

/**
 * Keyboard shortcuts hook
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {Object} options - Options for the hook
 */
export function useKeyboardShortcuts(shortcuts, options = {}) {
    const { enabled = true, preventDefault = true } = options;

    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const tagName = event.target.tagName.toLowerCase();
        const isInput = tagName === 'input' || tagName === 'textarea' || event.target.isContentEditable;
        
        // Build the key combination string
        const keys = [];
        if (event.ctrlKey || event.metaKey) keys.push('ctrl');
        if (event.altKey) keys.push('alt');
        if (event.shiftKey) keys.push('shift');
        keys.push(event.key.toLowerCase());
        
        const combo = keys.join('+');

        // Check if we have a handler for this combination
        const handler = shortcuts[combo];
        
        if (handler) {
            // Some shortcuts should work even in inputs (like Escape)
            const alwaysAllow = ['escape', 'ctrl+k', 'ctrl+/', 'ctrl+s'];
            
            if (!isInput || alwaysAllow.includes(combo)) {
                if (preventDefault) {
                    event.preventDefault();
                }
                handler(event);
            }
        }
    }, [shortcuts, enabled, preventDefault]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Common keyboard shortcut definitions
 */
export const SHORTCUTS = {
    SEARCH: 'ctrl+k',
    ESCAPE: 'escape',
    SAVE: 'ctrl+s',
    REFRESH: 'ctrl+r',
    TOGGLE_THEME: 'ctrl+shift+t',
    DASHBOARD: 'ctrl+1',
    SCANNER: 'ctrl+2',
    HELP: 'ctrl+/',
};

/**
 * Hook for escape key to close modals
 */
export function useEscapeKey(onEscape, enabled = true) {
    useKeyboardShortcuts({
        'escape': onEscape
    }, { enabled });
}

/**
 * Hook for global app shortcuts
 */
export function useGlobalShortcuts({
    onSearch,
    onToggleTheme,
    onDashboard,
    onScanner,
    onHelp,
    onRefresh
}) {
    const shortcuts = {};

    if (onSearch) shortcuts['ctrl+k'] = onSearch;
    if (onToggleTheme) shortcuts['ctrl+shift+t'] = onToggleTheme;
    if (onDashboard) shortcuts['ctrl+1'] = onDashboard;
    if (onScanner) shortcuts['ctrl+2'] = onScanner;
    if (onHelp) shortcuts['ctrl+/'] = onHelp;
    if (onRefresh) shortcuts['ctrl+r'] = onRefresh;

    useKeyboardShortcuts(shortcuts);
}

export default useKeyboardShortcuts;
