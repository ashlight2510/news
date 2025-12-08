# GitHub Actions + Ollama 기반 무료 뉴스 요약 시스템

## 개요

이 프로젝트는 **완전 무료**로 뉴스 요약을 생성하기 위해 GitHub Actions와 Ollama 오픈소스 LLM을 사용합니다.

- ✅ OpenAI API 비용 없음
- ✅ 매일 자동으로 뉴스 수집 및 요약 생성
- ✅ 정적 JSON 파일로 프론트엔드에 제공
- ✅ GitHub Actions에서 자동 실행

## 아키텍처

```
GitHub Actions (매일 06시 KST)
  ↓
1. Ollama 설치 및 모델 다운로드 (phi3:mini)
  ↓
2. scripts/fetchAndSummarize.mjs 실행
  ↓
3. RSS 피드에서 뉴스 수집
  ↓
4. 각 기사에 대해 Ollama LLM으로 요약 생성
  ↓
5. public/news-summaries.json 생성
  ↓
6. 자동 커밋 및 푸시
  ↓
GitHub Pages에 자동 배포
```

## 파일 구조

- `.github/workflows/news-summary.yml` - GitHub Actions 워크플로우
- `scripts/ollamaClient.mjs` - Ollama API 클라이언트
- `scripts/fetchAndSummarize.mjs` - 뉴스 수집 및 요약 생성 스크립트
- `public/news-summaries.json` - 생성된 요약 데이터 (자동 생성)

## 사용 모델

기본적으로 `phi3:mini` 모델을 사용합니다. 이 모델은:
- 경량화되어 빠른 처리 속도
- GitHub Actions 러너에서 실행 가능
- 한국어와 영어 모두 지원

대안 모델:
- `mistral:7b` - 더 큰 모델, 더 나은 품질 (더 느림)
- `llama3:8b` - Meta의 Llama 3 모델

## 워크플로우 설정

워크플로우는 매일 한국시간 오전 6시 (UTC 21시)에 자동 실행됩니다.

수동 실행도 가능:
1. GitHub 저장소 → Actions 탭
2. "Generate News Summaries" 워크플로우 선택
3. "Run workflow" 클릭

## 로컬 테스트

로컬에서 테스트하려면:

1. Ollama 설치:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

2. 모델 다운로드:
```bash
ollama pull phi3:mini
```

3. Ollama 서버 실행:
```bash
ollama serve
```

4. 스크립트 실행:
```bash
node scripts/fetchAndSummarize.mjs
```

## 프론트엔드 연동

프론트엔드는 `news-summaries.json` 파일을 자동으로 로드하여:
- 각 뉴스 기사와 요약 데이터를 매칭
- 요약, 핵심 포인트, 인사이트를 표시
- 요약이 없는 경우 "요약 준비 중입니다" 메시지 표시

## 기존 OpenAI 코드

`backend/lib/gptSummary.js`는 더 이상 사용되지 않으며 `[DEPRECATED]` 주석이 추가되었습니다.

실제 요약 생성은 GitHub Actions에서 수행되므로 백엔드 서버에서 LLM을 호출할 필요가 없습니다.

## 문제 해결

### Ollama 모델 다운로드 실패
- GitHub Actions 러너의 네트워크 문제일 수 있음
- 워크플로우를 다시 실행해보세요

### 요약 생성 실패
- 일부 기사는 fallback 요약을 사용합니다
- JSON 파싱 실패 시 기본 요약 텍스트를 사용합니다

### JSON 파일이 생성되지 않음
- GitHub Actions 로그를 확인하세요
- `public` 디렉토리가 존재하는지 확인하세요

## 비용

이 시스템은 **완전 무료**입니다:
- GitHub Actions: 무료 플랜에서 월 2,000분 제공
- Ollama: 오픈소스, 무료
- 모델: 오픈소스 모델, 무료 다운로드

## 향후 개선 사항

- [ ] 더 큰 모델 사용 (mistral:7b 등)
- [ ] 요약 품질 개선을 위한 프롬프트 최적화
- [ ] 캐싱 시스템으로 중복 요약 방지
- [ ] 요약 생성 실패율 모니터링

