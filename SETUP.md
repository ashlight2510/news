# Render 배포 및 연결 가이드

## 1. Render 백엔드 배포

### 1.1 GitHub에 코드 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 1.2 Render에서 서비스 생성
1. [Render 대시보드](https://dashboard.render.com) 접속
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. 설정 입력:
   - **Name**: `it-news-api` (원하는 이름)
   - **Environment**: `Node`
   - **Build Command**: `npm install` 또는 `yarn install`
   - **Start Command**: `npm start` 또는 `yarn start`
   - **Root Directory**: `backend` (백엔드 폴더가 루트인 경우)

### 1.3 배포 확인
배포가 완료되면 Render에서 제공하는 URL을 확인하세요.
예: `https://it-news-api.onrender.com`

**헬스 체크:**
브라우저에서 다음 URL 접속:
```
https://your-app-name.onrender.com/api/health
```

응답이 `{"status":"ok","timestamp":"..."}` 형태면 정상입니다.

## 2. 프론트엔드 연결 설정

### 2.1 API URL 설정
`frontend/index.html` 파일을 열어서 다음 부분을 찾으세요:

```javascript
// 🔧 Render 백엔드 URL 설정
const BACKEND_URL = 'https://your-app-name.onrender.com';  // ← 수정 필요
```

실제 Render URL로 변경:
```javascript
const BACKEND_URL = 'https://it-news-api.onrender.com';  // 실제 URL로 변경
```

### 2.2 로컬 테스트
```bash
cd frontend
yarn install
yarn start
```

브라우저 콘솔(F12)에서 다음을 확인:
- "API URL: ..." 로그가 올바른 URL을 표시하는지
- 네트워크 탭에서 `/api/articles` 요청이 성공하는지

## 3. 문제 해결

### 문제: "Failed to fetch" 오류

**원인 1: API URL이 잘못됨**
- 해결: `frontend/index.html`의 `BACKEND_URL` 확인
- Render 대시보드에서 실제 URL 확인

**원인 2: CORS 오류**
- 해결: 백엔드 `server.js`에서 CORS 설정 확인
- 현재는 모든 origin 허용으로 설정되어 있음

**원인 3: 백엔드 서버가 실행되지 않음**
- 해결: Render 대시보드에서 로그 확인
- 배포 상태가 "Live"인지 확인

**원인 4: 백엔드가 슬립 모드**
- Render 무료 플랜은 15분 비활성 시 슬립 모드로 전환
- 첫 요청 시 깨어나는데 시간이 걸릴 수 있음 (최대 50초)
- 해결: Render Pro 플랜 사용 또는 첫 요청 후 대기

### 디버깅 방법

1. **브라우저 콘솔 확인 (F12)**
   - Network 탭에서 `/api/articles` 요청 확인
   - 오류 메시지 확인

2. **Render 로그 확인**
   - Render 대시보드 → Logs 탭
   - 서버 시작 로그 확인
   - 뉴스 수집 로그 확인

3. **직접 API 테스트**
   ```bash
   curl https://your-app-name.onrender.com/api/health
   curl https://your-app-name.onrender.com/api/articles
   ```

## 4. GitHub Pages 배포 (선택사항)

프론트엔드를 GitHub Pages로 배포하려면:

1. GitHub 저장소 Settings → Pages
2. Source를 `main` 브랜치의 `/frontend` 폴더로 설정
3. 배포 후 `frontend/index.html`의 `BACKEND_URL`이 프로덕션 URL인지 확인

**참고**: GitHub Pages는 HTTPS이므로 Render 백엔드도 HTTPS여야 합니다 (Render는 기본 HTTPS 제공).

