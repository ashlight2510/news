# 오늘의 IT 뉴스 모아보기

여러 IT 미디어의 뉴스를 한눈에 모아서, 핵심만 정리해주는 페이지

## 프로젝트 구조

```
news/
├── frontend/              # 프론트엔드 (GitHub Pages 배포 예정)
│   └── index.html        # 메인 뉴스 모음 페이지
├── backend/               # 백엔드 (Render 배포)
│   ├── server.js         # Express 서버
│   ├── scripts/
│   │   └── collect-news.js  # RSS 수집 스크립트
│   ├── package.json
│   ├── render.yaml       # Render 배포 설정
│   └── .gitignore
└── README.md
```

## 현재 상태

- ✅ HTML 기본 뼈대 완성
- ✅ 백엔드 API 구조 완성 (Express + RSS 수집)
- ✅ 크론 작업 설정 (매 시간 자동 수집)
- ✅ 프론트엔드 로컬 실행 설정 완료
- ⏳ Render 배포 필요
- ⏳ 애드센스 승인용 추가 페이지 작성 (About, 개인정보 처리방침 등)

## 프론트엔드 로컬 실행

```bash
cd frontend
yarn install
yarn start
```

브라우저에서 `http://localhost:8080`으로 접속하면 됩니다.

**참고**: 프론트엔드가 백엔드 API를 호출하므로, 백엔드도 함께 실행해야 합니다.

## 백엔드 설정 (Render)

### 1. 로컬 테스트

```bash
cd backend
yarn install
yarn start
```

서버가 `http://localhost:8080`에서 실행됩니다.

### 전체 로컬 개발 환경 실행

**터미널 1 - 백엔드:**
```bash
cd backend
yarn install
yarn start
```

**터미널 2 - 프론트엔드:**
```bash
cd frontend
yarn install
yarn start
```

이제 브라우저에서 `http://localhost:8080`으로 접속하면 프론트엔드와 백엔드가 연동된 상태로 테스트할 수 있습니다.

### 2. Render 배포

1. GitHub에 코드 푸시
2. Render 대시보드에서 "New Web Service" 선택
3. GitHub 저장소 연결
4. **중요 설정:**
   - **Root Directory**: `backend` ⚠️ **반드시 설정!**
   - **Build Command**: `yarn install` 또는 `npm install`
   - **Start Command**: `yarn start` 또는 `npm start`
   - **Environment**: `Node`
5. 배포 완료 후 URL 확인 (예: `https://your-app-name.onrender.com`)

**참고**: Root Directory를 `backend`로 설정하지 않으면 빌드가 실패합니다!

### 3. GitHub Pages 프론트엔드 배포

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source** 설정:
   - Branch: `main`
   - Folder: `/frontend` ⚠️ **frontend 폴더 선택!**
3. 저장 후 몇 분 후 배포 완료

### 4. 프론트엔드 API URL 업데이트

**중요**: Render 배포 후 프론트엔드에서 백엔드 URL을 설정해야 합니다.

`frontend/index.html` 파일을 열어서 다음 부분을 찾아 수정하세요:

```javascript
// 🔧 Render 백엔드 URL 설정
const BACKEND_URL = 'https://your-app-name.onrender.com';  // ← 여기에 실제 Render URL 입력
```

**예시:**
- Render에서 배포한 URL이 `https://it-news-api.onrender.com`이라면:
```javascript
const BACKEND_URL = 'https://it-news-api.onrender.com';
```

**확인 방법:**
1. Render 대시보드에서 배포된 서비스 URL 확인
2. `https://your-render-url.onrender.com/api/health` 접속해서 `{"status":"ok"}` 응답 확인
3. 프론트엔드 `index.html`의 `BACKEND_URL` 수정
4. 브라우저 콘솔(F12)에서 "API URL: ..." 로그 확인

## API 엔드포인트

- `GET /api/articles` - 뉴스 기사 목록 조회
- `GET /api/health` - 서버 상태 확인
- `POST /api/collect` - 수동 뉴스 수집 트리거

## RSS 피드 설정

`backend/scripts/collect-news.js`에서 RSS 피드 목록을 수정할 수 있습니다.

## 다음 단계

1. ✅ 백엔드 API 개발 완료
2. ✅ RSS 수집 스크립트 완료
3. ✅ 크론 작업 설정 완료
4. ⏳ Render 배포
5. ⏳ 애드센스 승인용 추가 페이지 작성 (About, 개인정보 처리방침 등)

