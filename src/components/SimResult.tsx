/**
 * 시뮬레이션 결과 표시 컴포넌트 - 개선 버전
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
                padding: '60px',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: '16px',
                margin: '20px 0',
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>
                    ⏳ 계산 중...
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div style={{
                padding: '60px',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: '16px',
                margin: '20px 0',
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    📊 차트에서 매수 시작/종료 시점을 선택하세요
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    차트를 클릭하여 시작 → 종료 순서로 선택
                </div>
            </div>
        );
    }

    const formatKRW = (value: number) => {
        const absValue = Math.abs(value);
        if (absValue >= 100000000) {
            return (value / 100000000).toFixed(2) + '억원';
        } else if (absValue >= 10000000) {
            return (value / 10000000).toFixed(1) + '천만원';
        } else if (absValue >= 1000000) {
            return (value / 1000000).toFixed(1) + '백만원';
        } else {
            return '₩' + Math.floor(value).toLocaleString('ko-KR');
        }
    };

    const formatBTC = (value: number) => {
        return value.toFixed(8) + ' BTC';
    };

    const profitColor = result.profit >= 0 ? 'var(--color-greed)' : 'var(--color-fear)';

    return (
        <div style={{ margin: '20px 0' }} className="fade-in">
            <h2 style={{
                fontSize: '28px',
                marginBottom: '24px',
                color: 'var(--text-primary)',
                textAlign: 'center'
            }}>
                📊 시뮬레이션 결과
            </h2>

            {/* 손익 하이라이트 */}
            <div style={{
                background: `linear-gradient(135deg, ${profitColor}dd, ${profitColor}aa)`,
                color: 'white',
                padding: '32px',
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-lg)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '12px' }}>
                    {result.profit >= 0 ? '💰 총 수익' : '📉 총 손실'}
                </div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {formatKRW(Math.abs(result.profit))}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '600' }}>
                    {result.profitRate >= 0 ? '+' : ''}{result.profitRate.toFixed(2)}%
                </div>
            </div>

            {/* 주요 지표 그리드 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    background: 'var(--bg-card)',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        총 투자금
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {formatKRW(result.totalInvested)}
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-card)',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        누적 BTC
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {formatBTC(result.totalBtc)}
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-card)',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        평균 단가
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {formatKRW(result.avgPrice)}
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-card)',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        현재 평가
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {formatKRW(result.currentValue)}
                    </div>
                </div>
            </div>

            {/* 상세 정보 */}
            <div style={{
                background: 'var(--bg-card)',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow)',
                border: '1px solid var(--border-color)'
            }}>
                <h3 style={{
                    fontSize: '18px',
                    marginBottom: '16px',
                    color: 'var(--text-primary)'
                }}>
                    상세 정보
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-color)'
                    }}>
                        <span style={{ color: 'var(--text-secondary)' }}>매수 횟수:</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{result.buyCount}회</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-color)'
                    }}>
                        <span style={{ color: 'var(--text-secondary)' }}>스킵 횟수:</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{result.skipCount}회</span>
                    </div>
                    {result.skipCount > 0 && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: 'var(--color-neutral)',
                            border: '1px solid var(--color-neutral)'
                        }}>
                            ⚠️ 데이터 없음으로 스킵된 날짜: {result.skipCount}일
                        </div>
                    )}

                </div>
            </div>

            {/* 면책 조항 */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                border: '1px solid var(--color-neutral)'
            }}>
                ⚠️ 이 결과는 과거 데이터 기반 시뮬레이션입니다.
                실제 투자 결과를 보장하지 않으며, 투자 권유가 아닙니다.
                모든 투자 결정은 본인의 책임입니다.
            </div>
        </div>
    );
}
