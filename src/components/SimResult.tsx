import type { SimResult } from '../lib/sim';

interface SimResultProps {
    result: SimResult | null;
    isCalculating: boolean;
    isMobile: boolean;
}

export default function SimResultComp({ result, isCalculating, isMobile }: SimResultProps) {
    if (isCalculating) return <div className="nes-container" style={{ textAlign: 'center', color: '#888' }}>계산 중...</div>;

    if (!result) return (
        <div className="nes-container" style={{ textAlign: 'center', color: '#666', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>
                <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#888' }}>매수 시작일을 선택하면<br />시뮬레이션 결과가 표시됩니다.</p>
            </div>
        </div>
    );

    // 폰트 크기 변수화
    const valSize = isMobile ? '18px' : '24px';
    const labelSize = isMobile ? '14px' : '16px';
    const bigValSize = isMobile ? '32px' : '48px';
    const titleSize = isMobile ? '20px' : '24px';

    return (
        <div className="nes-container" style={{ padding: isMobile ? '15px' : undefined }}>
            <p className="pixel-title" style={{ fontSize: titleSize, borderBottom: 'none', marginBottom: '20px' }}>📊 시뮬레이션 리포트</p>

            {/* 공통 정보 */}
            <div style={{
                display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '15px' : '15px',
                marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)'
            }}>
                <div style={{ display: isMobile ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#888', fontSize: labelSize }}>총 투자원금</span>
                    <div style={{ fontSize: valSize, color: '#FFF', fontWeight: 'bold', marginTop: isMobile ? 0 : '8px' }}>
                        {result.totalInvested.toLocaleString()}원
                    </div>
                </div>
                <div style={{ display: isMobile ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#888', fontSize: labelSize }}>모은 비트코인</span>
                    <div style={{ fontSize: valSize, color: '#FF3399', fontWeight: 'bold', marginTop: isMobile ? 0 : '8px' }}>
                        {result.totalBtc.toFixed(8)} BTC
                    </div>
                </div>
                <div style={{ display: isMobile ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#888', fontSize: labelSize }}>평균 매수단가</span>
                    <div style={{ fontSize: valSize, color: '#FFF', fontWeight: 'bold', marginTop: isMobile ? 0 : '8px' }}>
                        {Math.floor(result.avgPrice).toLocaleString()}원
                    </div>
                </div>
            </div>

            {/* 시나리오 비교: 종료일 매도 vs 현재 보유 */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>

                {/* Case 1: 종료일에 팔았을 때 */}
                <div style={{ background: 'var(--bg-app)', padding: isMobile ? '20px' : '30px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: labelSize, color: '#888', marginBottom: '20px', textAlign: 'center' }}>
                        ① 종료일에 전량 매도했다면
                    </h4>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: bigValSize, fontWeight: 'bold',
                            color: result.profit >= 0 ? '#33FF33' : '#FF3333',
                            marginBottom: '10px'
                        }}>
                            {result.profit > 0 ? '+' : ''}{result.profitRate.toFixed(2)}%
                        </div>
                        <div style={{ fontSize: valSize, color: '#FFF' }}>
                            {result.profit > 0 ? '+' : ''}{Math.floor(result.profit).toLocaleString()}원
                        </div>
                    </div>
                </div>

                {/* Case 2: 현재까지 보유 중일 때 */}
                <div style={{ background: 'var(--bg-card-highlight)', padding: isMobile ? '20px' : '30px', border: '1px solid var(--color-accent-green)' }}>
                    <h4 style={{ fontSize: labelSize, color: '#FFF', marginBottom: '20px', textAlign: 'center' }}>
                        ② 아직 안 팔고 있다면 (현재)
                    </h4>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: bigValSize, fontWeight: 'bold',
                            color: result.profitByCurrent >= 0 ? '#33FF33' : '#FF3333',
                            marginBottom: '10px'
                        }}>
                            {result.profitByCurrent > 0 ? '+' : ''}{result.profitRateByCurrent.toFixed(2)}%
                        </div>
                        <div style={{ fontSize: valSize, color: '#FFF' }}>
                            {result.profitByCurrent > 0 ? '+' : ''}{Math.floor(result.profitByCurrent).toLocaleString()}원
                        </div>
                        <div style={{ fontSize: isMobile ? '12px' : '16px', color: '#888', marginTop: '14px' }}>
                            현재 평가액: {Math.floor(result.currentValue).toLocaleString()}원
                        </div>
                    </div>
                </div>
            </div>

            {result.skipCount > 0 && (
                <div style={{ marginTop: '20px', fontSize: '14px', color: '#FF3333', textAlign: 'center' }}>
                    ⚠️ 데이터 누락으로 {result.skipCount}회 매수를 건너뛰었습니다.
                </div>
            )}
        </div>
    );
}
