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
 * Hook for escape key to close modals
 */
export function useEscapeKey(onEscape, enabled = true) {
    useKeyboardShortcuts({
        'escape': onEscape
    }, { enabled });
}

export default useKeyboardShortcuts;
