/**
 * 데이터 로딩 및 Map 생성
 */

export interface BtcData {
    d: string; // YYYY-MM-DD (KST)
    c: number; // 종가 (KRW)
}

export interface FngData {
    d: string; // YYYY-MM-DD
    v: number; // 점수 (0-100)
    s: string; // 단계 (Fear, Greed 등)
}

export interface MetaData {
    u: string; // 마지막 업데이트 (ISO UTC)
    start: string;
    end: string;
    rows_b: number;
    rows_f: number;
    ver: string;
}

export interface DataStore {
    btcArray: BtcData[];
    btcMap: Map<string, number>;
    fngArray: FngData[];
    fngMap: Map<string, { v: number; s: string }>;
    meta: MetaData;
}

export async function loadAllData(): Promise<DataStore> {
    const [btcArray, fngArray, meta] = await Promise.all([
        fetch('/data/b.json').then(r => r.json()) as Promise<BtcData[]>,
        fetch('/data/f.json').then(r => r.json()) as Promise<FngData[]>,
        fetch('/data/m.json').then(r => r.json()) as Promise<MetaData>,
    ]);

    // 날짜 기준 정렬 (필요 시)
    btcArray.sort((a, b) => a.d.localeCompare(b.d));
    fngArray.sort((a, b) => a.d.localeCompare(b.d));

    // Map 생성 (O(1) 조회용)
    const btcMap = new Map<string, number>();
    btcArray.forEach(item => btcMap.set(item.d, item.c));

    const fngMap = new Map<string, { v: number; s: string }>();
    fngArray.forEach(item => fngMap.set(item.d, { v: item.v, s: item.s }));

    return { btcArray, btcMap, fngArray, fngMap, meta };
}

/**
 * KST 기준 오늘 날짜 (YYYY-MM-DD)
 */
export function getTodayKST(): string {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
}

/**
 * Date 객체를 KST YYYY-MM-DD HH:mm:ss 형식으로 변환
 */
export function formatKST(date: Date): string {
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const iso = kst.toISOString();
    return iso.replace('T', ' ').substring(0, 19);
}

/**
 * Hold-last FNG: 해당 날짜의 FNG가 없으면 마지막 알려진 값 반환
 * 날짜 정보(d)를 포함하여 반환
 */
export function getLastKnownFng(
    date: string,
    fngMap: Map<string, { v: number; s: string }>,
    fngArray: FngData[]
): FngData | null {
    // 해당 날짜에 FNG가 있으면 반환
    if (fngMap.has(date)) {
        const data = fngMap.get(date)!;
        return { d: date, v: data.v, s: data.s };
    }

    // 없으면 이전 날짜 중 가장 최근 값 찾기
    const sortedDates = fngArray.map(f => f.d).sort();
    for (let i = sortedDates.length - 1; i >= 0; i--) {
        if (sortedDates[i] < date) {
            const data = fngMap.get(sortedDates[i])!;
            return { d: sortedDates[i], v: data.v, s: data.s };
        }
    }

    return null; // FNG 데이터가 아직 시작되지 않음
}
