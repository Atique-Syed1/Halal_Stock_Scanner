import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast Context
 */
const ToastContext = createContext(null);

/**
 * Toast types and their configurations
 */
const TOAST_TYPES = {
    success: {
        icon: CheckCircle,
        bgClass: 'bg-emerald-500/20 border-emerald-500/50',
        iconClass: 'text-emerald-400',
        titleClass: 'text-emerald-300'
    },
    error: {
        icon: XCircle,
        bgClass: 'bg-red-500/20 border-red-500/50',
        iconClass: 'text-red-400',
        titleClass: 'text-red-300'
    },
    warning: {
        icon: AlertTriangle,
        bgClass: 'bg-amber-500/20 border-amber-500/50',
        iconClass: 'text-amber-400',
        titleClass: 'text-amber-300'
    },
    info: {
        icon: Info,
        bgClass: 'bg-blue-500/20 border-blue-500/50',
        iconClass: 'text-blue-400',
        titleClass: 'text-blue-300'
    }
};

/**
 * Individual Toast Component
 */
const Toast = ({ toast, onDismiss }) => {
    const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
    const Icon = config.icon;

    return (
        <div 
            className={`
                flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
                shadow-lg shadow-black/20 animate-slide-in-right
                ${config.bgClass}
            `}
            role="alert"
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className={`font-semibold ${config.titleClass}`}>{toast.title}</p>
                )}
                {toast.message && (
                    <p className="text-gray-300 text-sm mt-0.5">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-gray-400 hover:text-white transition-colors p-1 -mr-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

/**
 * Toast Container Component
 */
const ToastContainer = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
};

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, title, message, duration = 4000) => {
        const id = Date.now() + Math.random();
        
        setToasts(prev => [...prev, { id, type, title, message }]);

        // Auto dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (title, message, duration) => addToast('success', title, message, duration),
        error: (title, message, duration) => addToast('error', title, message, duration),
        warning: (title, message, duration) => addToast('warning', title, message, duration),
        info: (title, message, duration) => addToast('info', title, message, duration),
        dismiss: dismissToast,
        dismissAll: () => setToasts([])
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
};

/**
 * Hook to use toast notifications
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastProvider;
