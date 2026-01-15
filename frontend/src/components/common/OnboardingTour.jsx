import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';

/**
 * Onboarding Tour Component
 * Guides first-time users through key features
 */
    const STORAGE_KEY = 'stockscanner_tour_completed';

    const tourSteps = [
        {
            id: 'welcome',
            title: 'Welcome to Stock Scanner! 🎉',
            description: 'Let\'s take a quick tour of the key features to help you get started.',
            target: null, // No specific target
            position: 'center'
        },
        {
            id: 'dashboard',
            title: 'Dashboard Overview',
            description: 'Your trading overview at a glance. See portfolio value, P&L, and market stats.',
            target: '[data-tour="dashboard-tab"]',
            position: 'bottom'
        },
        {
            id: 'scanner',
            title: 'Stock Scanner',
            description: 'Scan the market for stocks with buy signals. Filter by Halal compliance.',
            target: '[data-tour="scanner-tab"]',
            position: 'bottom'
        },
        {
            id: 'market',
            title: 'Market Overview',
            description: 'Track indices, sectors, and market movers. Including IPO tracker!',
            target: '[data-tour="market-tab"]',
            position: 'bottom'
        },
        {
            id: 'scan-button',
            title: 'Scan the Market',
            description: 'Click this button to scan for stocks matching your criteria.',
            target: '[data-tour="scan-button"]',
            position: 'left'
        },
        {
            id: 'halal-filter',
            title: 'Halal Filter',
            description: 'Toggle to show only Shariah-compliant stocks.',
            target: '[data-tour="halal-filter"]',
            position: 'bottom'
        },
        {
            id: 'watchlist',
            title: 'Your Watchlist',
            description: 'Save stocks you\'re interested in to track them easily.',
            target: '[data-tour="watchlist"]',
            position: 'bottom'
        },
        {
            id: 'theme',
            title: 'Theme Toggle',
            description: 'Switch between dark and light modes for your preference.',
            target: '[data-tour="theme-toggle"]',
            position: 'left'
        },
        {
            id: 'shortcuts',
            title: 'Keyboard Shortcuts',
            description: 'Press ? anytime to see all keyboard shortcuts. Ctrl+K opens quick search.',
            target: null,
            position: 'center'
        },
        {
            id: 'complete',
            title: 'You\'re All Set! ✨',
            description: 'Start exploring Stock Scanner. Happy trading!',
            target: null,
            position: 'center'
        }
    ];

const OnboardingTour = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(() => {
        const completed = localStorage.getItem(STORAGE_KEY);
        return !completed;
    });
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState(null);


    useEffect(() => {
        // Highlight the current target element
        const step = tourSteps[currentStep];
        if (step.target) {
            const element = document.querySelector(step.target);
            if (element) {
                // Wrap in setTimeout to avoid synchronous state update during render
                setTimeout(() => setHighlightedElement(element), 0);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setTimeout(() => setHighlightedElement(null), 0);
        }
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
        setHighlightedElement(null);
        onComplete?.();
    };

    const handleRestart = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setCurrentStep(0);
        setIsVisible(true);
    }, []);

    // Expose restart function globally for testing/debugging
    useEffect(() => {
        window.restartTour = handleRestart;
        return () => delete window.restartTour;
    }, [handleRestart]);

    if (!isVisible) return null;

    const step = tourSteps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === tourSteps.length - 1;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 z-[9998] transition-opacity"
                onClick={handleSkip}
            />

            {/* Highlight Box */}
            {highlightedElement && (
                <div
                    className="fixed z-[9999] rounded-lg ring-4 ring-emerald-500 ring-offset-4 ring-offset-gray-900 pointer-events-none transition-all duration-300"
                    style={{
                        top: highlightedElement.getBoundingClientRect().top - 8,
                        left: highlightedElement.getBoundingClientRect().left - 8,
                        width: highlightedElement.offsetWidth + 16,
                        height: highlightedElement.offsetHeight + 16
                    }}
                />
            )}

            {/* Tour Modal */}
            <div className={`fixed z-[10000] ${step.position === 'center' ? 'inset-0 flex items-center justify-center' : ''}`}>
                <div
                    className="bg-gray-800 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-900/20 max-w-md w-full mx-4 animate-scale-in"
                    style={step.position !== 'center' && highlightedElement ? getTooltipPosition(highlightedElement, step.position) : {}}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs text-gray-400">
                                Step {currentStep + 1} of {tourSteps.length}
                            </span>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-1.5 pb-4">
                        {tourSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                    ? 'bg-emerald-500 w-6'
                                    : index < currentStep
                                        ? 'bg-emerald-500/50'
                                        : 'bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-700/50 bg-gray-900/50 rounded-b-2xl">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Skip Tour
                        </button>
                        <div className="flex gap-2">
                            {!isFirstStep && (
                                <button
                                    onClick={handlePrev}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                            >
                                {isLastStep ? (
                                    <>
                                        <Check size={16} />
                                        Get Started
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </>
    );
};

// Helper function to position tooltip relative to target
const getTooltipPosition = (element, position) => {
    const rect = element.getBoundingClientRect();
    const offset = 16;

    switch (position) {
        case 'bottom':
            return {
                position: 'fixed',
                top: rect.bottom + offset,
                left: Math.max(16, rect.left + rect.width / 2 - 200)
            };
        case 'top':
            return {
                position: 'fixed',
                bottom: window.innerHeight - rect.top + offset,
                left: Math.max(16, rect.left + rect.width / 2 - 200)
            };
        case 'left':
            return {
                position: 'fixed',
                top: rect.top,
                right: window.innerWidth - rect.left + offset
            };
        case 'right':
            return {
                position: 'fixed',
                top: rect.top,
                left: rect.right + offset
            };
        default:
            return {};
    }
};

// Export utility to manually trigger tour
// eslint-disable-next-line react-refresh/only-export-components
export const restartOnboardingTour = () => {
    localStorage.removeItem('stockscanner_tour_completed');
    window.location.reload();
};

export default OnboardingTour;
