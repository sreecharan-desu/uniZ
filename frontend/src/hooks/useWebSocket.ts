
import { useEffect, useRef, useCallback, useState } from 'react';

type WebSocketMessage = {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
};

// Singleton context to ensure only one connection (module-level)
let socket: WebSocket | null = null;
const reconnectAttributes = {
    attempts: 0,
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 30000,
};

    // Listeners for messages
    const messageListeners = new Set<(msg: WebSocketMessage) => void>();

    // Listeners to update all hook instances
    const statusListeners = new Set<(status: boolean) => void>();

    const updateStatus = (isConnected: boolean) => {
        statusListeners.forEach(listener => listener(isConnected));
    };

    const notifyListeners = (msg: WebSocketMessage) => {
        messageListeners.forEach(listener => listener(msg));
    };

    export const useWebSocket = (url: string | undefined, onMessage?: (msg: WebSocketMessage) => void) => {
        // Determine the WS URL from env or argument
        // Prioritize specific URL if passed, else fallback to ENV
        const wsUrl = url || import.meta.env.VITE_WS_URL || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host;

        // We use a ref to keep track of the message handler
        const onMessageRef = useRef(onMessage);
        
        // State to track connection status in this component
        const [isConnected, setIsConnected] = useState(socket?.readyState === WebSocket.OPEN);

        useEffect(() => {
            onMessageRef.current = onMessage;
        }, [onMessage]);

        // Register message listener
        useEffect(() => {
            const handler = (msg: WebSocketMessage) => {
                if (onMessageRef.current) {
                    onMessageRef.current(msg);
                }
            };
            messageListeners.add(handler);
            return () => {
                messageListeners.delete(handler);
            };
        }, []);

        // Register status listener
        useEffect(() => {
            const handler = (status: boolean) => setIsConnected(status);
            statusListeners.add(handler);
            // Sync initial status
            setIsConnected(socket?.readyState === WebSocket.OPEN);
            return () => {
                statusListeners.delete(handler);
            };
        }, []);

        const connect = useCallback(() => {
            if (!wsUrl) return;
            
            // Prevent duplicate connections if already open or connecting
            if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
                 if (socket.readyState === WebSocket.OPEN) {
                     updateStatus(true);
                 }
                return;
            }

            console.log('Connecting to WebSocket Side Channel...', wsUrl);
            updateStatus(false);
            
            try {
                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    console.log('WebSocket Side Channel Connected');
                    reconnectAttributes.attempts = 0; // Reset backoff on success
                    updateStatus(true);
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        notifyListeners(data);
                    } catch (err) {
                        console.warn('Received malformed WebSocket message, ignoring.', err);
                    }
                };

                socket.onclose = (event) => {
                    console.log('WebSocket connection closed.', event.reason);
                    socket = null; // Clean up the reference
                    updateStatus(false);
                    attemptReconnect();
                };

                socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    // On error, the close event will usually trigger shortly after, handling the reconnect
                };

            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                attemptReconnect();
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [wsUrl]);

        const attemptReconnect = () => {
            if (reconnectAttributes.attempts >= reconnectAttributes.maxAttempts) {
                console.warn('Max WebSocket reconnect attempts reached. Falling back to API polling only.');
                return;
            }

            const delay = Math.min(
                reconnectAttributes.baseDelay * Math.pow(2, reconnectAttributes.attempts),
                reconnectAttributes.maxDelay
            );

            console.log(`Attempting WebSocket reconnect in ${delay}ms... (Attempt ${reconnectAttributes.attempts + 1}/${reconnectAttributes.maxAttempts})`);
            
            reconnectAttributes.attempts++;
            setTimeout(() => {
                connect();
            }, delay);
        };

        useEffect(() => {
            // Connect on mount
            connect();
        }, [connect]);

        return {
            isConnected
        };
    };
