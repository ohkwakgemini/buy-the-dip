# 공포에 사라 (Buy the Dip)

비트코인 공포·탐욕지수(Fear & Greed Index) 기반 DCA 매수 시뮬레이션 도구

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)

## 📊 프로젝트 개요

"공포에 사라"는 과거 데이터를 기반으로 **Extreme Fear 구간에서 DCA(Dollar Cost Averaging) 매수**했을 때의 수익률을 시뮬레이션하는 웹 애플리케이션입니다.

- **타깃**: 한국 사용자 전용 (KRW 기준)
- **스택**: Vite + React + TypeScript
- **배포**: Vercel (GitHub 연동, push 시 자동 배포)
- **데이터**: Upbit API (BTC 가격) + alternative.me (Fear & Greed Index)

## ✨ 주요 기능

- 📈 **5년+ 과거 데이터** - 비트코인 가격 및 공포·탐욕지수
- ⚡ **실시간 BTC 가격** - Upbit WebSocket 연동
- 🎯 **DCA 시뮬레이션** - Extreme Fear 구간 매수 전략 분석
- 📱 **반응형 디자인** - 데스크톱/모바일 최적화
- 🔄 **자동 데이터 갱신** - GitHub Actions로 매일 업데이트

## 🚀 시작하기

### 필수 요구사항

- Node.js 20+
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/buy-the-dip.git
cd buy-the-dip

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버가 http://localhost:5173에서 실행됩니다.

### 초기 데이터 수집

```bash
# Bootstrap 모드 (최초 1회, 5년+ 데이터 수집)
node scripts/fetch_data.cjs bootstrap

# Daily 모드 (최근 3-7일 델타 업데이트)
node scripts/fetch_data.cjs daily
```

## 📦 빌드 및 배포

### 로컬 빌드

```bash
npm run build
npm run preview
```

### Vercel 배포

1. GitHub 저장소 생성 및 푸시
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/buy-the-dip.git
   git branch -M main
   git push -u origin main
   ```

2. [Vercel](https://vercel.com)에 로그인
3. "New Project" → GitHub 저장소 선택
4. 환경변수 설정:
   - `VITE_ADSENSE_CLIENT`: Google AdSense publisher ID (예: `ca-pub-XXXXXXX`)
5. Deploy 클릭

이후 main 브랜치에 push하면 자동으로 배포됩니다.

## 🔧 환경변수

`.env` 파일을 생성하여 다음 변수를 설정하세요:

```env
VITE_ADSENSE_CLIENT=ca-pub-0000000000000000
```

## 📁 프로젝트 구조

```
buy-the-dip/
├── public/
│   └── data/              # 정적 JSON 데이터
│       ├── b.json         # BTC 일봉 (KRW)
│       ├── f.json         # Fear & Greed Index
│       └── m.json         # 메타데이터
├── scripts/
│   └── fetch_data.cjs     # 데이터 수집 스크립트
├── src/
│   ├── lib/               # 핵심 라이브러리
│   │   ├── data.ts        # 데이터 로딩 및 Map 생성
│   │   ├── upbitWs.ts     # WebSocket 연결
│   │   └── sim.ts         # 시뮬레이션 계산
│   ├── components/        # UI 컴포넌트
│   │   ├── AdUnit.tsx
│   │   ├── Chart.tsx
│   │   ├── Controls.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── SimResult.tsx
│   │   └── StatsCards.tsx
│   ├── App.tsx            # 메인 앱
│   └── main.tsx           # 엔트리포인트
├── .github/
│   └── workflows/
│       └── update-data.yml  # 자동 데이터 갱신
└── package.json
```

## 🤖 자동화

GitHub Actions가 매일 0시(UTC)에 실행되어 최신 데이터를 수집하고 커밋합니다.

- Upbit API: 최근 7일 BTC 가격
- alternative.me: 최근 7일 Fear & Greed Index
- 커밋 메시지에 `[skip ci]` 포함하여 무한 루프 방지

## ⚠️ 면책 조항

이 사이트는 **과거 데이터 기반 시뮬레이션 도구**입니다.

- 실제 투자 결과를 보장하지 않습니다
- 투자 권유가 아닙니다
- 모든 투자 결정은 본인의 책임입니다

## 📄 라이선스

MIT License

## 🙏 크레딧

- 데이터 출처: [Upbit API](https://docs.upbit.com), [alternative.me](https://alternative.me)
- 차트 라이브러리: [ECharts](https://echarts.apache.org)

---

© 2026 Buy the Dip. All rights reserved.
