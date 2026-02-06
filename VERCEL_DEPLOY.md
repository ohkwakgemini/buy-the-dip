# Vercel 배포 가이드

## 방법 1: Vercel CLI 사용 (가장 빠름! 추천)

터미널에서 실행:

```powershell
# 1. Vercel CLI 설치
npm install -g vercel

# 2. Vercel 로그인 (GitHub 계정 사용)
vercel login

# 3. 배포 시작
vercel

# 4. 질문에 답변:
# - Set up and deploy? → Y (엔터)
# - Which scope? → 본인 계정 선택 (엔터)
# - Link to existing project? → N (엔터)
# - What's your project's name? → buy-the-dip (엔터)
# - In which directory is your code located? → ./ (엔터)
# - Want to override the settings? → N (엔터)

# 배포 완료! URL이 표시됩니다.
```

### 환경변수 추가 (선택사항)

```powershell
# AdSense ID 설정 (나중에 실제 ID로 변경)
vercel env add VITE_ADSENSE_CLIENT

# 값 입력: ca-pub-0000000000000000
# Environment: Production (엔터)

# 환경변수 적용을 위해 재배포
vercel --prod
```

---

## 방법 2: Vercel 웹사이트 사용

1. **https://vercel.com/new** 접속
2. **"Import Git Repository"** 클릭
3. **buy-the-dip** 저장소 찾아서 **Import** 클릭
4. **Framework Preset**: Vite (자동 감지)
5. **Environment Variables** 추가:
   - Key: `VITE_ADSENSE_CLIENT`
   - Value: `ca-pub-0000000000000000`
6. **Deploy** 클릭!

---

## 배포 후 확인사항

✅ 사이트 접속 확인  
✅ 차트가 정상 표시되는지 확인  
✅ 실시간 BTC 가격 업데이트 확인  
✅ 시뮬레이션 계산 동작 확인  

---

## 다음 단계

1. **AdSense ID 교체**: 실제 광고 ID 발급받아서 환경변수 업데이트
2. **도메인 연결** (선택): Vercel 대시보드에서 커스텀 도메인 설정
3. **모니터링**: Vercel Analytics로 방문자 추적

완료! 🎉
