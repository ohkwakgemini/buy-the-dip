/**
 * DCA 시뮬레이션 계산 로직 - 간소화 버전
 */



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
    currentValue: number;
    profit: number;
    profitRate: number;
    buyCount: number;
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
    let buyCount = 0;
    let skipCount = 0;

    // 날짜 범위 생성
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    if (frequency === 'daily') {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }
    } else if (frequency === 'weekly') {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
            dates.push(d.toISOString().split('T')[0]);
        }
    } else if (frequency === 'monthly') {
        const startDayOfMonth = start.getDate();
        for (let d = new Date(start); d <= end;) {
            dates.push(d.toISOString().split('T')[0]);
            d.setMonth(d.getMonth() + 1);

            // 해당 월에 시작일이 없으면 말일로
            const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            if (startDayOfMonth > lastDayOfMonth) {
                d.setDate(lastDayOfMonth);
            } else {
                d.setDate(startDayOfMonth);
            }
        }
    }

    // DCA 매수 (조건 없이 무조건 매수)
    dates.forEach((date) => {
        const price = btcMap.get(date);

        if (!price) {
            skipCount++;
            return;
        }

        // 무조건 매수
        const btcAmount = amountPerBuy / price;
        totalBtc += btcAmount;
        totalInvested += amountPerBuy;
        buyCount++;
    });

    // 결과 계산
    const avgPrice = buyCount > 0 ? totalInvested / totalBtc : 0;
    const currentValue = totalBtc * currentPrice;
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
    };
}
