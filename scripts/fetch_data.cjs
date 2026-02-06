#!/usr/bin/env node

/**
 * 데이터 수집 스크립트
 * 모드: bootstrap (최초 5년+ 데이터) | daily (최근 3-7일 델타)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const BTC_FILE = path.join(DATA_DIR, 'b.json');
const FNG_FILE = path.join(DATA_DIR, 'f.json');
const META_FILE = path.join(DATA_DIR, 'm.json');

// KST = UTC+9
const KST_OFFSET = 9 * 60 * 60 * 1000;

function toKST(utcDateStr) {
  const utcDate = new Date(utcDateStr);
  const kstDate = new Date(utcDate.getTime() + KST_OFFSET);
  return kstDate.toISOString().split('T')[0]; // YYYY-MM-DD
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUpbitCandles(to = null, count = 200, retries = 3) {
  const baseUrl = 'https://api.upbit.com/v1/candles/days';
  const url = to 
    ? `${baseUrl}?market=KRW-BTC&count=${count}&to=${to}`
    : `${baseUrl}?market=KRW-BTC&count=${count}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const data = await httpsGet(url);
      return data.map(candle => ({
        d: toKST(candle.candle_date_time_utc),
        c: Math.floor(candle.trade_price)
      }));
    } catch (err) {
      if (err.message.includes('429') && i < retries - 1) {
        const backoff = Math.pow(2, i) * 1000;
        console.log(`Rate limited, retrying in ${backoff}ms...`);
        await delay(backoff);
      } else {
        throw err;
      }
    }
  }
}

async function fetchFNG(limit = 0) {
  const url = `https://api.alternative.me/fng/?limit=${limit}&date_format=kr`;
  const data = await httpsGet(url);
  return data.data.map(item => ({
    d: item.timestamp.split(' ')[0], // YYYY-MM-DD
    v: parseInt(item.value),
    s: item.value_classification
  }));
}

async function bootstrapBTC() {
  console.log('Bootstrap mode: Fetching 5+ years of BTC data...');
  const allData = [];
  let to = null;
  const targetDays = 365 * 5 + 365; // 6년치 (여유)
  
  while (allData.length < targetDays) {
    console.log(`Fetched ${allData.length} candles...`);
    const candles = await fetchUpbitCandles(to, 200);
    if (candles.length === 0) break;
    
    allData.push(...candles);
    
    // 다음 페이지를 위한 to 파라미터 (가장 오래된 날짜)
    const oldest = candles[candles.length - 1];
    to = `${oldest.d}T00:00:00`;
    
    await delay(200); // Rate limit 방지
  }
  
  console.log(`Total BTC candles: ${allData.length}`);
  return allData;
}

async function bootstrapFNG() {
  console.log('Bootstrap mode: Fetching FNG data...');
  const data = await fetchFNG(0); // limit=0 = all
  console.log(`Total FNG entries: ${data.length}`);
  return data;
}

async function dailyUpdateBTC(existingData) {
  console.log('Daily mode: Fetching recent BTC data...');
  const recent = await fetchUpbitCandles(null, 7); // 최근 7일
  
  // 병합 및 중복 제거
  const map = new Map();
  existingData.forEach(item => map.set(item.d, item));
  recent.forEach(item => map.set(item.d, item));
  
  const merged = Array.from(map.values()).sort((a, b) => a.d.localeCompare(b.d));
  console.log(`Updated BTC data: ${merged.length} entries`);
  return merged;
}

async function dailyUpdateFNG(existingData) {
  console.log('Daily mode: Fetching recent FNG data...');
  const recent = await fetchFNG(7); // 최근 7일
  
  // 병합 및 중복 제거
  const map = new Map();
  existingData.forEach(item => map.set(item.d, item));
  recent.forEach(item => map.set(item.d, item));
  
  const merged = Array.from(map.values()).sort((a, b) => a.d.localeCompare(b.d));
  console.log(`Updated FNG data: ${merged.length} entries`);
  return merged;
}

function saveMeta(btcData, fngData) {
  const meta = {
    u: new Date().toISOString(),
    start: btcData[0]?.d || '',
    end: btcData[btcData.length - 1]?.d || '',
    rows_b: btcData.length,
    rows_f: fngData.length,
    ver: '1.0.0'
  };
  fs.writeFileSync(META_FILE, JSON.stringify(meta));
  console.log('Meta saved:', meta);
}

async function main() {
  const mode = process.argv[2] || 'daily';
  
  // 데이터 디렉토리 생성
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  let btcData, fngData;
  
  if (mode === 'bootstrap') {
    btcData = await bootstrapBTC();
    fngData = await bootstrapFNG();
  } else {
    // Daily 모드
    const existingBTC = fs.existsSync(BTC_FILE) 
      ? JSON.parse(fs.readFileSync(BTC_FILE, 'utf8'))
      : [];
    const existingFNG = fs.existsSync(FNG_FILE)
      ? JSON.parse(fs.readFileSync(FNG_FILE, 'utf8'))
      : [];
    
    btcData = await dailyUpdateBTC(existingBTC);
    fngData = await dailyUpdateFNG(existingFNG);
  }
  
  // Minify 저장
  fs.writeFileSync(BTC_FILE, JSON.stringify(btcData));
  fs.writeFileSync(FNG_FILE, JSON.stringify(fngData));
  saveMeta(btcData, fngData);
  
  console.log('✅ Data update complete!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
