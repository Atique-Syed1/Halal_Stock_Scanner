import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
import API from '../../config/api';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!isLogin && password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            const endpoint = isLogin ? API.AUTH_LOGIN : API.AUTH_REGISTER;
            const payload = isLogin 
                ? new URLSearchParams({ username: email, password: password }) // OAuth2 form data
                : JSON.stringify({ email, password });

            const headers = isLogin 
                ? { 'Content-Type': 'application/x-www-form-urlencoded' }
                : { 'Content-Type': 'application/json' };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: payload
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Authentication failed');
            }

            const data = await response.json();
            
            // Store token
            localStorage.setItem('token', data.access_token);
            
            // Close and reset
            onClose();
            window.location.reload(); // Simple reload to update auth state
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isLogin ? 'Sign in to access your portfolio' : 'Join HalalTrade Pro today'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-all"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-all"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="relative group animate-fade-in">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-all"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/20 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="p-4 bg-gray-800/30 text-center border-t border-gray-700/50">
                    <p className="text-sm text-gray-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
