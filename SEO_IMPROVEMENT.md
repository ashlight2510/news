# SEO 개선 가이드: ads.txt와 robots.txt

## ads.txt와 robots.txt의 역할

### ads.txt (Authorized Digital Sellers)
- **목적**: 광고 수익 최적화 (검색 유입과는 직접 관련 없음)
- **효과**: 
  - 애드센스 승인 후 광고 수익 보호
  - 사이트 신뢰도 향상 (간접적으로 SEO 도움)
  - 불법 광고 차단
- **위치**: 루트 도메인 (`https://news.ashlight.store/ads.txt`)

### robots.txt
- **목적**: 검색 엔진 크롤러 지시
- **효과**: 
  - ✅ **검색 유입에 직접 도움**
  - 크롤링 효율 향상
  - 불필요한 페이지 크롤링 방지
  - Sitemap 위치 안내
- **위치**: 루트 도메인 (`https://news.ashlight.store/robots.txt`)

## 검색 유입 향상을 위한 최적화

### 1. robots.txt 최적화 (완료)
- ✅ 모든 크롤러 허용
- ✅ 주요 검색 엔진 봇 최적화 (Google, Bing, 네이버, 다음)
- ✅ Sitemap 위치 명시
- ✅ 불필요한 폴더 차단

### 2. ads.txt 추가 (완료)
- ✅ 기본 파일 생성
- ⏳ 애드센스 승인 후 Publisher ID 추가 필요

### 3. 추가 SEO 최적화 방법

#### Google Search Console 등록 (필수)
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가: `https://news.ashlight.store`
3. 소유권 확인
4. Sitemap 제출: `https://news.ashlight.store/sitemap.xml`

#### 네이버 서치어드바이저 등록 (한국 검색)
1. [네이버 서치어드바이저](https://searchadvisor.naver.com/) 접속
2. 사이트 등록
3. 사이트맵 제출

#### 다음 검색 등록
1. [다음 웹마스터 도구](https://webmaster.daum.net/) 접속
2. 사이트 등록
3. 사이트맵 제출

## 검색 유입 향상 체크리스트

### 기본 설정 (완료)
- [x] robots.txt 최적화
- [x] sitemap.xml 생성
- [x] 메타 태그 (description, keywords)
- [x] Open Graph 태그
- [x] 구조화된 데이터 (JSON-LD)
- [x] ads.txt 추가

### 검색 엔진 등록 (필수)
- [ ] Google Search Console 등록
- [ ] 네이버 서치어드바이저 등록
- [ ] 다음 웹마스터 도구 등록

### 콘텐츠 최적화
- [x] 정기적인 뉴스 업데이트 (매 시간 자동)
- [x] 한국어/영어 뉴스 제공
- [x] 모바일 반응형 디자인
- [x] 빠른 로딩 속도

### 추가 권장 사항
- [ ] Google Analytics 추가 (트래픽 분석)
- [ ] 페이지 속도 최적화
- [ ] 이미지 최적화
- [ ] 내부 링크 구조 개선

## ads.txt 설정 방법

### 애드센스 승인 후
1. Google AdSense 대시보드에서 Publisher ID 확인
2. `frontend/ads.txt` 파일 수정:
   ```
   google.com, pub-XXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
3. GitHub에 푸시하여 배포

### 확인 방법
- `https://news.ashlight.store/ads.txt` 접속
- 내용이 올바르게 표시되는지 확인

## 검색 유입 모니터링

### Google Search Console
- 검색 쿼리 분석
- 노출 수 / 클릭 수 확인
- 인덱싱 상태 확인

### 네이버 서치어드바이저
- 검색 노출 현황
- 클릭 수 확인

## 예상 효과

### robots.txt 최적화
- ✅ 크롤링 효율 향상
- ✅ 인덱싱 속도 개선
- ✅ 검색 결과 노출 증가

### ads.txt 추가
- ✅ 애드센스 승인 후 광고 수익 보호
- ✅ 사이트 신뢰도 향상 (간접적 SEO 효과)

### 검색 엔진 등록
- ✅ 검색 결과 노출 증가
- ✅ 트래픽 분석 가능
- ✅ SEO 문제 발견 및 해결

## 참고

- **검색 유입에 가장 큰 영향**: Google Search Console 등록 + Sitemap 제출
- **robots.txt**: 크롤링 효율 향상에 도움
- **ads.txt**: 검색 유입과는 직접 관련 없지만, 사이트 신뢰도 향상에 도움

