import { useState } from 'react';

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

    return (
        <div className="nes-container">
            <p className="pixel-title" style={{ fontSize: '14px', marginBottom: '20px' }}>DCA SETTINGS</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* 금액 입력 */}
                <div>
                    <label style={{ fontSize: '10px', display: 'block', marginBottom: '10px' }}>AMOUNT (KRW)</label>
                    <input
                        type="text"
                        className="nes-input"
                        value={rawAmount}
                        onChange={handleAmountChange}
                    />
                </div>

                {/* 주기 선택 */}
                <div>
                    <label style={{ fontSize: '10px', display: 'block', marginBottom: '10px' }}>FREQUENCY</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {['daily', 'weekly', 'monthly'].map(f => (
                            <button
                                key={f}
                                className={`nes-btn ${state.frequency === f ? 'is-primary' : ''}`}
                                onClick={() => update({ ...state, frequency: f as any })}
                                style={{ padding: '5px 10px', fontSize: '10px', flex: 1 }}
                            >
                                {f.substring(0, 3).toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
