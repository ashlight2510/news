# SEO 최적화 가이드

## 추가된 SEO 기능

### 1. 메타 태그
- **Description**: 검색 결과에 표시될 설명
- **Keywords**: 검색 키워드
- **Robots**: 검색 엔진 크롤링 지시

### 2. Open Graph 태그
- 페이스북, 카카오톡 등 SNS 공유 시 썸네일과 설명 표시
- `og:image`: 공유 시 표시될 이미지 (1200x630px)
- `og:title`, `og:description`: 공유 시 제목과 설명

### 3. Twitter Card
- 트위터 공유 시 카드 형태로 표시
- `summary_large_image` 타입 사용

### 4. 구조화된 데이터 (JSON-LD)
- Google 검색 결과에 리치 스니펫 표시 가능
- WebSite 스키마
- NewsMediaOrganization 스키마

### 5. robots.txt
- 검색 엔진 크롤러 지시
- Sitemap 위치 안내

### 6. sitemap.xml
- 사이트 구조를 검색 엔진에 알림
- 크롤링 우선순위 설정

## 구글 검색 등록 방법

### 1. Google Search Console 등록
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가 → URL 접두어 입력: `https://news.ashlight.store`
3. 소유권 확인 (HTML 파일 업로드 또는 메타 태그)

### 2. Sitemap 제출
1. Google Search Console → Sitemaps
2. `https://news.ashlight.store/sitemap.xml` 제출

### 3. 인덱싱 요청
1. Google Search Console → URL 검사
2. 메인 페이지 URL 입력
3. "색인 생성 요청" 클릭

## SEO 체크리스트

### 기본 설정
- [x] 메타 description 추가
- [x] 메타 keywords 추가
- [x] Open Graph 태그 추가
- [x] Twitter Card 태그 추가
- [x] Canonical URL 설정
- [x] 구조화된 데이터 (JSON-LD) 추가
- [x] robots.txt 생성
- [x] sitemap.xml 생성
- [x] OG 이미지 생성

### 추가 권장 사항
- [ ] Google Search Console 등록
- [ ] Google Analytics 추가 (선택)
- [ ] 페이지 속도 최적화
- [ ] 모바일 반응형 확인
- [ ] HTTPS 설정 확인
- [ ] 정기적인 콘텐츠 업데이트

## 공유 테스트

### 페이스북/카카오톡 공유 미리보기
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Kakao Developers - Link Preview](https://developers.kakao.com/tool/clear/og)

### 트위터 카드 미리보기
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 검색 순위 향상 팁

1. **정기적인 콘텐츠 업데이트**
   - 매 시간마다 뉴스 자동 수집 (이미 구현됨)
   - 최신 뉴스 유지

2. **페이지 속도 최적화**
   - 이미지 최적화
   - CSS/JS 최소화

3. **모바일 최적화**
   - 반응형 디자인 (이미 구현됨)
   - 모바일 친화적 UI

4. **사용자 경험**
   - 빠른 로딩 속도
   - 직관적인 네비게이션
   - 언어 필터 기능

5. **백링크 구축**
   - 소셜 미디어 공유
   - 관련 사이트 링크

