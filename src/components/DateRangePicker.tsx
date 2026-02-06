/**
 * 모바일용 날짜 범위 선택 컴포넌트
 */

import { useState } from 'react';

interface DateRangePickerProps {
    onRangeChange: (start: string, end: string) => void;
    minDate: string;
    maxDate: string;
}

export default function DateRangePicker({
    onRangeChange,
    minDate,
    maxDate
}: DateRangePickerProps) {
    const [startDate, setStartDate] = useState(minDate);
    const [endDate, setEndDate] = useState(maxDate);

    const handlePreset = (months: number) => {
        const end = new Date(maxDate);
        const start = new Date(end);
        start.setMonth(start.getMonth() - months);

        const startStr = start.toISOString().split('T')[0];
        const endStr = maxDate;

        setStartDate(startStr);
        setEndDate(endStr);
        onRangeChange(startStr, endStr);
    };

    const handleAll = () => {
        setStartDate(minDate);
        setEndDate(maxDate);
        onRangeChange(minDate, maxDate);
    };

    const handleManualChange = () => {
        onRangeChange(startDate, endDate);
    };

    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            margin: '20px 0'
        }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>
                📅 매수 기간 선택
            </h3>

            {/* 프리셋 버튼 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '16px'
            }}>
                <button onClick={() => handlePreset(1)} style={buttonStyle}>1M</button>
                <button onClick={() => handlePreset(3)} style={buttonStyle}>3M</button>
                <button onClick={() => handlePreset(6)} style={buttonStyle}>6M</button>
                <button onClick={() => handlePreset(12)} style={buttonStyle}>1Y</button>
                <button onClick={() => handlePreset(36)} style={buttonStyle}>3Y</button>
                <button onClick={() => handlePreset(60)} style={buttonStyle}>5Y</button>
                <button onClick={handleAll} style={{ ...buttonStyle, gridColumn: 'span 2' }}>
                    전체
                </button>
            </div>

            {/* 수동 입력 */}
            <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                        시작일
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={minDate}
                        max={endDate}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                        종료일
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        max={maxDate}
                        style={inputStyle}
                    />
                </div>
                <button onClick={handleManualChange} style={{
                    ...buttonStyle,
                    background: '#667eea',
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    적용
                </button>
            </div>
        </div>
    );
}

const buttonStyle: React.CSSProperties = {
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px'
};
