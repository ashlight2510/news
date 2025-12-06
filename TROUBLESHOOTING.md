# 문제 해결 가이드

## 🔍 전체 시스템 점검 체크리스트

### 1. 백엔드 (Render) 점검

#### ✅ 백엔드 서버 상태 확인
```bash
# 헬스 체크
curl https://news-u60e.onrender.com/api/health

# 예상 응답: {"status":"ok","timestamp":"..."}
```

**문제가 있다면:**
- Render 대시보드에서 서비스 상태 확인
- Logs 탭에서 에러 메시지 확인
- 서비스가 "Live" 상태인지 확인

#### ✅ 뉴스 수집 확인
```bash
# 수동 수집 트리거
curl -X POST https://news-u60e.onrender.com/api/collect

# 예상 응답: {"message":"News collected successfully","count":XX}
```

**문제가 있다면:**
- Render Logs에서 RSS 수집 에러 확인
- RSS 피드 URL이 유효한지 확인
- 네트워크 연결 문제 확인

#### ✅ API 엔드포인트 확인
```bash
# 뉴스 목록 조회
curl https://news-u60e.onrender.com/api/articles

# 예상 응답: JSON 배열 (뉴스 기사 목록)
```

**문제가 있다면:**
- 빈 배열 `[]`이면 뉴스 수집이 안 된 것
- 에러 메시지가 있으면 로그 확인

#### ✅ Render 설정 확인
- [ ] Root Directory: `backend` 설정됨
- [ ] Build Command: `yarn install` 또는 `npm install`
- [ ] Start Command: `yarn start` 또는 `npm start`
- [ ] Environment: `Node`

### 2. 프론트엔드 (GitHub Pages) 점검

#### ✅ API URL 설정 확인
`frontend/index.html` 파일 확인:
```javascript
const BACKEND_URL = 'https://news-u60e.onrender.com';  // 올바른 URL인지 확인
```

#### ✅ 브라우저 콘솔 확인
1. 브라우저에서 `https://news.ashlight.store/frontend/` 접속
2. F12 → Console 탭
3. 확인 사항:
   - "API URL: https://news-u60e.onrender.com/api/articles" 로그 확인
   - 에러 메시지 확인

#### ✅ 네트워크 탭 확인
1. F12 → Network 탭
2. 페이지 새로고침
3. `/api/articles` 요청 확인:
   - Status: 200 OK (성공)
   - Status: 404 (URL 오류)
   - Status: 500 (서버 오류)
   - Failed (네트워크/CORS 오류)

#### ✅ CORS 확인
- 백엔드 `server.js`에서 CORS 설정 확인:
  ```javascript
  app.use(cors({
    origin: '*',  // 모든 origin 허용
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  ```

### 3. 일반적인 문제와 해결 방법

#### 문제 1: "뉴스를 불러오는 중..."만 표시됨

**원인:**
- 백엔드 서버가 응답하지 않음
- API URL이 잘못됨
- 네트워크 연결 문제

**해결:**
1. 백엔드 헬스 체크: `curl https://news-u60e.onrender.com/api/health`
2. 브라우저 콘솔에서 에러 확인
3. Network 탭에서 요청 상태 확인

#### 문제 2: "Failed to fetch" 오류

**원인:**
- CORS 오류
- 백엔드 서버가 다운됨
- 네트워크 연결 문제

**해결:**
1. 백엔드 서버 상태 확인 (Render 대시보드)
2. CORS 설정 확인 (이미 설정됨)
3. 브라우저 콘솔에서 자세한 에러 확인

#### 문제 3: 빈 배열 반환 (뉴스 없음)

**원인:**
- RSS 수집이 실패함
- 뉴스 수집이 아직 실행되지 않음

**해결:**
1. 수동 수집 트리거: `curl -X POST https://news-u60e.onrender.com/api/collect`
2. Render Logs에서 수집 로그 확인
3. RSS 피드 URL이 유효한지 확인

#### 문제 4: 한국어가 깨짐

**원인:**
- 인코딩 변환이 제대로 안 됨
- RSS 피드 인코딩 문제

**해결:**
1. Render Logs에서 수집 로그 확인
2. `iconv-lite` 라이브러리가 설치되었는지 확인
3. 백엔드 재배포

#### 문제 5: Render 서비스가 슬립 모드

**원인:**
- Render 무료 플랜은 15분 비활성 시 슬립 모드

**해결:**
1. 첫 요청 시 최대 50초 대기
2. Render Pro 플랜 사용 (항상 활성)
3. Uptime Robot 같은 서비스로 주기적 핑

### 4. 단계별 디버깅

#### Step 1: 백엔드 독립 테스트
```bash
# 1. 헬스 체크
curl https://news-u60e.onrender.com/api/health

# 2. 뉴스 수집
curl -X POST https://news-u60e.onrender.com/api/collect

# 3. 뉴스 조회
curl https://news-u60e.onrender.com/api/articles
```

#### Step 2: 프론트엔드에서 백엔드 테스트
브라우저 콘솔에서:
```javascript
// API URL 확인
console.log('API URL:', 'https://news-u60e.onrender.com/api/articles');

// 직접 fetch 테스트
fetch('https://news-u60e.onrender.com/api/articles')
  .then(res => res.json())
  .then(data => console.log('Articles:', data))
  .catch(err => console.error('Error:', err));
```

#### Step 3: Render Logs 확인
1. Render 대시보드 → 서비스 → Logs
2. 확인 사항:
   - 서버 시작 로그
   - 뉴스 수집 로그
   - 에러 메시지

### 5. 빠른 수정 방법

#### 백엔드 재배포
1. Render 대시보드 → 서비스 → Manual Deploy
2. 또는 GitHub에 푸시하면 자동 재배포

#### 뉴스 수집 강제 실행
```bash
curl -X POST https://news-u60e.onrender.com/api/collect
```

#### 프론트엔드 재배포
1. GitHub에 푸시
2. GitHub Pages 자동 배포 (몇 분 소요)

### 6. 현재 상태 확인 명령어

```bash
# 전체 시스템 상태 확인 스크립트
echo "=== 백엔드 헬스 체크 ==="
curl -s https://news-u60e.onrender.com/api/health | jq .

echo "\n=== 뉴스 수집 상태 ==="
curl -s -X POST https://news-u60e.onrender.com/api/collect | jq .

echo "\n=== 뉴스 목록 (최대 5개) ==="
curl -s https://news-u60e.onrender.com/api/articles | jq '.[0:5]'
```

