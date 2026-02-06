# GitHub 저장소 생성 - 빠른 가이드

GitHub CLI가 설치되었습니다! 이제 **새 PowerShell 터미널**을 열어서 아래 명령어를 실행하세요.

## 1단계: 새 터미널 열기

현재 터미널은 환경변수가 업데이트되지 않았으므로, **새 PowerShell 창**을 열어주세요.

## 2단계: GitHub 로그인

```powershell
cd c:\projects\buy_the_dip
gh auth login
```

프롬프트가 나타나면:
- "What account do you want to log into?" → **GitHub.com** 선택
- "What is your preferred protocol for Git operations?" → **HTTPS** 선택
- "Authenticate Git with your GitHub credentials?" → **Yes** 선택
- "How would you like to authenticate GitHub CLI?" → **Login with a web browser** 선택
- 브라우저가 열리면 GitHub 로그인 후 인증 완료

## 3단계: 저장소 생성 및 푸시

```powershell
gh repo create buy-the-dip --public --source=. --remote=origin --push
```

이 명령어가 자동으로:
- GitHub에 `buy-the-dip` 저장소 생성 (Public)
- 로컬 저장소에 origin 원격 추가
- main 브랜치로 푸시

## 4단계: 확인

```powershell
gh repo view --web
```

브라우저에서 저장소가 열립니다!

---

## 다음: Vercel 배포

1. https://vercel.com 로그인
2. "New Project" → `buy-the-dip` 저장소 선택
3. 환경변수 추가:
   - `VITE_ADSENSE_CLIENT` = 실제 AdSense ID
4. "Deploy" 클릭

완료! 🎉
