import React, { useState, useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';

export const PullToRefresh = ({ onRefresh, children }) => {
    const [startY, setStartY] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const containerRef = useRef(null);
    const THRESHOLD = 80;
    const MAX_PULL = 150;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e) => {
            if (window.scrollY <= 5) { // Allow some tolerance
                setStartY(e.touches[0].clientY);
            }
        };

        const handleTouchMove = (e) => {
            if (startY === 0) return;

            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 0 && window.scrollY <= 5) {
                if (e.cancelable) e.preventDefault(); // Prevent native scroll if we are pulling
                setPullDistance(Math.min(diff * 0.5, MAX_PULL)); // Resistance
            }
        };

        const handleTouchEnd = async () => {
            if (startY === 0) return;

            if (pullDistance > THRESHOLD) {
                setRefreshing(true);
                setPullDistance(THRESHOLD); // Snap to threshold
                try {
                    await onRefresh();
                } finally {
                    setTimeout(() => {
                        setRefreshing(false);
                        setPullDistance(0);
                    }, 500);
                }
            } else {
                setPullDistance(0);
            }
            setStartY(0);
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [startY, pullDistance, onRefresh]);

    return (
        <div ref={containerRef} className="min-h-screen">
            <div
                className="fixed top-16 left-0 right-0 z-40 flex justify-center pointer-events-none transition-transform duration-200"
                style={{ transform: `translateY(${Math.max(pullDistance - 50, 0)}px)`, opacity: pullDistance > 10 ? 1 : 0 }}
            >
                <div className="bg-gray-800 rounded-full p-2 shadow-xl border border-gray-700">
                    <Loader className={`w-6 h-6 text-emerald-500 ${refreshing || pullDistance > THRESHOLD ? 'animate-spin' : ''}`} />
                </div>
            </div>

            <div
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: refreshing ? 'transform 0.2s' : 'transform 0.1s ease-out'
                }}
            >
                {children}
            </div>
        </div>
    );
};
