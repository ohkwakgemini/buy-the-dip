/**
 * 라이브 대시보드 카드 (FNG, BTC, 데이터 상태)
 */

import { formatKST } from '../lib/data';
import type { WsState } from '../lib/upbitWs';

interface StatsCardsProps {
    fngValue: number;
    fngStatus: string;
    btcPrice: number;
    wsState: WsState;
    metaUpdate: string; // ISO UTC
    isFngHoldLast: boolean;
}

export default function StatsCards({
    fngValue,
    fngStatus,
    btcPrice,
    wsState,
    metaUpdate,
    isFngHoldLast,
}: StatsCardsProps) {
    const formatKRW = (value: number) => {
        return '₩' + Math.floor(value).toLocaleString('ko-KR');
    };

    const getFngColor = (value: number) => {
        if (value <= 25) return '#f44336'; // Extreme Fear - 빨강
        if (value <= 45) return '#ff9800'; // Fear - 주황
        if (value <= 55) return '#ffc107'; // Neutral - 노랑
        if (value <= 75) return '#8bc34a'; // Greed - 연두
        return '#4caf50'; // Extreme Greed - 초록
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            margin: '20px 0'
        }}>
            {/* FNG 카드 */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                    공포·탐욕 지수
                </div>
                <div style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: getFngColor(fngValue)
                }}>
                    {fngValue}
                </div>
                <div style={{ fontSize: '18px', marginTop: '8px' }}>
                    {fngStatus}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '12px' }}>
                    출처: alternative.me
                </div>
            </div>

            {/* BTC Live 카드 */}
            <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                    BTC 현재가 {wsState.connected ? '🟢' : '🔴'}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                    {formatKRW(btcPrice)}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '12px' }}>
                    {wsState.connected ? '실시간 연결됨' : '연결 끊김'}
                </div>
                {wsState.lastUpdate && (
                    <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                        마지막 수신: {formatKST(wsState.lastUpdate)}
                    </div>
                )}
            </div>

            {/* 데이터 상태 카드 */}
            <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                    데이터 상태
                </div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                    📊 정적 데이터 업데이트
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                    {new Date(metaUpdate).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                </div>
                {wsState.connected && (
                    <div style={{ fontSize: '14px', marginTop: '12px' }}>
                        ⚡ BTC 실시간 보정 중
                    </div>
                )}
                {isFngHoldLast && (
                    <div style={{ fontSize: '14px', marginTop: '12px' }}>
                        🔄 FNG 최신값 유지 중
                    </div>
                )}
            </div>
        </div>
    );
}
