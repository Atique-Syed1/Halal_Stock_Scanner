import React from 'react';
import { LayoutDashboard, Globe, ScanLine, Search } from 'lucide-react';
import { NotificationToggle, ThemeSelector, PWAInstallPrompt } from '../components/common';
import { MobileBottomNav } from '../components/common/MobileBottomNav';
import { CommandPalette } from '../components/common/CommandPalette';
import ShortcutsModal from '../components/common/ShortcutsModal';
import OnboardingTour from '../components/common/OnboardingTour';
import AuthModal from '../components/auth/AuthModal';

export const MainLayout = ({
    children,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    isAuthenticated,
    // UI State
    commandPaletteOpen,
    setCommandPaletteOpen,
    shortcutsOpen,
    setShortcutsOpen,
    authModalOpen,
    setAuthModalOpen,
    // Actions
    onOpenPortfolio,
    onOpenAlerts,
    // Data for Command Palette
    stocks,
    onSelectStock
}) => {
    return (
        <div className={`min-h-screen bg-gray-900 text-gray-100 font-sans`}>
            {/* TOP NAVIGATION BAR */}
            <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* LOGO & TABS */}
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center gap-2">
                                <ScanLine className="w-7 h-7 text-emerald-400" />
                                Stock Scanner
                            </h1>

                            {/* Navigation Tabs */}
                            <div className="hidden md:flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                        }`}
                                >
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveTab('market')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'market'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                        }`}
                                >
                                    <Globe size={16} />
                                    Market
                                </button>
                                <button
                                    onClick={() => setActiveTab('scanner')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'scanner'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                        }`}
                                >
                                    <ScanLine size={16} />
                                    Scanner
                                </button>
                            </div>
                        </div>

                        {/* RIGHT SIDE CONTROLS */}
                        <div className="flex items-center gap-3">
                            {/* Search Button */}
                            <button
                                onClick={() => setCommandPaletteOpen(true)}
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 transition-all"
                                title="Search (Ctrl+K)"
                            >
                                <Search size={14} />
                                <span className="text-sm">Search</span>
                                <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-gray-700 rounded">⌘K</kbd>
                            </button>

                            <NotificationToggle />
                            <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />

                            {/* Mobile Tabs */}
                            <div className="flex md:hidden items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`p-2 rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'}`}
                                >
                                    <LayoutDashboard size={18} />
                                </button>
                                <button
                                    onClick={() => setActiveTab('market')}
                                    className={`p-2 rounded-md transition-all ${activeTab === 'market' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'}`}
                                >
                                    <Globe size={18} />
                                </button>
                                <button
                                    onClick={() => setActiveTab('scanner')}
                                    className={`p-2 rounded-md transition-all ${activeTab === 'scanner' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'}`}
                                >
                                    <ScanLine size={18} />
                                </button>
                            </div>

                            {/* Auth Button */}
                            <button
                                onClick={() => isAuthenticated ? onOpenPortfolio() : setAuthModalOpen(true)}
                                className={`ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    isAuthenticated 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                }`}
                            >
                                {isAuthenticated ? (
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <span className="text-xs font-bold">U</span>
                                    </div>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="p-4 md:p-8">
                {children}
            </main>

            {/* Global Overlays */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                stocks={stocks}
                onSelectStock={(stock) => {
                    onSelectStock(stock);
                    setActiveTab('scanner');
                }}
                onNavigate={(tab) => {
                    if (tab === 'portfolio') onOpenPortfolio();
                    else if (tab === 'alerts') onOpenAlerts();
                    else setActiveTab(tab);
                }}
                onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                darkMode={theme === 'dark'}
            />

            <PWAInstallPrompt />

            <MobileBottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenPortfolio={onOpenPortfolio}
                onOpenAlerts={onOpenAlerts}
                onOpenSearch={() => setCommandPaletteOpen(true)}
            />

            <ShortcutsModal
                isOpen={shortcutsOpen}
                onClose={() => setShortcutsOpen(false)}
            />

            <OnboardingTour />

            <AuthModal 
                isOpen={authModalOpen} 
                onClose={() => setAuthModalOpen(false)} 
            />
        </div>
    );
};
