/**
 * Upbit WebSocket 연결 및 실시간 BTC 가격 수신
 */

import { getTodayKST } from './data';

export interface WsState {
    connected: boolean;
    lastPrice: number | null;
    lastUpdate: Date | null;
    error: string | null;
}

type WsCallback = (price: number) => void;

export class UpbitWebSocket {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectDelay = 30000; // 30초
    private callback: WsCallback | null = null;
    private state: WsState = {
        connected: false,
        lastPrice: null,
        lastUpdate: null,
        error: null,
    };

    constructor(callback: WsCallback) {
        this.callback = callback;
        this.connect();
    }

    private connect() {
        try {
            this.ws = new WebSocket('wss://api.upbit.com/websocket/v1');

            this.ws.onopen = () => {
                console.log('✅ Upbit WebSocket connected');
                this.state.connected = true;
                this.state.error = null;
                this.reconnectAttempts = 0;

                // 구독 메시지
                const subscribeMsg = [
                    { ticket: 'buy-the-dip-' + Date.now() },
                    { type: 'ticker', codes: ['KRW-BTC'] },
                ];
                this.ws?.send(JSON.stringify(subscribeMsg));
            };

            this.ws.onmessage = async (event) => {
                const blob = event.data as Blob;
                const text = await blob.text();
                const data = JSON.parse(text);

                if (data.type === 'ticker' && data.code === 'KRW-BTC') {
                    const price = Math.floor(data.trade_price);
                    this.state.lastPrice = price;
                    this.state.lastUpdate = new Date();
                    this.callback?.(price);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.state.error = 'WebSocket 연결 오류';
            };

            this.ws.onclose = () => {
                console.log('WebSocket closed, reconnecting...');
                this.state.connected = false;
                this.reconnect();
            };
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            this.state.error = 'WebSocket 생성 실패';
            this.reconnect();
        }
    }

    private reconnect() {
        const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            this.maxReconnectDelay
        );
        this.reconnectAttempts++;

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);
        setTimeout(() => this.connect(), delay);
    }

    getState(): WsState {
        return { ...this.state };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

/**
 * React Hook for Upbit WebSocket
 */
export function useUpbitWebSocket(
    onPriceUpdate: (price: number) => void
): WsState {
    const [state, setState] = React.useState<WsState>({
        connected: false,
        lastPrice: null,
        lastUpdate: null,
        error: null,
    });

    React.useEffect(() => {
        const ws = new UpbitWebSocket((price) => {
            onPriceUpdate(price);
            setState(ws.getState());
        });

        const interval = setInterval(() => {
            setState(ws.getState());
        }, 1000);

        return () => {
            ws.disconnect();
            clearInterval(interval);
        };
    }, [onPriceUpdate]);

    return state;
}

// React import (TypeScript에서 사용하기 위해)
import * as React from 'react';
