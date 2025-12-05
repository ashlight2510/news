# IT 뉴스 백엔드 API

Render에서 배포하는 Express 기반 뉴스 수집 및 API 서버입니다.

## 기능

- RSS 피드에서 IT 뉴스 자동 수집
- 매 시간마다 자동으로 뉴스 업데이트 (크론 작업)
- RESTful API로 뉴스 데이터 제공
- CORS 지원 (프론트엔드에서 접근 가능)

## 설치 및 실행

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 모드 실행 (nodemon 사용)
npm run dev

# 프로덕션 모드 실행
npm start

# 수동 뉴스 수집
npm run collect
```

### 환경 변수

`.env` 파일 생성 (선택사항):

```env
PORT=3000
NODE_ENV=production
```

Render에서는 `PORT`가 자동으로 설정됩니다.

## API 엔드포인트

### GET /api/articles

뉴스 기사 목록을 반환합니다.

**응답 예시:**
```json
[
  {
    "title": "기사 제목",
    "url": "https://example.com/article",
    "source": "TechCrunch",
    "published_at": "2024-01-01T00:00:00.000Z",
    "summary": "기사 요약",
    "description": "기사 전체 내용"
  }
]
```

### GET /api/health

서버 상태를 확인합니다.

**응답:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/collect

수동으로 뉴스 수집을 트리거합니다.

**응답:**
```json
{
  "message": "News collected successfully",
  "count": 50
}
```

## RSS 피드 추가

`scripts/collect-news.js` 파일의 `RSS_FEEDS` 배열에 새로운 피드를 추가하세요:

```javascript
{
  name: '사이트 이름',
  url: 'https://example.com/rss',
  source: '출처 표시명'
}
```

## Render 배포

1. GitHub 저장소에 코드 푸시
2. Render 대시보드에서 "New Web Service" 선택
3. 저장소 연결 및 설정:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
4. 배포 완료 후 URL 확인

## 주의사항

- 현재는 메모리 기반 저장소를 사용합니다. 프로덕션에서는 데이터베이스(PostgreSQL 등) 사용을 권장합니다.
- RSS 피드 URL이 유효한지 확인하세요.
- 일부 RSS 피드는 CORS 정책으로 인해 접근이 제한될 수 있습니다.

