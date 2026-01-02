
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from './logger';
import http from 'http';

let wss: WebSocketServer | null = null;

export const initWebSocket = (server: http.Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        logger.info('New WebSocket connection established');

        ws.on('message', (message: string) => {
            logger.info(`Received message: ${message}`);
            // Echo or handle messages
        });

        ws.on('close', () => {
             logger.info('WebSocket connection closed');
        });

        ws.on('error', (err) => {
             logger.error(`WebSocket error: ${err.message}`);
        });
        
        // Send initial ping to confirm connection
        ws.send(JSON.stringify({ type: 'connected', msg: 'Welcome to UniZ WebSocket Server' }));
    });

    logger.info('WebSocket Server initialized');
};

export const broadcast = (data: any) => {
    if (!wss) return;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};
