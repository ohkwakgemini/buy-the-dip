import type { SimResult } from '../lib/sim';

interface SimResultProps {
    result: SimResult | null;
    isCalculating: boolean;
}

export default function SimResultComp({ result, isCalculating }: SimResultProps) {
    if (isCalculating) return <div className="nes-container" style={{ textAlign: 'center' }}>CALCULATING...</div>;
    if (!result) return <div className="nes-container" style={{ textAlign: 'center', color: '#888' }}>PLEASE SELECT DATE RANGE</div>;

    const profitColor = result.profit >= 0 ? '#00ff00' : '#ff0000';

    return (
        <div className="nes-container">
            <p className="pixel-title" style={{ fontSize: '14px' }}>SIMULATION RESULT</p>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <p style={{ fontSize: '10px', color: '#888' }}>TOTAL PROFIT</p>
                <h2 style={{ fontSize: '24px', color: profitColor, margin: '10px 0' }}>
                    {result.profit > 0 ? '+' : ''}{Math.floor(result.profit).toLocaleString()} KRW
                </h2>
                <p style={{ fontSize: '16px', color: profitColor }}>
                    {result.profitRate.toFixed(2)}%
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '12px' }}>
                <div>
                    <span style={{ color: '#888' }}>INVESTED:</span><br />
                    {result.totalInvested.toLocaleString()} KRW
                </div>
                <div>
                    <span style={{ color: '#888' }}>BTC:</span><br />
                    {result.totalBtc.toFixed(6)} BTC
                </div>
                <div>
                    <span style={{ color: '#888' }}>AVG PRICE:</span><br />
                    {Math.floor(result.avgPrice).toLocaleString()} KRW
                </div>
                <div>
                    <span style={{ color: '#888' }}>VALUE:</span><br />
                    {Math.floor(result.currentValue).toLocaleString()} KRW
                </div>
            </div>
        </div>
    );
}
