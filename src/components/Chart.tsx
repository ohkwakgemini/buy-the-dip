/**
 * 차트 컴포넌트 - 디자인 개선 및 라벨 위치 수정
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
        const dates = sortedBtcData.map(b => b.d);

        const fontFamily = "'DungGeunMo', monospace";
        const textColor = '#CFCFCF'; // --text-secondary

        const markLines = [];
        if (selectedStartDate) {
            markLines.push({
                xAxis: selectedStartDate,
                label: {
                    formatter: '시작',
                    position: 'end' as const, // 상단 표시
                    backgroundColor: '#FFFF33', // 노란색 배경
                    color: 'black', padding: [4, 6], borderRadius: 0,
                    fontFamily, distance: [0, -20] // 위치 미세 조정
                },
                lineStyle: { color: '#FFFF33', width: 2, type: 'solid' as const } // 노란색 선
            });
        }
        if (selectedEndDate) {
            markLines.push({
                xAxis: selectedEndDate,
                label: {
                    formatter: '종료',
                    position: 'end' as const, // 상단 표시
                    backgroundColor: '#FF3333', // 빨간색 배경
                    color: 'white', padding: [4, 6], borderRadius: 0,
                    fontFamily, distance: [0, -20]
                },
                lineStyle: { color: '#FF3333', width: 2, type: 'solid' as const } // 빨간색 선
            });
        }

        const option: echarts.EChartsOption = {
            backgroundColor: 'transparent',
            animation: false,
            grid: {
                left: isMobile ? 10 : 60, // 모바일 좌측 여백 축소
                right: isMobile ? 10 : 60, // 모바일 우측 여백 축소 (화면 가득 채우기)
                top: 50,
                bottom: 40,
                containLabel: !isMobile // 모바일에서는 라벨 포함 여부를 꺼서 최대한 넓게 쓰거나 false로 조정
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', label: { fontFamily } },
                backgroundColor: 'rgba(20, 20, 20, 0.95)', // --bg-card
                borderColor: '#333',
                borderWidth: 1,
                textStyle: { fontFamily, color: '#FFFFFF', fontSize: 14 },
                formatter: (params: any) => {
                    const date = params[0].axisValue;
                    let html = `<div style="font-family:'DungGeunMo'; border-bottom:1px solid #333; margin-bottom:8px; padding-bottom:4px; color:#CFCFCF;">${date}</div>`;
                    params.forEach((p: any) => {
                        const val = p.componentType === 'series' && p.seriesName === '비트코인'
                            ? Math.floor(p.value).toLocaleString() + '원'
                            : p.value;
                        let color = p.color;
                        if (p.seriesName === '공포탐욕') color = '#33FF33';
                        if (p.seriesName === '비트코인') color = '#FF3399';

                        html += `<div style="font-family:'DungGeunMo'; margin-bottom:4px;">
                <span style="display:inline-block;margin-right:6px;width:8px;height:8px;background-color:${color};"></span>
                <span style="color:#CFCFCF;">${p.seriesName}:</span> <span style="color:#FFF; font-weight:bold;">${val}</span>
             </div>`;
                    });
                    return html;
                }
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: { fontFamily, color: textColor, fontSize: 12, margin: 12 },
                axisLine: { lineStyle: { color: '#333' } }, // 축 색상 은은하게
                axisTick: { show: false }
            },
            yAxis: [
                {
                    type: 'value',
                    min: 0,
                    max: 100,
                    position: 'left',
                    axisLabel: { fontFamily, color: '#33FF33' }, // 공포탐욕 축 색상
                    splitLine: { show: true, lineStyle: { color: '#222' } }, // 격자 아주 흐리게
                    axisLine: { show: false }
                },
                {
                    type: 'value',
                    position: 'right',
                    axisLabel: {
                        fontFamily,
                        color: '#FF3399', // 비트코인 축 색상
                        formatter: (val: number) => {
                            if (val >= 100000000) return (val / 100000000).toFixed(1) + '억';
                            if (val >= 10000000) return (val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 1) + '천만'; // 6000만 -> 6천만
                            return (val / 10000).toFixed(0) + '만';
                        }
                    },
                    splitLine: { show: false },
                    axisLine: { show: false }
                }
            ],
            series: [
                {
                    name: '공포탐욕',
                    type: 'line',
                    yAxisIndex: 0,
                    data: dates.map(d => {
                        const v = fngMap.get(d);
                        return v !== undefined ? v : null;
                    }),
                    itemStyle: { color: '#33FF33' },
                    lineStyle: { width: 2 },
                    symbol: 'none',
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(51, 255, 51, 0.1)' },
                            { offset: 1, color: 'rgba(51, 255, 51, 0.0)' }
                        ])
                    },
                    markArea: {
                        itemStyle: { opacity: 0.1 },
                        data: [
                            [{ yAxis: 0 }, { yAxis: 25, itemStyle: { color: '#FF3333' } }], // 극단적 공포 (Red)
                            [{ yAxis: 75 }, { yAxis: 100, itemStyle: { color: '#33FF33' } }] // 극단적 탐욕 (Green)
                        ]
                    },
                },
                {
                    name: '비트코인',
                    type: 'line',
                    yAxisIndex: 1,
                    data: dates.map(d => {
                        const item = btcData.find(b => b.d === d);
                        return item ? item.c : null;
                    }),
                    itemStyle: { color: '#FF3399' },
                    lineStyle: { width: 2 },
                    symbol: 'none',
                    markLine: {
                        data: markLines,
                        symbol: 'none',
                        silent: true,
                        label: {
                            formatter: '{b}',
                            fontFamily
                        },
                        lineStyle: {
                            type: 'solid' as const,
                            width: 2
                        },
                        animation: false
                    }
                }
            ],
            dataZoom: [
                { type: 'inside' },
                {
                    type: 'slider',
                    height: 20,
                    bottom: 0,
                    borderColor: 'transparent',
                    backgroundColor: '#111',
                    fillerColor: 'rgba(255, 255, 255, 0.1)',
                    textStyle: { fontFamily, color: '#888', fontSize: 10 },
                    handleStyle: { color: '#555' },
                    moveHandleStyle: { color: '#555' },
                    selectedDataBackground: {
                        lineStyle: { color: '#555' },
                        areaStyle: { color: '#333' }
                    }
                }
            ]
        };

        chart.setOption(option, { notMerge: true });

        // 좌표 변환 클릭 로직 유지
        const zr = chart.getZr();
        zr.off('click');
        zr.on('click', (params: any) => {
            if (!selectionMode) return;
            const pointInPixel = [params.offsetX, params.offsetY];
            if (chart.containPixel('grid', pointInPixel)) {
                const xIndex = chart.convertFromPixel({ seriesIndex: 0 }, pointInPixel)[0];
                if (xIndex >= 0 && xIndex < dates.length) {
                    onDateSelect(dates[xIndex]);
                }
            }
        });

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);
        if (chartRef.current) {
            chartRef.current.style.cursor = selectionMode ? 'crosshair' : 'default';
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
            chartInstance.current = null;
        }
    }, [btcData, fngData, selectionMode, selectedStartDate, selectedEndDate, isMobile]);

    return (
        <div style={{ position: 'relative' }}>
            {selectionMode && (
                <div style={{
                    position: 'absolute', top: 15, left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: selectionMode === 'start' ? '#FFFF33' : '#FF3333',
                    color: selectionMode === 'start' ? 'black' : 'white',
                    padding: '8px 16px',
                    zIndex: 20, fontFamily: "'DungGeunMo', monospace", fontSize: '14px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    animation: 'blink 1.5s infinite ease-in-out',
                    pointerEvents: 'none'
                }}>
                    {selectionMode === 'start' ? '▼ 시작일을 선택하세요' : '▼ 종료일을 선택하세요'}
                </div>
            )}
            <div
                ref={chartRef}
                style={{ width: '100%', height: isMobile ? '250px' : '500px' }} // 모바일 250px, PC 500px
            />
            <style>{`
        @keyframes blink {
          0% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.8; transform: translateX(-50%) scale(0.98); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
        </div>
    );
}
