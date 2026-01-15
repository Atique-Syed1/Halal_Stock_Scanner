import React from 'react';
import { LayoutDashboard, ScanLine, Briefcase, Bell, Search, Globe } from 'lucide-react';

/**
 * Mobile Bottom Navigation Bar
 * Fixed at bottom, visible only on mobile devices (hidden on md: and up)
 */
export const MobileBottomNav = ({
    activeTab,
    onTabChange,
    onOpenPortfolio,
    onOpenAlerts
}) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home', action: () => onTabChange('dashboard') },
        { id: 'market', icon: Globe, label: 'Market', action: () => onTabChange('market') },
        { id: 'scanner', icon: ScanLine, label: 'Scanner', action: () => onTabChange('scanner') },
        { id: 'portfolio', icon: Briefcase, label: 'Portfolio', action: onOpenPortfolio },
        { id: 'alerts', icon: Bell, label: 'Alerts', action: onOpenAlerts },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map(({ id, icon: Icon, label, action }) => {
                    const isActive = id === activeTab ||
                        (id === 'dashboard' && activeTab === 'dashboard') ||
                        (id === 'scanner' && activeTab === 'scanner');

                    return (
                        <button
                            key={id}
                            onClick={action}
                            className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all ${isActive
                                ? 'text-emerald-400'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-emerald-500/20' : ''
                                }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-emerald-400' : 'text-gray-500'
                                }`}>
                                {label}
                            </span>
                            {isActive && (
                                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
