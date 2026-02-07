import { useState } from 'react';

export interface ControlsState {
    amountPerBuy: number;
    frequency: 'daily' | 'weekly' | 'monthly';
}

interface ControlsProps {
    onChange: (state: ControlsState) => void;
    isMobile: boolean;
}

export default function Controls({ onChange, isMobile }: ControlsProps) {
    const [state, setState] = useState<ControlsState>({
        amountPerBuy: 100000,
        frequency: 'weekly',
    });
    const [rawAmount, setRawAmount] = useState("100,000");

    const update = (newState: ControlsState) => {
        setState(newState);
        onChange(newState);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
            setRawAmount(num.toLocaleString());
            update({ ...state, amountPerBuy: num });
        } else {
            setRawAmount("");
            update({ ...state, amountPerBuy: 0 });
        }
    };

    const getAmountUnit = (val: number) => {
        if (val >= 100000000) return `(${(val / 100000000).toFixed(1)}억원)`;
        if (val >= 10000) return `(${(val / 10000).toLocaleString()}만원)`;
        return "";
    };

    // 폰트 사이즈 정의 (모바일 vs 웹)
    const headerSize = isMobile ? '18px' : '24px';
    const labelSize = isMobile ? '14px' : '18px';
    const inputSize = isMobile ? '16px' : '24px'; // 입력창 확 키움
    const unitSize = isMobile ? '12px' : '16px';
    const btnSize = isMobile ? '14px' : '18px';

    return (
        <div className="nes-container" style={{ padding: isMobile ? '15px' : undefined }}>
            <p className="pixel-title" style={{ fontSize: headerSize, marginBottom: isMobile ? '12px' : '24px' }}>⚙️ 시뮬레이션 설정</p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '40px' }}>

                {/* 금액 입력 */}
                <div>
                    <label style={{ fontSize: labelSize, display: 'block', marginBottom: isMobile ? '6px' : '12px', color: '#FFF' }}>회당 매수 금액 (원)</label>
                    <input
                        type="text"
                        className="nes-input"
                        value={rawAmount}
                        onChange={handleAmountChange}
                        style={{ textAlign: 'right', fontSize: inputSize, height: isMobile ? 'auto' : '48px' }}
                    />
                    <div style={{ fontSize: unitSize, color: '#AAA', marginTop: '8px', textAlign: 'right' }}>
                        {getAmountUnit(state.amountPerBuy)}
                    </div>
                </div>

                {/* 주기 선택 */}
                <div>
                    <label style={{ fontSize: labelSize, display: 'block', marginBottom: '12px', color: '#FFF' }}>매수 주기</label>
                    <div style={{ display: 'flex', gap: '12px', height: isMobile ? 'auto' : '48px' }}>
                        {[
                            { id: 'daily', label: '매일' },
                            { id: 'weekly', label: '매주' },
                            { id: 'monthly', label: '매월' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                className={`nes-btn ${state.frequency === opt.id ? 'is-primary' : ''}`}
                                onClick={() => update({ ...state, frequency: opt.id as any })}
                                style={{
                                    padding: '0 4px',
                                    fontSize: btnSize,
                                    flex: 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
