/**
 * ECharts 오버레이 차트 - 깔끔한 버전
 */

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { BtcData, FngData } from '../lib/data';

interface ChartProps {
    btcData: BtcData[];
    fngData: FngData[];
    onStartDateClick?: (date: string) => void;
    onEndDateClick?: (date: string) => void;
    selectedStartDate?: string | null;
    selectedEndDate?: string | null;
    isMobile: boolean;
}

export default function Chart({
    btcData,
    fngData,
    onStartDateClick,
    onEndDateClick,
    selectedStartDate,
    selectedEndDate,
    isMobile
}: ChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const clickModeRef = useRef<'start' | 'end'>('start');

    useEffect(() => {
        if (!chartRef.current) return;

        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        const chart = chartInstance.current;
        const fngMap = new Map(fngData.map(f => [f.d, f.v]));
        const sortedBtcData = [...btcData].sort((a, b) => a.d.localeCompare(b.d));

        const formatKRW = (value: number): string => {
            return '₩' + Math.floor(value).toLocaleString('ko-KR');
        };

        const option: echarts.EChartsOption = {
            backgroundColor: 'transparent',
            title: {
                text: '비트코인 가격 & 공포·탐욕 지수',
                left: 'center',
                top: 10,
                textStyle: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' },
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                textStyle: { color: 'var(--text-primary)' },
                formatter: (params: any) => {
                    const date = params[0].axisValue;
                    let result = `<b>${date}</b><br/>`;
                    params.forEach((p: any) => {
                        if (p.seriesName === 'BTC 가격') {
                            result += `${p.marker} ${p.seriesName}: ${formatKRW(p.value)}<br/>`;
                        } else {
                            result += `${p.marker} ${p.seriesName}: ${p.value}<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['공포·탐욕 지수', 'BTC 가격'],
                top: 40,
                textStyle: { color: 'var(--text-primary)' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '12%',
                top: '18%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: sortedBtcData.map(b => b.d),
                boundaryGap: false,
                axisLabel: {
                    color: 'var(--text-secondary)',
                    rotate: isMobile ? 45 : 0,
                    fontSize: 11
                },
                axisLine: { lineStyle: { color: 'var(--border-color)' } }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '공포·탐욕 지수',
                    min: 0,
                    max: 100,
                    position: 'left',
                    nameTextStyle: { color: 'var(--text-primary)', fontSize: 12 },
                    axisLabel: { color: 'var(--text-secondary)', fontSize: 11 },
                    axisLine: { lineStyle: { color: '#667eea' } },
                    splitLine: {
                        lineStyle: { color: 'var(--border-color)', type: 'dashed' }
                    }
                },
                {
                    type: 'value',
                    name: 'BTC (원화)',
                    position: 'right',
                    nameTextStyle: { color: 'var(--text-primary)', fontSize: 12 },
                    axisLabel: {
                        formatter: formatKRW,
                        color: 'var(--text-secondary)',
                        fontSize: 11
                    },
                    axisLine: { lineStyle: { color: '#f5576c' } },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '공포·탐욕 지수',
                    type: 'line',
                    yAxisIndex: 0,
                    data: sortedBtcData.map(b => fngMap.get(b.d) || null),
                    smooth: true,
                    lineStyle: { color: '#667eea', width: 2 },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
                        ])
                    },
                    emphasis: { focus: 'series' },
                    symbol: 'none'
                },
                {
                    name: 'BTC 가격',
                    type: 'line',
                    yAxisIndex: 1,
                    data: sortedBtcData.map(b => b.c),
                    smooth: true,
                    lineStyle: { color: '#f5576c', width: 2 },
                    emphasis: { focus: 'series' },
                    symbol: 'none'
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    type: 'slider',
                    start: 0,
                    end: 100,
                    height: 25,
                    textStyle: { color: 'var(--text-secondary)' },
                    borderColor: 'var(--border-color)',
                    fillerColor: 'rgba(102, 126, 234, 0.15)',
                    handleStyle: { color: '#667eea' }
                }
            ]
        };

        // 선택된 날짜 마커
        if (selectedStartDate || selectedEndDate) {
            const markLines: any[] = [];
            if (selectedStartDate) {
                markLines.push({
                    xAxis: selectedStartDate,
                    label: {
                        formatter: '시작',
                        color: '#fff',
                        backgroundColor: '#10b981',
                        padding: [4, 8],
                        borderRadius: 4,
                        fontSize: 12
                    },
                    lineStyle: { color: '#10b981', width: 2, type: 'solid' }
                });
            }
            if (selectedEndDate) {
                markLines.push({
                    xAxis: selectedEndDate,
                    label: {
                        formatter: '종료',
                        color: '#fff',
                        backgroundColor: '#ef4444',
                        padding: [4, 8],
                        borderRadius: 4,
                        fontSize: 12
                    },
                    lineStyle: { color: '#ef4444', width: 2, type: 'solid' }
                });
            }

            if (option.series && Array.isArray(option.series) && option.series[1]) {
                (option.series[1] as any).markLine = {
                    data: markLines,
                    symbol: 'none'
                };
            }
        }

        chart.setOption(option, true);

        // 클릭 이벤트
        chart.off('click');
        chart.on('click', (params: any) => {
            if (params.componentType === 'series' && params.name) {
                const clickedDate = params.name;

                if (clickModeRef.current === 'start') {
                    onStartDateClick?.(clickedDate);
                    clickModeRef.current = 'end';
                } else {
                    onEndDateClick?.(clickedDate);
                    clickModeRef.current = 'start';
                }
            }
        });

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.off('click');
        };
    }, [btcData, fngData, isMobile, selectedStartDate, selectedEndDate, onStartDateClick, onEndDateClick]);

    return (
        <div style={{ margin: '16px 0' }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary)'
            }}>
                💡 차트를 클릭하여 매수 시작/종료 시점을 선택하세요
            </div>
            <div
                ref={chartRef}
                style={{
                    width: '100%',
                    height: isMobile ? '400px' : '550px',
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border-color)'
                }}
            />
        </div>
    );
}
