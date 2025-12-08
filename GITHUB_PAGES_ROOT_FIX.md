# GitHub Pages 루트 도메인 설정 가이드

## 문제
`https://news.ashlight.store/`에 접속하면 README.md가 표시되는 문제

## 해결 방법

### 1. GitHub Pages 설정 확인

GitHub 저장소 → **Settings** → **Pages**에서 다음을 확인하세요:

1. **Source**: 반드시 **"GitHub Actions"**로 설정되어 있어야 합니다
   - ❌ "Deploy from a branch" 선택하면 안 됩니다
   - ✅ **"GitHub Actions"** 선택

2. **Custom domain**: `news.ashlight.store`로 설정되어 있는지 확인

### 2. GitHub Actions 워크플로우 확인

`.github/workflows/deploy-pages.yml`이 다음을 수행합니다:

1. ✅ 루트 디렉토리 정리 (README.md 포함 모든 마크다운 파일 삭제)
2. ✅ `frontend/` 내용을 루트로 복사
3. ✅ `.nojekyll` 파일 생성 (Jekyll 비활성화)
4. ✅ `index.html`이 루트에 있는지 확인

### 3. 배포 후 확인

배포가 완료되면 다음을 확인하세요:

1. **Actions 탭**에서 배포 워크플로우가 성공했는지 확인
2. 배포 로그에서 다음 메시지 확인:
   ```
   ✅ index.html
   ✅ .nojekyll
   ✅ README.md and all .md files removed
   ```

3. 브라우저에서 `https://news.ashlight.store/` 접속
4. 개발자 도구(F12) → Network 탭에서:
   - `index.html`이 200 상태로 로드되는지 확인
   - `README.md`가 로드되지 않는지 확인

### 4. 캐시 문제 해결

여전히 README.md가 보인다면:

1. **브라우저 캐시 삭제**:
   - Chrome/Edge: `Ctrl+Shift+Delete` (Windows) 또는 `Cmd+Shift+Delete` (Mac)
   - 또는 시크릿 모드로 접속

2. **GitHub Pages 캐시**:
   - GitHub Pages는 CDN 캐시를 사용하므로 변경사항이 반영되는데 최대 10분 정도 걸릴 수 있습니다
   - URL에 쿼리 파라미터 추가: `https://news.ashlight.store/?v=2`

### 5. 수동 배포 트리거

즉시 배포를 원한다면:

1. GitHub 저장소 → **Actions** 탭
2. **"Deploy to GitHub Pages"** 워크플로우 선택
3. **"Run workflow"** 클릭
4. 배포 완료 대기 (약 1-2분)

### 6. 최종 확인 체크리스트

- [ ] GitHub Pages Source가 "GitHub Actions"로 설정됨
- [ ] `.nojekyll` 파일이 배포에 포함됨
- [ ] `index.html`이 루트 디렉토리에 있음
- [ ] README.md가 배포 디렉토리에 없음
- [ ] 브라우저에서 `https://news.ashlight.store/` 접속 시 index.html이 표시됨

## 문제가 계속되면

1. **GitHub Actions 로그 확인**:
   - Actions 탭 → 최근 배포 → 로그 확인
   - "README.md removed" 메시지가 있는지 확인

2. **파일 구조 확인**:
   - 배포 로그에서 "Root directory contents" 확인
   - `index.html`이 첫 번째 파일인지 확인

3. **GitHub Pages 설정 재설정**:
   - Settings → Pages → Source를 다른 옵션으로 변경 후 다시 "GitHub Actions"로 변경

## 참고

- `.nojekyll` 파일이 없으면 GitHub Pages가 Jekyll로 사이트를 처리하여 README.md를 기본 페이지로 표시할 수 있습니다
- GitHub Actions 배포는 `gh-pages` 브랜치가 아닌 별도의 배포 시스템을 사용합니다
- 커스텀 도메인 설정 시 DNS가 올바르게 설정되어 있어야 합니다

