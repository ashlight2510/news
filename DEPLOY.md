# 배포 가이드

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
4. **중요 설정:**
   - **Name**: `it-news-api` (원하는 이름)
   - **Environment**: `Node`
   - **Root Directory**: `backend` ⚠️ **이것이 중요!**
   - **Build Command**: `yarn install` 또는 `npm install`
   - **Start Command**: `yarn start` 또는 `npm start`

### 1.3 Root Directory 설정이 중요한 이유

프로젝트 구조가 다음과 같기 때문:
```
news/
├── backend/     ← 여기가 루트가 되어야 함
│   ├── server.js
│   ├── package.json
│   └── ...
└── frontend/
```

**Root Directory를 `backend`로 설정하지 않으면:**
- `package.json`을 찾을 수 없음
- `server.js`를 찾을 수 없음
- 빌드 실패

### 1.4 배포 확인

배포 완료 후:
- Render에서 제공하는 URL 확인 (예: `https://news-u60e.onrender.com`)
- 헬스 체크: `https://your-app-name.onrender.com/api/health`
- 응답: `{"status":"ok","timestamp":"..."}`

## 2. GitHub Pages 프론트엔드 배포

### 2.1 GitHub 저장소 설정

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source** 선택:
   - Branch: `main` (또는 `master`)
   - Folder: `/frontend` ⚠️ **frontend 폴더 선택!**
3. **Save** 클릭

### 2.2 프론트엔드 API URL 설정

`frontend/index.html` 파일에서 Render 백엔드 URL 확인:

```javascript
const BACKEND_URL = 'https://news-u60e.onrender.com';  // 실제 Render URL로 변경
```

### 2.3 커스텀 도메인 설정

커스텀 도메인 `news.ashlight.store`를 연결하려면:

1. **CNAME 파일 생성**
   - `frontend/CNAME` 파일 생성
   - 내용: `news.ashlight.store`

2. **GitHub 저장소 설정**
   - GitHub 저장소 → **Settings** → **Pages**
   - **Custom domain** 입력란에 `news.ashlight.store` 입력
   - **Enforce HTTPS** 체크 (권장)

3. **DNS 설정** (도메인 제공업체에서)
   - **A 레코드** 또는 **CNAME 레코드** 추가:
     - **A 레코드** (권장):
       ```
       Type: A
       Name: news (또는 @)
       Value: 185.199.108.153
       Value: 185.199.109.153
       Value: 185.199.110.153
       Value: 185.199.111.153
       ```
     - **CNAME 레코드** (대안):
       ```
       Type: CNAME
       Name: news
       Value: your-username.github.io
       ```

4. **DNS 전파 대기**
   - 보통 몇 분~24시간 소요
   - 확인: `dig news.ashlight.store` 또는 온라인 DNS 체커 사용

### 2.4 배포 확인

- GitHub Pages URL: `https://your-username.github.io/repo-name/`
- 커스텀 도메인: `https://news.ashlight.store` (DNS 설정 후)

### 2.4 GitHub Actions로 자동 배포 (선택사항)

`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend
```

## 3. 전체 배포 체크리스트

### 백엔드 (Render)
- [ ] GitHub에 코드 푸시
- [ ] Render에서 Web Service 생성
- [ ] Root Directory: `backend` 설정
- [ ] Build Command: `yarn install` 또는 `npm install`
- [ ] Start Command: `yarn start` 또는 `npm start`
- [ ] 배포 완료 후 URL 확인
- [ ] `/api/health` 엔드포인트 테스트

### 프론트엔드 (GitHub Pages)
- [ ] GitHub 저장소 Settings → Pages
- [ ] Source: `main` 브랜치, `/frontend` 폴더
- [ ] `frontend/index.html`의 `BACKEND_URL` 확인
- [ ] 배포 완료 후 프론트엔드 URL 확인
- [ ] 브라우저에서 뉴스 로드 확인

## 4. 문제 해결

### 백엔드 배포 실패
- **에러**: "Cannot find module"
  - **해결**: Root Directory가 `backend`로 설정되었는지 확인

- **에러**: "Build failed"
  - **해결**: Build Command가 올바른지 확인 (`yarn install` 또는 `npm install`)

### 프론트엔드 배포 실패
- **에러**: "404 Not Found"
  - **해결**: Pages 설정에서 `/frontend` 폴더가 선택되었는지 확인

- **에러**: "Failed to fetch" (프론트엔드에서)
  - **해결**: `BACKEND_URL`이 올바른 Render URL인지 확인
  - **해결**: CORS 설정 확인 (이미 설정됨)

## 5. 배포 후 확인 사항

1. **백엔드**
   ```bash
   curl https://your-app-name.onrender.com/api/health
   curl https://your-app-name.onrender.com/api/articles
   ```

2. **프론트엔드**
   - 브라우저에서 GitHub Pages URL 접속
   - 브라우저 콘솔(F12)에서 오류 확인
   - Network 탭에서 `/api/articles` 요청 확인

3. **연동 테스트**
   - 프론트엔드에서 뉴스가 정상적으로 표시되는지 확인
   - 한국어/영어 필터 작동 확인
   - 번역 기능 작동 확인

