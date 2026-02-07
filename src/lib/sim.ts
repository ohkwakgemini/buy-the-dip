export interface SimParams {
    startDate: string;
    endDate: string;
    amountPerBuy: number;
    frequency: 'daily' | 'weekly' | 'monthly';
}

export interface SimResult {
    totalInvested: number;
    totalBtc: number;
    avgPrice: number;

    // 종료일 기준 매도
    finalValueAtEnd: number; // 종료일 당시 가치
    profit: number; // 종료일 기준 수익금
    profitRate: number; // 종료일 기준 수익률

    // 현재가 기준 평가
    currentValue: number; // 현재 가치
    profitByCurrent: number; // 현재 기준 수익금
    profitRateByCurrent: number; // 현재 기준 수익률

    skipCount: number;
}

export function runSimulation(
    params: SimParams,
    btcMap: Map<string, number>,
    currentPrice: number
): SimResult {
    const { startDate, endDate, amountPerBuy, frequency } = params;

    let totalInvested = 0;
    let totalBtc = 0;
    let skipCount = 0;

    // 날짜 순회
    // 타임존 보정 (KST)
    // 간단히 문자열 비교로 진행 (yyyy-mm-dd)

    // 날짜 생성기
    let currentDateStr = startDate;

    while (currentDateStr <= endDate) {
        if (currentDateStr > endDate) break;

        const price = btcMap.get(currentDateStr);

        if (price) {
            // 매수 실행 (무조건 매수)
            const btcBought = amountPerBuy / price;
            totalBtc += btcBought;
            totalInvested += amountPerBuy;
        } else {
            skipCount++;
        }

        // 다음 날짜 계산
        const d = new Date(currentDateStr);
        if (frequency === 'daily') {
            d.setDate(d.getDate() + 1);
        } else if (frequency === 'weekly') {
            d.setDate(d.getDate() + 7);
        } else if (frequency === 'monthly') {
            d.setMonth(d.getMonth() + 1);
        }
        currentDateStr = d.toISOString().split('T')[0];
    }

    const avgPrice = totalInvested > 0 ? totalInvested / totalBtc : 0;

    // 1. 종료일 기준 가치 (종료일의 종가로 평가)
    // 종료일의 가격이 없으면 가장 마지막으로 확인된 가격 사용? 
    // 여기서는 endDate가 오늘일 수도 있고 과거일 수도 있음.
    // endDate의 가격을 찾고, 없으면 그 전날들을 뒤져야 함.
    let endPrice = btcMap.get(endDate) || 0;
    if (endPrice === 0) {
        // endDate 가격 없으면 역주행해서 찾기 (최대 7일)
        let tempDate = new Date(endDate);
        for (let i = 0; i < 7; i++) {
            const tempStr = tempDate.toISOString().split('T')[0];
            const p = btcMap.get(tempStr);
            if (p) { endPrice = p; break; }
            tempDate.setDate(tempDate.getDate() - 1);
        }
    }
    // 그래도 없으면 currentPrice 사용
    if (endPrice === 0) endPrice = currentPrice;

    const finalValueAtEnd = totalBtc * endPrice;
    const profit = finalValueAtEnd - totalInvested;
    const profitRate = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    // 2. 현재가 기준 평가
    const currentValue = totalBtc * currentPrice;
    const profitByCurrent = currentValue - totalInvested;
    const profitRateByCurrent = totalInvested > 0 ? (profitByCurrent / totalInvested) * 100 : 0;

    return {
        totalInvested,
        totalBtc,
        avgPrice,
        finalValueAtEnd,
        profit,
        profitRate,
        currentValue,
        profitByCurrent,
        profitRateByCurrent,
        skipCount
    };
}
