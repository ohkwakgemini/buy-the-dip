/**
 * 메인 App 컴포넌트 - 간소화 버전
 */

import { useState, useEffect, useCallback } from 'react';
import { loadAllData, getTodayKST, getLastKnownFng, type DataStore } from './lib/data';
import { useUpbitWebSocket } from './lib/upbitWs';
import { runSimulation, type SimParams, type SimResult } from './lib/sim';
import ThemeToggle from './components/ThemeToggle';
import StatsCards from './components/StatsCards';
import Chart from './components/Chart';
import Controls, { type ControlsState } from './components/Controls';
import SimResultComp from './components/SimResult';
import AdUnit from './components/AdUnit';
import './App.css';

function App() {
  const [dataStore, setDataStore] = useState<DataStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [controlsState, setControlsState] = useState<ControlsState | null>(null);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    loadAllData()
      .then((data) => {
        setDataStore(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        setError('데이터 로드 실패');
        setLoading(false);
      });
  }, []);

  const handlePriceUpdate = useCallback((price: number) => {
    if (!dataStore) return;

    const today = getTodayKST();
    const { btcArray, btcMap } = dataStore;
    const todayIndex = btcArray.findIndex(b => b.d === today);

    if (todayIndex >= 0) {
      btcArray[todayIndex].c = price;
      btcMap.set(today, price);
    } else {
      btcArray.push({ d: today, c: price });
      btcMap.set(today, price);
    }

    setDataStore({ ...dataStore });
  }, [dataStore]);

  const wsState = useUpbitWebSocket(handlePriceUpdate);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!dataStore || !selectedStartDate || !selectedEndDate || !controlsState) {
      setSimResult(null);
      return;
    }

    if (selectedStartDate > selectedEndDate) {
      setSimResult(null);
      return;
    }

    setIsCalculating(true);

    const currentPrice = wsState.lastPrice || dataStore.btcArray[dataStore.btcArray.length - 1]?.c || 0;

    const params: SimParams = {
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      amountPerBuy: controlsState.amountPerBuy,
      frequency: controlsState.frequency,
    };

    const result = runSimulation(
      params,
      dataStore.btcMap,
      currentPrice
    );

    setSimResult(result);
    setIsCalculating(false);
  }, [dataStore, selectedStartDate, selectedEndDate, controlsState, wsState.lastPrice]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'var(--text-primary)',
        background: 'var(--bg-primary)'
      }}>
        ⏳ 데이터 로딩 중...
      </div>
    );
  }

  if (error || !dataStore) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'var(--color-fear)',
        background: 'var(--bg-primary)'
      }}>
        {error || '데이터를 불러올 수 없습니다'}
      </div>
    );
  }

  const { btcArray, fngArray, fngMap, meta } = dataStore;
  const today = getTodayKST();
  const currentFng = getLastKnownFng(today, fngMap, fngArray);
  const isFngHoldLast = !fngMap.has(today);
  const currentBtcPrice = wsState.lastPrice || btcArray[btcArray.length - 1]?.c || 0;

  return (
    <div className="app">
      <ThemeToggle />

      {/* 헤더 */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '36px 20px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ fontSize: '36px', margin: 0, fontWeight: 'bold' }}>공포에 사라</h1>
        <p style={{ fontSize: '18px', margin: '8px 0 0 0', opacity: 0.95 }}>
          Buy the Dip - DCA 시뮬레이션
        </p>
      </header>

      {/* 메인 컨텐츠 */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '16px',
        width: '100%'
      }}>
        {/* 광고 1 */}
        <AdUnit slot="1234567890" />

        {/* 대시보드 */}
        <StatsCards
          fngValue={currentFng?.v || 50}
          fngStatus={currentFng?.s || 'Neutral'}
          btcPrice={currentBtcPrice}
          wsState={wsState}
          isFngHoldLast={isFngHoldLast}
        />

        {/* 차트 */}
        <Chart
          btcData={btcArray}
          fngData={fngArray}
          onStartDateClick={setSelectedStartDate}
          onEndDateClick={setSelectedEndDate}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          isMobile={isMobile}
        />

        {/* 설정 및 선택 날짜 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '16px',
          margin: '16px 0'
        }}>
          {/* DCA 설정 */}
          <Controls onChange={setControlsState} />

          {/* 선택된 날짜 */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h3 style={{
              fontSize: '16px',
              marginBottom: '16px',
              color: 'var(--text-primary)',
              fontWeight: '600'
            }}>
              📅 선택된 기간
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>시작:</span>
                <span style={{
                  color: selectedStartDate ? '#10b981' : 'var(--text-secondary)',
                  fontWeight: selectedStartDate ? '600' : 'normal',
                  fontSize: '15px'
                }}>
                  {selectedStartDate || '차트에서 선택'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>종료:</span>
                <span style={{
                  color: selectedEndDate ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: selectedEndDate ? '600' : 'normal',
                  fontSize: '15px'
                }}>
                  {selectedEndDate || '차트에서 선택'}
                </span>
              </div>
              {selectedStartDate && selectedEndDate && (
                <button
                  onClick={() => {
                    setSelectedStartDate(null);
                    setSelectedEndDate(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-fear)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginTop: '8px'
                  }}
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 광고 2 */}
        <AdUnit slot="0987654321" />

        {/* 시뮬레이션 결과 */}
        <SimResultComp result={simResult} isCalculating={isCalculating} />

        {/* 광고 3 */}
        <AdUnit slot="1122334455" />
      </div>

      {/* 푸터 */}
      <footer style={{
        marginTop: '48px',
        padding: '24px 20px',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: '13px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 16px auto',
          padding: '12px',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
            📊 데이터 상태
          </div>
          <div>업데이트: {new Date(meta.u).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</div>
          {wsState.connected && <div style={{ marginTop: '4px' }}>⚡ BTC 실시간 보정 중</div>}
        </div>
        <p>⚠️ 과거 데이터 기반 시뮬레이션 도구입니다. 투자 권유가 아닙니다.</p>
        <p style={{ marginTop: '8px', fontSize: '12px' }}>© 2026 Buy the Dip</p>
      </footer>
    </div>
  );
}

export default App;
