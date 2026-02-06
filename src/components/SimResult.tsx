/**
 * 시뮬레이션 결과 표시 컴포넌트
 */

import type { SimResult } from '../lib/sim';

interface SimResultProps {
    result: SimResult | null;
    isCalculating: boolean;
}

export default function SimResult({ result, isCalculating }: SimResultProps) {
    if (isCalculating) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: '#f5f5f5',
                borderRadius: '12px',
                margin: '20px 0'
            }}>
                <div style={{ fontSize: '18px', color: '#666' }}>
                    계산 중...
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: '#f5f5f5',
                borderRadius: '12px',
                margin: '20px 0'
            }}>
                <div style={{ fontSize: '18px', color: '#666' }}>
                    매수 기간을 선택하여 시뮬레이션을 시작하세요
                </div>
            </div>
        );
    }

    const formatKRW = (value: number) => {
        return '₩' + Math.floor(value).toLocaleString('ko-KR');
    };

    const formatBTC = (value: number) => {
        return value.toFixed(8) + ' BTC';
    };

    const profitColor = result.profit >= 0 ? '#4caf50' : '#f44336';

    return (
        <div style={{ margin: '20px 0' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
                📊 시뮬레이션 결과
            </h2>

            {/* 주요 지표 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        총 투자금
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {formatKRW(result.totalInvested)}
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        누적 BTC
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {formatBTC(result.totalBtc)}
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        평균 단가
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {formatKRW(result.avgPrice)}
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        현재 평가
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {formatKRW(result.currentValue)}
                    </div>
                </div>
            </div>

            {/* 손익 */}
            <div style={{
                background: profitColor,
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px'
            }}>
                <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '8px' }}>
                    {result.profit >= 0 ? '💰 수익' : '📉 손실'}
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                    {formatKRW(Math.abs(result.profit))}
                </div>
                <div style={{ fontSize: '24px', marginTop: '8px' }}>
                    {result.profitRate >= 0 ? '+' : ''}{result.profitRate.toFixed(2)}%
                </div>
            </div>

            {/* 상세 정보 */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>상세 정보</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>매수 횟수:</span>
                        <span style={{ fontWeight: 'bold' }}>{result.buyCount}회</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>스킵 횟수:</span>
                        <span style={{ fontWeight: 'bold' }}>{result.skipCount}회</span>
                    </div>
                    {result.buyStoppedAt && (
                        <div style={{
                            padding: '12px',
                            background: '#fff3cd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}>
                            ⚠️ Extreme Greed 도달로 {result.buyStoppedAt}부터 매수 중단
                        </div>
                    )}
                    {result.holdLastDates.length > 0 && (
                        <div style={{
                            padding: '12px',
                            background: '#e3f2fd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}>
                            🔄 Hold-last FNG 사용: {result.holdLastDates.length}일
                        </div>
                    )}
                </div>
            </div>

            {/* 면책 조항 */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#fff3e0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#666'
            }}>
                ⚠️ 이 결과는 과거 데이터 기반 시뮬레이션입니다. 실제 투자 결과를 보장하지 않으며,
                투자 권유가 아닙니다. 모든 투자 결정은 본인의 책임입니다.
            </div>
        </div>
    );
}
