/**
 * 매수/청산 조건 입력 컴포넌트
 */

import { useState } from 'react';

export interface ControlsState {
    amountPerBuy: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    buyThreshold: number;
    consecutiveDays: number;
    useConsecutive: boolean;
    sellType: 'date' | 'current';
    sellDate: string;
    feeRate: number;
}

interface ControlsProps {
    onChange: (state: ControlsState) => void;
    minDate: string;
    maxDate: string;
}

export default function Controls({ onChange, minDate, maxDate }: ControlsProps) {
    const [state, setState] = useState<ControlsState>({
        amountPerBuy: 100000,
        frequency: 'weekly',
        buyThreshold: 25,
        consecutiveDays: 3,
        useConsecutive: false,
        sellType: 'current',
        sellDate: maxDate,
        feeRate: 0,
    });

    const updateState = (updates: Partial<ControlsState>) => {
        const newState = { ...state, ...updates };
        setState(newState);
        onChange(newState);
    };

    return (
        <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            margin: '20px 0'
        }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>
                ⚙️ 시뮬레이션 설정
            </h2>

            {/* 회당 매수금액 */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    회당 매수금액 (KRW)
                </label>
                <input
                    type="number"
                    value={state.amountPerBuy}
                    onChange={(e) => updateState({ amountPerBuy: parseInt(e.target.value) || 0 })}
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px'
                    }}
                    min="1000"
                    step="10000"
                />
            </div>

            {/* 매수 주기 */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    매수 주기
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                        <label key={freq} style={{
                            flex: 1,
                            cursor: 'pointer',
                            padding: '12px',
                            border: `2px solid ${state.frequency === freq ? '#667eea' : '#e0e0e0'}`,
                            borderRadius: '8px',
                            textAlign: 'center',
                            background: state.frequency === freq ? '#f0f4ff' : 'white',
                            transition: 'all 0.2s'
                        }}>
                            <input
                                type="radio"
                                name="frequency"
                                value={freq}
                                checked={state.frequency === freq}
                                onChange={() => updateState({ frequency: freq })}
                                style={{ marginRight: '8px' }}
                            />
                            {freq === 'daily' ? '매일' : freq === 'weekly' ? '매주' : '매월'}
                        </label>
                    ))}
                </div>
            </div>

            {/* 매수 조건 */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    매수 조건 (Extreme Fear 임계값: {state.buyThreshold})
                </label>
                <input
                    type="range"
                    min="0"
                    max="50"
                    value={state.buyThreshold}
                    onChange={(e) => updateState({ buyThreshold: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                />
                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                    FNG ≤ {state.buyThreshold}일 때 매수
                </div>

                {/* 연속 n일 옵션 */}
                <div style={{ marginTop: '12px' }}>
                    <label style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={state.useConsecutive}
                            onChange={(e) => updateState({ useConsecutive: e.target.checked })}
                            style={{ marginRight: '8px' }}
                        />
                        연속 {state.consecutiveDays}일 조건 적용
                    </label>
                    {state.useConsecutive && (
                        <input
                            type="number"
                            value={state.consecutiveDays}
                            onChange={(e) => updateState({ consecutiveDays: parseInt(e.target.value) || 1 })}
                            style={{
                                marginLeft: '12px',
                                padding: '4px 8px',
                                width: '60px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px'
                            }}
                            min="1"
                            max="30"
                        />
                    )}
                </div>
            </div>

            {/* 청산 조건 */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    청산 조건
                </label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <label style={{
                        flex: 1,
                        cursor: 'pointer',
                        padding: '12px',
                        border: `2px solid ${state.sellType === 'current' ? '#667eea' : '#e0e0e0'}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                        background: state.sellType === 'current' ? '#f0f4ff' : 'white'
                    }}>
                        <input
                            type="radio"
                            name="sellType"
                            value="current"
                            checked={state.sellType === 'current'}
                            onChange={() => updateState({ sellType: 'current' })}
                            style={{ marginRight: '8px' }}
                        />
                        현재가 평가
                    </label>
                    <label style={{
                        flex: 1,
                        cursor: 'pointer',
                        padding: '12px',
                        border: `2px solid ${state.sellType === 'date' ? '#667eea' : '#e0e0e0'}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                        background: state.sellType === 'date' ? '#f0f4ff' : 'white'
                    }}>
                        <input
                            type="radio"
                            name="sellType"
                            value="date"
                            checked={state.sellType === 'date'}
                            onChange={() => updateState({ sellType: 'date' })}
                            style={{ marginRight: '8px' }}
                        />
                        지정 날짜 청산
                    </label>
                </div>
                {state.sellType === 'date' && (
                    <input
                        type="date"
                        value={state.sellDate}
                        onChange={(e) => updateState({ sellDate: e.target.value })}
                        min={minDate}
                        max={maxDate}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px'
                        }}
                    />
                )}
            </div>

            {/* 수수료 */}
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    수수료율 ({(state.feeRate * 100).toFixed(2)}%)
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={state.feeRate}
                    onChange={(e) => updateState({ feeRate: parseFloat(e.target.value) })}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    );
}
