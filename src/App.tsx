/**
 * 메인 App 컴포넌트
 */

import { useState, useEffect, useCallback } from 'react';
import { loadAllData, getTodayKST, getLastKnownFng, type DataStore } from './lib/data';
import { useUpbitWebSocket } from './lib/upbitWs';
import { runSimulation, type SimParams, type SimResult } from './lib/sim';
import StatsCards from './components/StatsCards';
import Chart from './components/Chart';
import DateRangePicker from './components/DateRangePicker';
import Controls, { type ControlsState } from './components/Controls';
import SimResultComp from './components/SimResult';
import AdUnit from './components/AdUnit';
import './App.css';

function App() {
  const [dataStore, setDataStore] = useState<DataStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 시뮬레이션 상태
  const [simRange, setSimRange] = useState<{ start: string; end: string } | null>(null);
  const [controlsState, setControlsState] = useState<ControlsState | null>(null);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 데이터 로드
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

  // WebSocket 현재가 업데이트
  const handlePriceUpdate = useCallback((price: number) => {
    if (!dataStore) return;

    const today = getTodayKST();
    const { btcArray, btcMap } = dataStore;

    // 오늘 날짜가 이미 배열에 있는지 확인
    const todayIndex = btcArray.findIndex(b => b.d === today);

    if (todayIndex >= 0) {
      // Replace: 기존 값 덮어쓰기
      btcArray[todayIndex].c = price;
      btcMap.set(today, price);
    } else {
      // Append: 새로운 날짜 추가
      btcArray.push({ d: today, c: price });
      btcMap.set(today, price);
    }

    // 상태 업데이트 (리렌더링 트리거)
    setDataStore({ ...dataStore });
  }, [dataStore]);

  const wsState = useUpbitWebSocket(handlePriceUpdate);

  // 반응형 체크
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 시뮬레이션 실행
  useEffect(() => {
    if (!dataStore || !simRange || !controlsState) return;

    setIsCalculating(true);

    // 현재가 (WS 우선, 없으면 정적 마지막 종가)
    const currentPrice = wsState.lastPrice || dataStore.btcArray[dataStore.btcArray.length - 1]?.c || 0;

    const params: SimParams = {
      startDate: simRange.start,
      endDate: simRange.end,
      amountPerBuy: controlsState.amountPerBuy,
      frequency: controlsState.frequency,
      buyThreshold: controlsState.buyThreshold,
      consecutiveDays: controlsState.useConsecutive ? controlsState.consecutiveDays : 0,
      sellType: controlsState.sellType,
      sellDate: controlsState.sellDate,
      feeRate: controlsState.feeRate,
    };

    const result = runSimulation(
      params,
      dataStore.btcMap,
      dataStore.fngMap,
      dataStore.fngArray,
      currentPrice
    );

    setSimResult(result);
    setIsCalculating(false);
  }, [dataStore, simRange, controlsState, wsState.lastPrice]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px'
      }}>
        데이터 로딩 중...
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
        fontSize: '20px',
        color: 'red'
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
      {/* 헤더 */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '36px', margin: 0 }}>공포에 사라</h1>
        <p style={{ fontSize: '18px', margin: '8px 0 0 0', opacity: 0.9 }}>
          Buy the Dip
        </p>
        <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.7 }}>
          과거 데이터 기반 DCA 시뮬레이션 도구
        </p>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* 광고 1 - 상단 */}
        <AdUnit slot="1234567890" />

        {/* 대시보드 */}
        <StatsCards
          fngValue={currentFng?.v || 50}
          fngStatus={currentFng?.s || 'Neutral'}
          btcPrice={currentBtcPrice}
          wsState={wsState}
          metaUpdate={meta.u}
          isFngHoldLast={isFngHoldLast}
        />

        {/* 차트 또는 날짜 선택 */}
        {isMobile ? (
          <DateRangePicker
            onRangeChange={(start, end) => setSimRange({ start, end })}
            minDate={meta.start}
            maxDate={meta.end}
          />
        ) : (
          <Chart
            btcData={btcArray}
            fngData={fngArray}
            onRangeSelect={(start, end) => setSimRange({ start, end })}
            isMobile={false}
            buyThreshold={controlsState?.buyThreshold || 25}
          />
        )}

        {/* 컨트롤 */}
        <Controls
          onChange={setControlsState}
          minDate={meta.start}
          maxDate={meta.end}
        />

        {/* 광고 2 - 중간 */}
        <AdUnit slot="0987654321" />

        {/* 시뮬레이션 결과 */}
        <SimResultComp
          result={simResult}
          isCalculating={isCalculating}
        />

        {/* 광고 3 - 하단 */}
        <AdUnit slot="1122334455" />

        {/* 푸터 */}
        <footer style={{
          marginTop: '40px',
          padding: '20px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#666',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p>
            데이터 출처: Upbit API, alternative.me (Fear & Greed Index)
          </p>
          <p style={{ marginTop: '8px' }}>
            ⚠️ 이 사이트는 과거 데이터 기반 시뮬레이션 도구입니다.
            실제 투자 결과를 보장하지 않으며, 투자 권유가 아닙니다.
          </p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            © 2026 Buy the Dip. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
