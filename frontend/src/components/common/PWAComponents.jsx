import React, { useState, useEffect } from 'react';
import { Download, Bell, BellOff, Check, X, Smartphone } from 'lucide-react';

/**
 * ====================================================================
 * PWA INSTALL PROMPT COMPONENT
 * Shows install button when app can be installed
 * ====================================================================
 */
export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
    );

    useEffect(() => {

        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBanner(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallBanner(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowInstallBanner(false);
        }
        setDeferredPrompt(null);
    };

    if (isInstalled || !showInstallBanner) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up">
            <div className="bg-gray-800 border border-emerald-500/30 rounded-xl p-4 shadow-xl shadow-emerald-900/20">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Smartphone className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white">Install Stock Scanner</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Add to home screen for quick access & offline support
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleInstall}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition"
                            >
                                <Download size={16} />
                                Install
                            </button>
                            <button
                                onClick={() => setShowInstallBanner(false)}
                                className="px-3 py-2 text-gray-400 hover:text-white text-sm transition"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowInstallBanner(false)}
                        className="text-gray-500 hover:text-gray-300 transition"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * ====================================================================
 * NOTIFICATION PERMISSION COMPONENT
 * Manages push notification permissions
 * ====================================================================
 */
export const NotificationToggle = ({ className = '' }) => {
    const [permission, setPermission] = useState(Notification.permission);
    const [loading, setLoading] = useState(false);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support notifications');
            return;
        }

        setLoading(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Show test notification
                new Notification('Stock Scanner', {
                    body: 'Notifications enabled! You\'ll receive price alerts here.',
                    icon: '/halaltrade-icon.svg'
                });
            }
        } catch (err) {
            console.error('Notification permission error:', err);
        } finally {
            setLoading(false);
        }
    };

    const isGranted = permission === 'granted';
    const isDenied = permission === 'denied';

    return (
        <button
            onClick={requestPermission}
            disabled={loading || isDenied}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isGranted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isDenied
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                } ${className}`}
            title={isDenied ? 'Notifications blocked - enable in browser settings' : ''}
        >
            {isGranted ? (
                <>
                    <Bell size={16} className="text-emerald-400" />
                    <span className="hidden sm:inline">Notifications On</span>
                    <Check size={14} />
                </>
            ) : isDenied ? (
                <>
                    <BellOff size={16} />
                    <span className="hidden sm:inline">Blocked</span>
                </>
            ) : (
                <>
                    <Bell size={16} />
                    <span className="hidden sm:inline">Enable Notifications</span>
                </>
            )}
        </button>
    );
};

export default PWAInstallPrompt;
