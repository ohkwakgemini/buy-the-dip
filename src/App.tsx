/**
 * 메인 App 컴포넌트 - 픽셀 아트 버전
 */

import { useState, useEffect, useCallback } from 'react';
import { loadAllData, getTodayKST, getLastKnownFng, type DataStore } from './lib/data';
import { useUpbitWebSocket } from './lib/upbitWs';
import { runSimulation, type SimParams, type SimResult } from './lib/sim';
import StatsCards from './components/StatsCards';
import Chart from './components/Chart';
import Controls, { type ControlsState } from './components/Controls';
import SimResultComp from './components/SimResult';
import AdUnit from './components/AdUnit';

function App() {
  const [dataStore, setDataStore] = useState<DataStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 날짜 선택 상태: 'start' | 'end' | null (null은 선택 모드 아님)
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);

  const [controlsState, setControlsState] = useState<ControlsState | null>(null);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // ... (데이터 로드 로직 동일)
  useEffect(() => {
    loadAllData()
      .then((data) => {
        setDataStore(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        setError('DATA LOAD FAIL');
        setLoading(false);
      });
  }, []);

  // ... (웹소켓 로직 동일)
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

  // 반응형
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 시뮬레이션 실행 (자동)
  useEffect(() => {
    // 시작일이 없으면 계산 안함
    if (!dataStore || !selectedStartDate || !controlsState) {
      setSimResult(null);
      return;
    }

    // 종료일이 없으면 "오늘"로 설정하여 시뮬레이션
    const effectiveEndDate = selectedEndDate || getTodayKST();

    if (selectedStartDate > effectiveEndDate) {
      setSimResult(null); // 시작일이 종료일보다 미래면 결과 없음
      return;
    }

    setIsCalculating(true);

    const currentPrice = wsState.lastPrice || dataStore.btcArray[dataStore.btcArray.length - 1]?.c || 0;

    const params: SimParams = {
      startDate: selectedStartDate,
      endDate: effectiveEndDate,
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

  // 차트 클릭 핸들러
  const handleChartClick = (date: string) => {
    if (selectionMode === 'start') {
      setSelectedStartDate(date);
      setSelectionMode(null); // 선택 완료 후 모드 해제
      // 시작일을 찍으면 종료일은 초기화 (다시 찍게 하거나, 현재까지로 리셋)
      // 사용성을 위해 종료일은 일단 유지하거나 리셋? 
      // 요청: "종료칸은 별도설정이 없으면 현재날짜까지 산다는거야" -> 리셋이 맞음
      setSelectedEndDate(null);
    } else if (selectionMode === 'end') {
      if (selectedStartDate && date < selectedStartDate) {
        alert("종료일은 시작일보다 뒤여야 합니다!");
        return;
      }
      setSelectedEndDate(date);
      setSelectionMode(null);
    }
  };

  if (loading) return <div style={{ padding: 50, textAlign: 'center' }}>LOADING...</div>;
  if (error || !dataStore) return <div style={{ padding: 50, textAlign: 'center', color: 'red' }}>ERROR</div>;

  const { btcArray, fngArray, fngMap, meta } = dataStore;
  const today = getTodayKST();
  const currentFng = getLastKnownFng(today, fngMap, fngArray);
  const currentBtcPrice = wsState.lastPrice || btcArray[btcArray.length - 1]?.c || 0;

  return (
    <div className="app" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

      {/* 헤더 */}
      <h1 className="pixel-title">
        BUY THE DIP<br />
        <span style={{ fontSize: '14px', color: 'var(--pixel-accent)' }}>CRYPTOCURRENCY DCA SIMULATOR</span>
      </h1>

      {/* 대시보드 */}
      <StatsCards
        fngValue={currentFng?.v || 0}
        fngStatus={currentFng?.s || '-'}
        btcPrice={currentBtcPrice}
        wsState={wsState}
      />

      <div style={{ height: '20px' }} />

      {/* 날짜 선택 컨트롤 패널 (차트 위로 이동하여 명확하게) */}
      <div className="nes-container">
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>

          {/* 시작일 선택 */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '10px' }}>START DATE</p>
            <button
              className={`nes-btn ${selectionMode === 'start' ? 'is-primary' : ''}`}
              style={{ width: '100%' }}
              onClick={() => setSelectionMode(selectionMode === 'start' ? null : 'start')}
            >
              {selectedStartDate || "CLICK TO SELECT"}
            </button>
            {selectionMode === 'start' && <p style={{ fontSize: '10px', color: 'var(--pixel-accent)', marginTop: '5px' }}>▲ CLICK ON CHART</p>}
          </div>

          {/* 종료일 선택 */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '10px' }}>END DATE</p>
            <button
              className={`nes-btn ${selectionMode === 'end' ? 'is-primary' : ''}`}
              style={{ width: '100%' }}
              onClick={() => setSelectionMode(selectionMode === 'end' ? null : 'end')}
            >
              {selectedEndDate || "TODAY (CURRENT)"}
            </button>
            {selectionMode === 'end' && <p style={{ fontSize: '10px', color: 'var(--pixel-accent)', marginTop: '5px' }}>▲ CLICK ON CHART</p>}
          </div>

        </div>
      </div>

      <div style={{ height: '20px' }} />

      {/* 차트 */}
      <div className="nes-container" style={{ padding: '10px' }}>
        <Chart
          btcData={btcArray}
          fngData={fngArray}
          selectionMode={selectionMode}
          onDateSelect={handleChartClick}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          isMobile={isMobile}
        />
      </div>

      <div style={{ height: '20px' }} />

      {/* DCA 설정 */}
      <Controls onChange={setControlsState} />

      <div style={{ height: '20px' }} />

      {/* 광고 */}
      <AdUnit slot="12345" />

      {/* 시뮬레이션 결과 */}
      <SimResultComp result={simResult} isCalculating={isCalculating} />

      <footer style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p>DATA UPDATED: {meta.u.split('T')[0]}</p>
        <p>© 2026 PROJECT BUY-THE-DIP</p>
      </footer>
    </div>
  );
}

export default App;
