/**
 * 라이브 대시보드 카드 - 간소화 버전
 */

import type { WsState } from '../lib/upbitWs';

interface StatsCardsProps {
    fngValue: number;
    fngStatus: string;
    btcPrice: number;
    wsState: WsState;
    isFngHoldLast: boolean;
}

export default function StatsCards({
    fngValue,
    fngStatus,
    btcPrice,
    wsState,
    isFngHoldLast,
}: StatsCardsProps) {
    const formatKRW = (value: number) => {
        return '₩' + Math.floor(value).toLocaleString('ko-KR');
    };

    const getFngColor = (value: number) => {
        if (value <= 25) return '#ef4444';
        if (value <= 45) return '#f97316';
        if (value <= 55) return '#f59e0b';
        if (value <= 75) return '#84cc16';
        return '#10b981';
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            margin: '16px 0'
        }}>
            {/* FNG 카드 */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow)',
            }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
                    공포·탐욕 지수
                </div>
                <div style={{
                    fontSize: '42px',
                    fontWeight: 'bold',
                    color: getFngColor(fngValue),
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    marginBottom: '4px'
                }}>
                    {fngValue}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>
                    {fngStatus}
                </div>
                {isFngHoldLast && (
                    <div style={{
                        fontSize: '11px',
                        opacity: 0.7,
                        marginTop: '8px'
                    }}>
                        🔄 최신값 유지 중
                    </div>
                )}
            </div>

            {/* BTC Live 카드 */}
            <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow)',
            }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
                    BTC 현재가 {wsState.connected ? '🟢' : '🔴'}
                </div>
                <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    marginBottom: '4px'
                }}>
                    {formatKRW(btcPrice)}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px' }}>
                    {wsState.connected ? '실시간 연결됨' : '연결 끊김'}
                </div>
            </div>
        </div>
    );
}
