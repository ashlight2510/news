# 404 에러 해결 가이드

## 문제
배포 후 `https://news.funnyfunny.cloud/`에서 404 에러가 발생합니다.

## 원인
여러 GitHub Actions 워크플로우가 동시에 실행되어 충돌이 발생했습니다:
1. ✅ `deploy-pages.yml` - 우리가 만든 올바른 워크플로우
2. ❌ `static.yml` - GitHub가 자동 생성한 불필요한 워크플로우
3. ❌ `jekyll-gh-pages.yml` - GitHub가 자동 생성한 불필요한 워크플로우

## 해결 방법

### 1. 불필요한 워크플로우 파일 삭제 (완료)

다음 파일들이 삭제되었습니다:
- `.github/workflows/static.yml` ❌ 삭제됨
- `.github/workflows/jekyll-gh-pages.yml` ❌ 삭제됨
- `.github/workflows/disable-jekyll.yml` ❌ 삭제됨

이제 `deploy-pages.yml`만 남아있습니다.

### 2. GitHub Pages 설정 확인

1. **GitHub 저장소** → **Settings** → **Pages**
2. **Source** 확인:
   - ✅ **"GitHub Actions"** 선택되어 있어야 함
   - ❌ "Deploy from a branch" 선택 안 함

### 3. 수동 배포 트리거

1. **Actions** 탭 → **"Deploy to GitHub Pages"** 워크플로우
2. **"Run workflow"** 클릭
3. 배포 완료 대기 (약 1-2분)

### 4. 배포 로그 확인

배포 로그에서 다음을 확인하세요:
```
✅ index.html
✅ .nojekyll
✅ README.md and all .md files removed
✅ Deployment ready!
```

### 5. 사이트 확인

배포 완료 후:
1. `https://news.funnyfunny.cloud/` 접속
2. 404가 아닌 `index.html`이 표시되어야 함
3. 브라우저 캐시 문제 시 시크릿 모드로 테스트

## 추가 조치

### concurrency 설정 변경

`deploy-pages.yml`의 `concurrency` 설정을 변경했습니다:
- `cancel-in-progress: true` - 다른 배포가 실행 중이면 취소하여 충돌 방지

### 워크플로우 파일 확인

`.github/workflows/` 디렉토리에 다음 파일만 있어야 합니다:
- ✅ `deploy-pages.yml` - 메인 배포 워크플로우
- ✅ `news-summary.yml` - 뉴스 요약 생성 워크플로우

## 문제가 계속되면

1. **GitHub Actions 로그 확인**:
   - Actions 탭 → 최신 배포 → 로그 확인
   - 에러 메시지 확인

2. **GitHub Pages 설정 재설정**:
   - Settings → Pages → Source를 다른 옵션으로 변경
   - 저장 후 다시 "GitHub Actions"로 변경
   - 저장

3. **캐시 클리어**:
   - 브라우저 캐시 삭제
   - 시크릿 모드로 접속 테스트
   - CDN 캐시는 최대 10분 정도 걸릴 수 있음

## 참고

- 여러 워크플로우가 동시에 실행되면 마지막 배포가 이전 배포를 덮어쓸 수 있습니다
- `concurrency: group: "pages"`로 설정하면 같은 그룹의 배포는 하나만 실행됩니다
- `cancel-in-progress: true`로 설정하면 새 배포가 실행 중인 배포를 취소합니다

