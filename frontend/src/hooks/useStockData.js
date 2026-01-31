import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../config/api';
import { useToast } from '../components/common/Toast';

export const useStockData = (useLiveMode = true) => {
    const [stocks, setStocks] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [wsConnecting, setWsConnecting] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [priceUpdates, setPriceUpdates] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const toast = useToast();

    // WebSocket connection handler
    const connectWebSocket = useCallback(() => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        setWsConnecting(true);
        setErrorMsg('');

        try {
            const ws = new WebSocket(API.WS_PRICES);
            wsRef.current = ws;

            ws.onopen = () => {
                setWsConnected(true);
                setWsConnecting(false);
                setErrorMsg('');
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'initial') {
                        setStocks(message.data);
                    }
                    else if (message.type === 'price_update') {
                        setLastUpdate(message.timestamp);
                        setPriceUpdates(prev => prev + 1);

                        setStocks(prevStocks => {
                            const updatedStocks = [...prevStocks];
                            if (Array.isArray(message.data)) {
                                message.data.forEach(update => {
                                    const stockIndex = updatedStocks.findIndex(s => s.symbol === update.symbol);
                                    if (stockIndex !== -1) {
                                        updatedStocks[stockIndex] = {
                                            ...updatedStocks[stockIndex],
                                            price: update.price,
                                            priceChange: update.change,
                                            priceChangePercent: update.changePercent
                                        };
                                    }
                                });
                            }
                            return updatedStocks;
                        });
                    }
                } catch (err) {
                    console.error('[WS] Message parse error:', err);
                }
            };

            ws.onclose = () => {
                if (wsRef.current !== ws && wsRef.current !== null) return;
                setWsConnected(false);
                setWsConnecting(false);
                wsRef.current = null;

                if (useLiveMode) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, 3000);
                }
            };

            ws.onerror = (error) => {
                if (wsRef.current !== ws && wsRef.current !== null) return;
                console.error('[WS] Error:', error);
                setErrorMsg('WebSocket connection failed. Is the backend running?');
                setWsConnecting(false);
            };

        } catch (err) {
            console.error('[WS] Connection error:', err);
            setErrorMsg('Failed to connect to WebSocket');
            setWsConnecting(false);
        }
    }, [useLiveMode]);

    const disconnectWebSocket = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setWsConnected(false);
        setWsConnecting(false);
    }, []);

    // Connect WebSocket on mount
    useEffect(() => {
        connectWebSocket();
        return () => {
            disconnectWebSocket();
        };
    }, [connectWebSocket, disconnectWebSocket]);

    const handleScan = async () => {
        setIsScanning(true);
        setErrorMsg('');

        try {
            const response = await fetch(API.SCAN);
            if (!response.ok) throw new Error('Failed to connect to backend');

            const data = await response.json();
            setStocks(data);

            if (!wsConnected) {
                connectWebSocket();
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Connection Failed: Is the backend server running?');
            toast.error('Scan Failed', 'Could not connect to backend server');
        } finally {
            setIsScanning(false);
        }
    };

    return {
        stocks,
        isScanning,
        wsConnected,
        wsConnecting,
        lastUpdate,
        priceUpdates,
        errorMsg,
        handleScan,
        setStocks // Exposed for manual updates if needed
    };
};
