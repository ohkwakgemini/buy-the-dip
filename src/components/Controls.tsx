/**
 * 매수 조건 입력 컴포넌트 - 초간소화 버전 (DCA 전용)
 */

import { useState, useEffect } from 'react';

export interface ControlsState {
    amountPerBuy: number;
    frequency: 'daily' | 'weekly' | 'monthly';
}

interface ControlsProps {
    onChange: (state: ControlsState) => void;
}

export default function Controls({ onChange }: ControlsProps) {
    const [state, setState] = useState<ControlsState>({
        amountPerBuy: 100000,
        frequency: 'weekly',
    });

    const [amountInput, setAmountInput] = useState('100,000');

    const updateState = (updates: Partial<ControlsState>) => {
        const newState = { ...state, ...updates };
        setState(newState);
        onChange(newState);
    };

    const formatAmount = (value: number): string => {
        return value.toLocaleString('ko-KR');
    };

    const getAmountUnit = (value: number): string => {
        if (value >= 100000000) {
            return `${(value / 100000000).toFixed(1)}억원`;
        } else if (value >= 10000000) {
            return `${(value / 10000000).toFixed(0)}천만원`;
        } else if (value >= 1000000) {
            return `${(value / 1000000).toFixed(0)}백만원`;
        } else if (value >= 10000) {
            return `${(value / 10000).toFixed(0)}만원`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}천원`;
        }
        return '';
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        const numValue = parseInt(value) || 0;
        setAmountInput(formatAmount(numValue));
        updateState({ amountPerBuy: numValue });
    };

    useEffect(() => {
        setAmountInput(formatAmount(state.amountPerBuy));
    }, []);

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--border-color)'
        }}>
            <h3 style={{
                fontSize: '16px',
                marginBottom: '16px',
                color: 'var(--text-primary)',
                fontWeight: '600'
            }}>
                ⚙️ DCA 설정
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* 회당 매수금액 */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--text-primary)'
                    }}>
                        회당 매수금액
                    </label>
                    <input
                        type="text"
                        value={amountInput}
                        onChange={handleAmountChange}
                        placeholder="100,000"
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '15px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                        }}
                    />
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginTop: '4px'
                    }}>
                        {getAmountUnit(state.amountPerBuy)}
                    </div>
                </div>

                {/* 매수 주기 */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--text-primary)'
                    }}>
                        매수 주기
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                            <label key={freq} style={{
                                flex: 1,
                                cursor: 'pointer',
                                padding: '10px 8px',
                                border: `1px solid ${state.frequency === freq ? '#667eea' : 'var(--border-color)'}`,
                                borderRadius: '6px',
                                textAlign: 'center',
                                background: state.frequency === freq ? 'rgba(102, 126, 234, 0.1)' : 'var(--bg-secondary)',
                                color: state.frequency === freq ? '#667eea' : 'var(--text-primary)',
                                fontSize: '13px',
                                fontWeight: state.frequency === freq ? '600' : 'normal',
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="radio"
                                    name="frequency"
                                    value={freq}
                                    checked={state.frequency === freq}
                                    onChange={() => updateState({ frequency: freq })}
                                    style={{ display: 'none' }}
                                />
                                {freq === 'daily' ? '매일' : freq === 'weekly' ? '매주' : '매월'}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
