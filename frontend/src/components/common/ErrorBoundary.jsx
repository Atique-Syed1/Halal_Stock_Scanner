import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-900/20 border border-red-800 rounded-lg text-red-200">
                    <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        Something went wrong.
                    </div>
                    <details className="whitespace-pre-wrap text-xs bg-black/50 p-4 rounded mt-2 font-mono overflow-auto max-h-60">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
