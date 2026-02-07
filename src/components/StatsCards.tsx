import type { WsState } from '../lib/upbitWs';

interface StatsCardsProps {
    fngValue: number;
    fngStatus: string;
    fngDate: string;  // FNG 데이터 날짜 (YYYY-MM-DD)
    btcPrice: number;
    wsState: WsState;
    isMobile: boolean;
}

export default function StatsCards({
    fngValue,
    fngStatus,
    fngDate,
    btcPrice,
    wsState,
    isMobile,
}: StatsCardsProps) {
    const formatComma = (val: number) => val.toLocaleString();

    const getKorenaStatus = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('extreme fear')) return '극단적 공포';
        if (s.includes('fear')) return '공포';
        if (s.includes('neutral')) return '중립';
        if (s.includes('extreme greed')) return '극단적 탐욕';
        if (s.includes('greed')) return '탐욕';
        return status;
    };

    const statusText = getKorenaStatus(fngStatus);
    const statusColor = fngValue <= 25 ? '#FF3333' : fngValue >= 75 ? '#33FF33' : '#FFFFFF';

    const isConnected = wsState.connected;
    const priceColor = isConnected ? '#FF3399' : '#888888';
    const priceOpacity = isConnected ? 1 : 0.6;

    // 모바일/PC 폰트 크기 분기
    const fngScoreSize = isMobile ? '36px' : '42px';
    const fngTextSize = isMobile ? '16px' : '20px';
    const btcPriceSize = isMobile ? '36px' : '48px';
    const labelSize = isMobile ? '14px' : '16px';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>

            {/* 공포탐욕지수 */}
            <div className="nes-container" style={{ position: 'relative', overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: labelSize, color: 'var(--text-tertiary)', margin: 0, marginRight: '8px' }}>공포·탐욕 지수</h3>

                    {/* 툴팁 컨테이너 */}
                    <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}>
                        <span style={{ fontSize: '12px', color: '#888', borderBottom: '1px dotted #888' }}>※공포·탐욕 지수란?</span>

                        {/* 툴팁 내용 */}
                        <div className="tooltip-content" style={{
                            visibility: 'hidden', opacity: 0,
                            position: isMobile ? 'fixed' : 'absolute',
                            zIndex: 9999,
                            width: '280px',
                            top: isMobile ? '50%' : '100%',
                            left: isMobile ? '50%' : '0',
                            marginTop: isMobile ? '0' : '10px',
                            transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                            padding: '15px', background: 'rgba(0,0,0,0.95)',
                            border: '2px solid #FFF',
                            fontSize: '12px', lineHeight: '1.5', color: '#DDD',
                            transition: 'opacity 0.2s', pointerEvents: 'none',
                            textAlign: 'left',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                            borderRadius: '8px'
                        }}>
                            <p style={{ fontWeight: 'bold', color: '#FFF', marginBottom: '8px' }}>※ 공포·탐욕 지수란?</p>
                            <p style={{ marginBottom: '8px', color: '#CCC' }}>투자 심리를 0~100 수치로 나타낸 지표입니다.</p>

                            <div style={{ marginBottom: '4px' }}><span style={{ color: '#FF3333' }}>🟥 0~25 [극단적 공포]</span><br />적극적 매수를 고려할 타이밍입니다.</div>
                            <div style={{ marginBottom: '4px' }}><span style={{ color: '#FF9933' }}>🟧 25~45 [공포]</span><br />분할로 슬슬 매수를 고민해 보세요.</div>
                            <div style={{ marginBottom: '4px' }}><span style={{ color: '#FFFF33' }}>🟨 45~55 [중립]</span><br />시장 방향을 지켜보는 관망 구간입니다.</div>
                            <div style={{ marginBottom: '4px' }}><span style={{ color: '#33FF33' }}>🟩 55~75 [탐욕]</span><br />수익 중이라면 슬슬 매도를 고민해 보세요.</div>
                            <div style={{ marginBottom: '8px' }}><span style={{ color: '#33FF99' }}>🐲 75~100 [극단적 탐욕]</span><br />시장 과열! 이제는 팔 때가 되었습니다.</div>

                            <p style={{ background: '#333', padding: '6px', borderRadius: '4px', margin: 0 }}>
                                💬 Tip<br />"남들이 공포에 떨 때 사고,<br />환희에 찰 때 파세요."
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <span style={{ fontSize: fngScoreSize, fontWeight: 'bold', color: statusColor, lineHeight: 1 }}>{fngValue}</span>
                    <span style={{ fontSize: fngTextSize, color: statusColor, paddingBottom: isMobile ? '4px' : '6px' }}>{statusText}</span>
                </div>

                {/* 날짜 정보 */}
                <div style={{ marginTop: '8px', fontSize: isMobile ? '12px' : '14px', color: '#888' }}>
                    기준: {fngDate} (Alternative.me)
                </div>

                {/* 툴팁 스타일 (JSX style 태그) */}
                <style>{`
                    .tooltip-container:hover .tooltip-content,
                    .tooltip-container:active .tooltip-content {
                        visibility: visible !important;
                        opacity: 1 !important;
                    }
                `}</style>
            </div>

            {/* 비트코인 가격 */}
            <div className="nes-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: labelSize, color: 'var(--text-tertiary)' }}>비트코인 (BTC)</h3>
                    {/* 연결 상태 표시 */}
                    <div style={{ fontSize: isMobile ? '12px' : '14px', display: 'flex', alignItems: 'center', gap: '6px', opacity: isConnected ? 1 : 0.5 }}>
                        <span style={{
                            display: 'inline-block', width: isMobile ? '8px' : '10px', height: isMobile ? '8px' : '10px', borderRadius: '50%',
                            backgroundColor: isConnected ? '#33FF33' : '#888',
                            boxShadow: isConnected ? '0 0 5px #33FF33' : 'none',
                            transition: 'all 0.3s'
                        }}></span>
                        <span style={{ color: isConnected ? '#33FF33' : '#888', transition: 'color 0.3s' }}>
                            실시간
                        </span>
                    </div>
                </div>

                <div style={{
                    fontSize: btcPriceSize, fontWeight: 'bold',
                    color: priceColor, opacity: priceOpacity,
                    lineHeight: 1, letterSpacing: isMobile ? '-1px' : '-2px',
                    transition: 'color 0.3s, opacity 0.3s'
                }}>
                    {formatComma(btcPrice)}원
                </div>
            </div>

        </div>
    );
}
