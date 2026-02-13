/**
 * 메인 App 컴포넌트 - 픽셀 아트 버전 (폰트 및 레이아웃 수정)
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

  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);
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
    if (!dataStore || !selectedStartDate || !controlsState) {
      setSimResult(null);
      return;
    }

    const effectiveEndDate = selectedEndDate || getTodayKST();

    if (selectedStartDate > effectiveEndDate) {
      // 시작일이 더 미래인 경우 메시지만 띄우고 결과 계산 안함
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

  const handleChartClick = (date: string) => {
    if (selectionMode === 'start') {
      setSelectedStartDate(date);
      setSelectionMode(null);
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

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="nes-container is-rounded">로딩중...</div>
    </div>
  );

  if (error || !dataStore) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="nes-container is-rounded is-dark" style={{ color: 'red' }}>에러 발생</div>
    </div>
  );

  const { btcArray, fngArray, fngMap, meta } = dataStore;
  const today = getTodayKST();
  const currentFng = getLastKnownFng(today, fngMap, fngArray);
  const currentBtcPrice = wsState.lastPrice || btcArray[btcArray.length - 1]?.c || 0;

  return (
    <div className="app" style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '10px' : '20px', minHeight: '100vh', fontFamily: "'DungGeunMo', monospace" }}>

      <h1 className="pixel-title" style={{ fontSize: isMobile ? '24px' : '32px', marginBottom: isMobile ? '20px' : '40px' }}>
        공포에 사라<br />
        <span style={{ fontSize: isMobile ? '12px' : '14px', color: 'var(--pixel-accent)', marginTop: '8px', display: 'block' }}>
          비트코인 적립식 매수(DCA) 시뮬레이터
        </span>
      </h1>

      <StatsCards
        fngValue={currentFng?.v || 0}
        fngStatus={currentFng?.s || '-'}
        fngDate={currentFng?.d || today}
        btcPrice={currentBtcPrice}
        wsState={wsState}
        isMobile={isMobile}
      />

      <div style={{ height: isMobile ? '12px' : '24px' }} />

      <div className="nes-container" style={{ padding: '4px', background: '#000' }}>
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

      <div style={{ height: isMobile ? '10px' : '20px' }} />

      {/* 날짜 선택 컨트롤 패널 */}
      <div className="nes-container" style={{ background: 'var(--pixel-card)', padding: isMobile ? '10px' : '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '24px' }}>

          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: isMobile ? '6px' : '12px', fontSize: isMobile ? '16px' : '20px', color: '#00ff00' }}>① 매수 시작일</p>
            <button
              className={`nes-btn ${selectionMode === 'start' ? 'is-primary' : ''}`}
              style={{ width: '100%', fontSize: isMobile ? '18px' : '24px' }}
              onClick={() => setSelectionMode(selectionMode === 'start' ? null : 'start')}
            >
              {selectedStartDate || "선택하기 (클릭)"}
            </button>
            {selectionMode === 'start' && <p style={{ fontSize: '14px', color: 'var(--pixel-accent)', marginTop: '8px' }}>▲ 차트 위 날짜를 클릭하세요</p>}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: isMobile ? '6px' : '12px', fontSize: isMobile ? '16px' : '20px', color: '#ff0000' }}>② 매수 종료일</p>
            <button
              className={`nes-btn ${selectionMode === 'end' ? 'is-primary' : ''}`}
              style={{ width: '100%', fontSize: isMobile ? '18px' : '24px' }}
              onClick={() => setSelectionMode(selectionMode === 'end' ? null : 'end')}
            >
              {selectedEndDate || "오늘까지 (기본)"}
            </button>
            {selectionMode === 'end' && <p style={{ fontSize: '14px', color: 'var(--pixel-accent)', marginTop: '8px' }}>▲ 차트 위 날짜를 클릭하세요</p>}
          </div>

        </div>
      </div>

      <div style={{ height: isMobile ? '12px' : '24px' }} />

      {/* 2026-02-06 UI 수정: Controls 폰트 확대 (isMobile 전달) */}
      <Controls onChange={setControlsState} isMobile={isMobile} />

      <div style={{ height: isMobile ? '12px' : '24px' }} />

      {/* 광고 배치 로직 변경 */}
      {isMobile ? (
        /* 모바일: 하단 광고 */
        <div style={{ marginBottom: '20px' }}>
          <AdUnit slot="MOBILE_BOTTOM_12345" />
        </div>
      ) : (
        /* PC: 좌우 사이드 광고 (화면 너비가 충분할 때만 표시됨) */
        <>
          {/* 왼쪽 배너 */}
          <div style={{
            position: 'fixed', left: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '160px', height: '600px', zIndex: 10
          }}>
            <div style={{ color: '#666', fontSize: '10px', marginBottom: '5px', textAlign: 'center' }}>광고</div>
            <AdUnit slot="PC_LEFT_12345" />
          </div>

          {/* 오른쪽 배너 */}
          <div style={{
            position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '160px', height: '600px', zIndex: 10
          }}>
            <div style={{ color: '#666', fontSize: '10px', marginBottom: '5px', textAlign: 'center' }}>광고</div>
            <AdUnit slot="PC_RIGHT_12345" />
          </div>
        </>
      )}

      <SimResultComp result={simResult} isCalculating={isCalculating} isMobile={isMobile} />

      <footer style={{ marginTop: '60px', textAlign: 'center', fontSize: isMobile ? '12px' : '14px', color: '#888', borderTop: '4px solid #333', paddingTop: '24px', paddingBottom: '40px' }}>

        {/* 데이터 출처 */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#aaa', fontWeight: 'bold', marginBottom: '8px' }}>📊 데이터 출처</p>
          <p>비트코인(BTC) 가격: <a href="https://upbit.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pixel-accent, #00ff00)' }}>업비트(Upbit)</a> KRW 마켓 기준</p>
          <p style={{ marginTop: '4px' }}>공포·탐욕 지수(Fear & Greed Index): <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pixel-accent, #00ff00)' }}>alternative.me</a></p>
        </div>

        {/* 업데이트 정보 */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#aaa', fontWeight: 'bold', marginBottom: '8px' }}>🔄 데이터 갱신</p>
          <p>과거 데이터는 매일 자동 업데이트됩니다 (UTC 00:00 / KST 09:00)</p>
          <p style={{ marginTop: '4px' }}>실시간 가격은 업비트 WebSocket을 통해 갱신됩니다</p>
          <p style={{ marginTop: '4px', fontSize: isMobile ? '11px' : '12px', color: '#666' }}>마지막 데이터 업데이트: {meta.u.split('T')[0]}</p>
        </div>

        {/* 면책 조항 */}
        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ 면책 조항</p>
          <p>본 사이트는 과거 데이터 기반의 시뮬레이션 도구이며, 투자 조언이나 권유가 아닙니다.</p>
          <p style={{ marginTop: '4px' }}>시뮬레이션 결과는 실제 투자 수익을 보장하지 않습니다.</p>
          <p style={{ marginTop: '4px' }}>모든 투자의 책임은 투자자 본인에게 있습니다.</p>
        </div>

        {/* 사이트 정보 */}
        <div>
          <p style={{ marginTop: '12px' }}>© 2026 공포에 사라 (Buy the Dip)</p>
          <p style={{ marginTop: '4px', fontSize: isMobile ? '10px' : '11px', color: '#555' }}>
            buythefear.vercel.app
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
