import React, { useState, useEffect } from 'react';
import { Bot, X, ShieldAlert, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import API from '../../config/api';

const PortfolioAnalysisModal = ({ isOpen, onClose }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const res = await fetch(API.PORTFOLIO_ANALYZE, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await res.json();
                setAnalysis(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchAnalysis();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative max-h-[80vh]">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-violet-900 to-fuchsia-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
                            <Bot className="w-8 h-8 text-fuchsia-300" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">AI Portfolio Audit</h2>
                    <p className="text-fuchsia-200 text-sm">Comprehensive risk & allocation analysis</p>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
                            <p className="text-gray-400 animate-pulse">Analyzing holdings & risk factors...</p>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-6">
                            {/* Verdict Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Risk Score</h3>
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className={`w-5 h-5 ${
                                            analysis.risk_score === 'High' ? 'text-red-400' : 
                                            analysis.risk_score === 'Medium' ? 'text-yellow-400' : 'text-emerald-400'
                                        }`} />
                                        <span className={`text-xl font-bold ${
                                            analysis.risk_score === 'High' ? 'text-red-400' : 
                                            analysis.risk_score === 'Medium' ? 'text-yellow-400' : 'text-emerald-400'
                                        }`}>
                                            {analysis.risk_score}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Verdict</h3>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-blue-400" />
                                        <span className="text-xl font-bold text-blue-400">
                                            {analysis.verdict}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Points */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-fuchsia-400" /> Analysis
                                </h3>
                                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 space-y-2">
                                    {analysis.analysis?.map((point, i) => (
                                        <p key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-fuchsia-500 mt-1">•</span>
                                            <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" /> Suggestions
                                </h3>
                                <div className="bg-yellow-900/10 rounded-xl p-4 border border-yellow-900/30 space-y-2">
                                    {analysis.suggestions?.map((point, i) => (
                                        <p key={i} className="text-sm text-yellow-200/80 flex items-start gap-2">
                                            <span className="text-yellow-500 mt-1">→</span>
                                            <span>{point}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-red-400">Analysis unavailable. Try adding more stocks first.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioAnalysisModal;
