/**
 * ECharts 오버레이 차트 (FNG + BTC)
 */

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { BtcData, FngData } from '../lib/data';

interface ChartProps {
    btcData: BtcData[];
    fngData: FngData[];
    onRangeSelect?: (start: string, end: string) => void;
    isMobile: boolean;
    buyThreshold: number;
}

export default function Chart({
    btcData,
    fngData,
    onRangeSelect,
    isMobile,
    buyThreshold
}: ChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        // 차트 초기화
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        const chart = chartInstance.current;

        // FNG 데이터 맵 생성
        const fngMap = new Map(fngData.map(f => [f.d, f.v]));

        // 차트 옵션
        const option: echarts.EChartsOption = {
            title: {
                text: '비트코인 가격 & 공포·탐욕 지수',
                left: 'center',
                textStyle: { fontSize: 18, fontWeight: 'bold' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' },
                formatter: (params: any) => {
                    const date = params[0].axisValue;
                    let result = `<b>${date}</b><br/>`;
                    params.forEach((p: any) => {
                        if (p.seriesName === 'BTC 가격') {
                            result += `${p.marker} ${p.seriesName}: ₩${Math.floor(p.value).toLocaleString()}<br/>`;
                        } else {
                            result += `${p.marker} ${p.seriesName}: ${p.value}<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['FNG', 'BTC 가격'],
                top: 30
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: btcData.map(b => b.d),
                boundaryGap: false
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'FNG',
                    min: 0,
                    max: 100,
                    position: 'left',
                    axisLine: { lineStyle: { color: '#667eea' } }
                },
                {
                    type: 'value',
                    name: 'BTC (KRW)',
                    position: 'right',
                    axisLabel: {
                        formatter: (value: number) => '₩' + (value / 1000000).toFixed(0) + 'M'
                    },
                    axisLine: { lineStyle: { color: '#f5576c' } }
                }
            ],
            series: [
                {
                    name: 'FNG',
                    type: 'line',
                    yAxisIndex: 0,
                    data: btcData.map(b => fngMap.get(b.d) || null),
                    smooth: true,
                    lineStyle: { color: '#667eea', width: 2 },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
                        ])
                    }
                },
                {
                    name: 'BTC 가격',
                    type: 'line',
                    yAxisIndex: 1,
                    data: btcData.map(b => b.c),
                    smooth: true,
                    lineStyle: { color: '#f5576c', width: 2 }
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    start: 70,
                    end: 100
                },
                {
                    type: 'slider',
                    start: 70,
                    end: 100
                }
            ]
        };

        // 데스크톱: Brush 활성화
        if (!isMobile) {
            option.brush = {
                toolbox: ['rect', 'clear'],
                xAxisIndex: 0
            };
            option.toolbox = {
                feature: {
                    brush: { type: ['rect', 'clear'] },
                    saveAsImage: {}
                }
            };
        }

        // Extreme Fear/Greed 구간 음영
        const markAreas: any[] = [];
        let fearStart: string | null = null;
        let greedStart: string | null = null;

        btcData.forEach((b, i) => {
            const fng = fngMap.get(b.d);
            if (!fng) return;

            // Extreme Fear
            if (fng <= buyThreshold) {
                if (!fearStart) fearStart = b.d;
            } else {
                if (fearStart) {
                    markAreas.push([
                        { xAxis: fearStart, itemStyle: { color: 'rgba(244, 67, 54, 0.1)' } },
                        { xAxis: btcData[i - 1].d }
                    ]);
                    fearStart = null;
                }
            }

            // Extreme Greed
            if (fng >= 75) {
                if (!greedStart) greedStart = b.d;
            } else {
                if (greedStart) {
                    markAreas.push([
                        { xAxis: greedStart, itemStyle: { color: 'rgba(76, 175, 80, 0.1)' } },
                        { xAxis: btcData[i - 1].d }
                    ]);
                    greedStart = null;
                }
            }
        });

        if (option.series && Array.isArray(option.series) && option.series[0]) {
            (option.series[0] as any).markArea = { data: markAreas };
        }

        chart.setOption(option);

        // Brush 이벤트 (데스크톱)
        if (!isMobile && onRangeSelect) {
            chart.on('brushEnd', (params: any) => {
                const brushComponent = params.areas[0];
                if (brushComponent) {
                    const range = brushComponent.coordRange;
                    const startIdx = Math.floor(range[0]);
                    const endIdx = Math.ceil(range[1]);
                    const startDate = btcData[startIdx]?.d;
                    const endDate = btcData[endIdx]?.d;
                    if (startDate && endDate) {
                        onRangeSelect(startDate, endDate);
                    }
                }
            });
        }

        // 리사이즈 핸들러
        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.off('brushEnd');
        };
    }, [btcData, fngData, isMobile, buyThreshold, onRangeSelect]);

    return (
        <div
            ref={chartRef}
            style={{
                width: '100%',
                height: isMobile ? '400px' : '600px',
                margin: '20px 0'
            }}
        />
    );
}
