import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';

const themes = [
    { id: 'dark', name: 'Dark Default', color: '#111827' },
    { id: 'light', name: 'Light Mode', color: '#f8fafc' },
    { id: 'ocean', name: 'Ocean Depth', color: '#0b1121' },
    { id: 'sunset', name: 'Sunset Glow', color: '#180818' },
    { id: 'forest', name: 'Deep Forest', color: '#05190f' },
];

export const ThemeSelector = ({ currentTheme, onThemeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (themeId) => {
        onThemeChange(themeId);
        setIsOpen(false);
    };

    const getIcon = () => {
        if (currentTheme === 'light') return <Sun size={18} />;
        if (currentTheme === 'dark') return <Moon size={18} />;
        return <Palette size={18} />;
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all ${currentTheme !== 'dark' && currentTheme !== 'light'
                        ? 'text-yellow-500 bg-yellow-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                title="Change Theme"
            >
                {getIcon()}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-2 bg-gray-900/50 border-b border-gray-700">
                        <span className="text-[10px] font-bold text-gray-500 uppercase px-2 tracking-wider">Select Theme</span>
                    </div>
                    <div className="p-1 space-y-0.5">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => handleSelect(theme.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${currentTheme === theme.id
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-500 font-medium'
                                        : 'text-gray-300 hover:bg-gray-700/50'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full border ${currentTheme === theme.id ? 'border-yellow-500' : 'border-gray-600'}`}
                                    style={{ backgroundColor: theme.color }}
                                />
                                <span className="flex-1 text-left text-xs font-semibold">{theme.name}</span>
                                {currentTheme === theme.id && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
