/**
 * DCA 시뮬레이션 계산 로직
 */

import { BtcData, FngData, getLastKnownFng } from './data';

export interface SimParams {
    startDate: string;
    endDate: string;
    amountPerBuy: number; // KRW
    frequency: 'daily' | 'weekly' | 'monthly';
    buyThreshold: number; // Extreme Fear 임계값 (기본 25)
    consecutiveDays?: number; // 연속 n일 조건 (옵션)
    sellType: 'date' | 'current';
    sellDate?: string; // sellType='date'일 때
    feeRate: number; // 수수료율 (기본 0)
}

export interface SimResult {
    totalInvested: number; // 총 투자금 (KRW)
    totalBtc: number; // 누적 BTC
    avgPrice: number; // 평균단가 (KRW)
    currentValue: number; // 현재평가 (KRW)
    profit: number; // 손익금액 (KRW)
    profitRate: number; // 수익률 (%)
    buyCount: number; // 매수 횟수
    skipCount: number; // 스킵 횟수 (조건 불충족 또는 데이터 누락)
    holdLastDates: string[]; // Hold-last FNG 사용 날짜
    buyStoppedAt?: string; // Extreme Greed 도달로 매수 중단된 날짜
}

export function runSimulation(
    params: SimParams,
    btcMap: Map<string, number>,
    fngMap: Map<string, { v: number; s: string }>,
    fngArray: FngData[],
    currentPrice: number // WS 현재가 또는 정적 마지막 종가
): SimResult {
    const {
        startDate,
        endDate,
        amountPerBuy,
        frequency,
        buyThreshold,
        consecutiveDays = 0,
        sellType,
        sellDate,
        feeRate,
    } = params;

    let totalInvested = 0;
    let totalBtc = 0;
    let buyCount = 0;
    let skipCount = 0;
    const holdLastDates: string[] = [];
    let buyStoppedAt: string | undefined;
    let buyStopped = false; // Extreme Greed 도달 플래그

    // 날짜 범위 생성
    const dates = generateDateRange(startDate, endDate, frequency);

    for (const date of dates) {
        // Extreme Greed 도달 시 매수 중단
        if (buyStopped) {
            skipCount++;
            continue;
        }

        // BTC 가격 확인
        const btcPrice = btcMap.get(date);
        if (!btcPrice) {
            skipCount++;
            continue;
        }

        // FNG 확인 (hold-last 적용)
        const fng = getLastKnownFng(date, fngMap, fngArray);
        if (!fng) {
            skipCount++; // FNG 데이터가 아직 시작되지 않음
            continue;
        }

        // Hold-last 사용 여부 체크
        if (!fngMap.has(date)) {
            holdLastDates.push(date);
        }

        // Extreme Greed 체크 (≥75)
        if (fng.v >= 75) {
            buyStopped = true;
            buyStoppedAt = date;
            skipCount++;
            continue;
        }

        // 매수 조건 체크 (Extreme Fear)
        if (fng.v <= buyThreshold) {
            // 연속 n일 조건 체크 (옵션)
            if (consecutiveDays > 0) {
                const isConsecutive = checkConsecutiveDays(
                    date,
                    consecutiveDays,
                    buyThreshold,
                    fngMap,
                    fngArray
                );
                if (!isConsecutive) {
                    skipCount++;
                    continue;
                }
            }

            // 매수 실행
            const fee = amountPerBuy * feeRate;
            const netAmount = amountPerBuy - fee;
            const btcAmount = netAmount / btcPrice;

            totalInvested += amountPerBuy;
            totalBtc += btcAmount;
            buyCount++;
        } else {
            skipCount++;
        }
    }

    // 청산 또는 현재가 평가
    let sellPrice = currentPrice;
    if (sellType === 'date' && sellDate) {
        sellPrice = btcMap.get(sellDate) || currentPrice;
    }

    const avgPrice = buyCount > 0 ? totalInvested / totalBtc : 0;
    const currentValue = totalBtc * sellPrice;
    const profit = currentValue - totalInvested;
    const profitRate = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    return {
        totalInvested,
        totalBtc,
        avgPrice,
        currentValue,
        profit,
        profitRate,
        buyCount,
        skipCount,
        holdLastDates,
        buyStoppedAt,
    };
}

/**
 * 날짜 범위 생성 (주기별)
 */
function generateDateRange(
    start: string,
    end: string,
    frequency: 'daily' | 'weekly' | 'monthly'
): string[] {
    const dates: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (frequency === 'daily') {
        // 매일
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }
    } else if (frequency === 'weekly') {
        // 매주 (start로부터 7일 간격)
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
            dates.push(d.toISOString().split('T')[0]);
        }
    } else if (frequency === 'monthly') {
        // 매월 (start의 일자 기준)
        const dayOfMonth = startDate.getDate();
        for (let d = new Date(startDate); d <= endDate;) {
            dates.push(d.toISOString().split('T')[0]);

            // 다음 달로 이동
            d.setMonth(d.getMonth() + 1);

            // 해당 일자가 없는 달은 말일로
            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(dayOfMonth, lastDay));
        }
    }

    return dates;
}

/**
 * 연속 n일 조건 체크
 */
function checkConsecutiveDays(
    date: string,
    consecutiveDays: number,
    threshold: number,
    fngMap: Map<string, { v: number; s: string }>,
    fngArray: FngData[]
): boolean {
    const dateObj = new Date(date);
    let count = 0;

    for (let i = 0; i < consecutiveDays; i++) {
        const checkDate = new Date(dateObj);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];

        const fng = getLastKnownFng(checkDateStr, fngMap, fngArray);
        if (fng && fng.v <= threshold) {
            count++;
        } else {
            break;
        }
    }

    return count >= consecutiveDays;
}
