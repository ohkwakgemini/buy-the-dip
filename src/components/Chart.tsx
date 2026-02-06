/**
 * 차트 컴포넌트 - 픽셀 스타일 & UX 개선
 */

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { BtcData, FngData } from '../lib/data';

interface ChartProps {
    btcData: BtcData[];
    fngData: FngData[];
    selectionMode: 'start' | 'end' | null;
    onDateSelect: (date: string) => void;
    selectedStartDate: string | null;
    selectedEndDate: string | null;
    isMobile: boolean;
}

export default function Chart({
    btcData,
    fngData,
    selectionMode,
    onDateSelect,
    selectedStartDate,
    selectedEndDate,
    isMobile
}: ChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }
        const chart = chartInstance.current;

        const fngMap = new Map(fngData.map(f => [f.d, f.v]));
        const sortedBtcData = [...btcData].sort((a, b) => a.d.localeCompare(b.d));

        // 픽셀 폰트 설정
        const fontFamily = "'Press Start 2P', cursive";
        const textColor = '#ffffff';

        const option: echarts.EChartsOption = {
            backgroundColor: 'transparent',
            grid: {
                left: 60,
                right: 60,
                top: 40,
                bottom: 40,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', label: { fontFamily } },
                backgroundColor: '#000000',
                borderColor: '#ffffff',
                borderWidth: 2,
                textStyle: { fontFamily, color: '#ffffff', fontSize: 10 },
                formatter: (params: any) => {
                    const date = params[0].axisValue;
                    let html = `${date}<br/>`;
                    params.forEach((p: any) => {
                        const val = p.currency === 'KRW'
                            ? Math.floor(p.value).toLocaleString() + ' KRW'
                            : p.value;
                        html += `${p.marker} ${p.seriesName}: ${val}<br/>`;
                    });
                    return html;
                }
            },
            xAxis: {
                type: 'category',
                data: sortedBtcData.map(b => b.d),
                axisLabel: { fontFamily, color: textColor, fontSize: 10 },
                axisLine: { lineStyle: { color: textColor, width: 2 } }
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'FNG',
                    min: 0,
                    max: 100,
                    position: 'left',
                    axisLabel: { fontFamily, color: textColor },
                    axisLine: { lineStyle: { color: '#00ff00', width: 2 } },
                    splitLine: { show: false }
                },
                {
                    type: 'value',
                    name: 'BTC',
                    position: 'right',
                    axisLabel: {
                        fontFamily,
                        color: textColor,
                        formatter: (val: number) => {
                            if (val >= 100000000) return (val / 100000000).toFixed(1) + '억';
                            return (val / 10000).toFixed(0) + '만';
                        }
                    },
                    axisLine: { lineStyle: { color: '#ff00ff', width: 2 } },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: 'FNG',
                    type: 'line',
                    yAxisIndex: 0,
                    data: sortedBtcData.map(b => {
                        const v = fngMap.get(b.d);
                        return v !== undefined ? v : null;
                    }),
                    itemStyle: { color: '#00ff00' }, // Pixel Green
                    lineStyle: { width: 2, type: 'solid' },
                    symbol: 'none',
                    // Extreme Fear/Greed 표시 복구
                    markArea: {
                        itemStyle: { opacity: 0.3 },
                        data: [
                            [
                                { yAxis: 0 }, { yAxis: 25, itemStyle: { color: '#ff0000' } } // Extreme Fear (Red)
                            ],
                            [
                                { yAxis: 75 }, { yAxis: 100, itemStyle: { color: '#00ff00' } } // Extreme Greed (Green)
                            ]
                        ]
                    }
                },
                {
                    name: 'BTC',
                    type: 'line',
                    yAxisIndex: 1,
                    data: sortedBtcData.map(b => b.c),
                    itemStyle: { color: '#ff00ff' }, // Magenta
                    lineStyle: { width: 2 },
                    symbol: 'none'
                }
            ],
            dataZoom: [
                { type: 'inside' },
                {
                    type: 'slider',
                    height: 20,
                    bottom: 0,
                    borderColor: '#ffffff',
                    fillerColor: 'rgba(255, 255, 255, 0.2)',
                    textStyle: { fontFamily, color: '#ffffff', fontSize: 10 }
                }
            ]
        };

        // 선택된 날짜 마커 (세로선)
        const markLines = [];
        if (selectedStartDate) {
            markLines.push({
                xAxis: selectedStartDate,
                label: {
                    formatter: 'START', position: 'start',
                    backgroundColor: '#00ff00', color: 'black', padding: 4, borderRadius: 0
                },
                lineStyle: { color: '#00ff00', width: 3, type: 'solid' }
            });
        }
        if (selectedEndDate) {
            markLines.push({
                xAxis: selectedEndDate,
                label: {
                    formatter: 'END', position: 'end',
                    backgroundColor: '#ff0000', color: 'white', padding: 4, borderRadius: 0
                },
                lineStyle: { color: '#ff0000', width: 3, type: 'solid' }
            });
        }

        if (option.series && Array.isArray(option.series)) {
            // BTC 시리즈에 마크라인 추가
            (option.series[1] as any).markLine = {
                data: markLines,
                symbol: 'none',
                silent: true
            };
        }

        chart.setOption(option);

        // 클릭 이벤트
        chart.off('click');
        chart.on('click', (params: any) => {
            if (selectionMode) {
                onDateSelect(params.name); // 날짜 전달
            }
        });

        // 커서 스타일 변경
        chart.getZr().setCursorStyle(selectionMode ? 'crosshair' : 'default');

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
        }
    }, [btcData, fngData, selectionMode, selectedStartDate, selectedEndDate, isMobile]); // 의존성 배열

    return (
        <div style={{ position: 'relative' }}>
            {selectionMode && (
                <div style={{
                    position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: 'var(--pixel-accent)', color: 'black', padding: '5px 10px',
                    zIndex: 10, fontFamily: "'Press Start 2P', cursive", fontSize: '10px',
                    border: '2px solid white'
                }}>
                    {selectionMode === 'start' ? 'SELECT START DATE' : 'SELECT END DATE'}
                </div>
            )}
            <div
                ref={chartRef}
                style={{ width: '100%', height: '400px', cursor: selectionMode ? 'crosshair' : 'default' }}
            />
        </div>
    );
}
