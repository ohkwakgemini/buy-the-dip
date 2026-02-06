import type { WsState } from '../lib/upbitWs';

interface StatsCardsProps {
    fngValue: number;
    fngStatus: string;
    btcPrice: number;
    wsState: WsState;
}

export default function StatsCards({
    fngValue,
    fngStatus,
    btcPrice,
    wsState,
}: StatsCardsProps) {
    // 쉼표 포맷
    const formatComma = (val: number) => val.toLocaleString();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* FNG CARD */}
            <div className="nes-container">
                <h3 style={{ fontSize: '12px', color: 'var(--pixel-dim)', marginBottom: '10px' }}>FEAR & GREED</h3>
                <div style={{ fontSize: '24px', color: fngValue <= 25 ? '#ff0000' : fngValue >= 75 ? '#00ff00' : '#ffffff' }}>
                    {fngValue}
                </div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>{fngStatus.toUpperCase()}</div>
            </div>

            {/* BTC CARD */}
            <div className="nes-container">
                <h3 style={{ fontSize: '12px', color: 'var(--pixel-dim)', marginBottom: '10px' }}>
                    BTC PRICE {wsState.connected ? <span style={{ color: '#00ff00' }}>●</span> : <span style={{ color: '#ff0000' }}>●</span>}
                </h3>
                <div style={{ fontSize: '20px', color: '#ff00ff' }}>
                    ₩{formatComma(btcPrice)}
                </div>

                {/* 디버그용: 실제 상태 표시 */}
                {!wsState.connected && (
                    <div style={{ fontSize: '10px', color: '#ff0000', marginTop: '5px' }}>DISCONNECTED</div>
                )}
            </div>

        </div>
    );
}
