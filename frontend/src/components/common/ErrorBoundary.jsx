import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Minimal fallback for small components
            if (this.props.minimal) {
                return (
                    <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
                        <p className="text-red-300 text-sm">Failed to load</p>
                        <button
                            onClick={this.handleRetry}
                            className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                        >
                            Try again
                        </button>
                    </div>
                );
            }

            return (
                <div className="p-6 bg-red-900/20 border border-red-800 rounded-xl text-red-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-red-300">Something went wrong</h3>
                            <p className="text-sm text-red-400/80">An error occurred in this component</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors text-gray-300"
                        >
                            <Home className="w-4 h-4" />
                            Reload Page
                        </button>
                    </div>

                    <details className="text-xs bg-black/50 p-4 rounded-lg font-mono overflow-auto max-h-48 border border-red-900/50">
                        <summary className="cursor-pointer text-red-400 hover:text-red-300 mb-2">
                            Error Details
                        </summary>
                        <div className="whitespace-pre-wrap text-red-300/70">
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </div>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * HOC to wrap components with error boundary
 */
// eslint-disable-next-line react-refresh/only-export-components
export const withErrorBoundary = (Component, options = {}) => {
    return function WrappedComponent(props) {
        return (
            <ErrorBoundary minimal={options.minimal}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
};

export default ErrorBoundary;
