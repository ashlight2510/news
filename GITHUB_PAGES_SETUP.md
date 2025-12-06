# GitHub Pages 루트 도메인 설정 가이드

## 현재 문제

- `https://news.ashlight.store/` → README.md가 보임 (잘못됨)
- `https://news.ashlight.store/frontend/` → 실제 페이지가 보임 (올바름)

**원인**: GitHub Pages가 "Deploy from a branch" 모드로 설정되어 있음

## 해결 방법: GitHub Actions 사용

### 1단계: GitHub 저장소 설정 변경

1. GitHub 저장소로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서:
   - 현재: "Deploy from a branch" 선택됨
   - 변경: **"GitHub Actions"** 선택 ⚠️
5. **Save** 클릭

### 2단계: GitHub Actions 확인

1. GitHub 저장소 → **Actions** 탭
2. "Deploy to GitHub Pages" 워크플로우가 있는지 확인
3. 없으면 `.github/workflows/deploy-pages.yml` 파일이 있는지 확인
4. 있으면 수동으로 트리거:
   - Actions 탭 → "Deploy to GitHub Pages" → "Run workflow"

### 3단계: 배포 확인

1. Actions 탭에서 워크플로우 실행 확인
2. 완료되면 `https://news.ashlight.store/` 접속
3. 이제 루트 도메인에서 페이지가 보여야 함

## 문제 해결

### 문제 1: "GitHub Actions" 옵션이 보이지 않음

**해결:**
- 저장소가 Public이거나 GitHub Pro 계정이어야 함
- 또는 저장소 Settings → Actions → General에서 "Allow all actions" 확인

### 문제 2: 워크플로우가 실행되지 않음

**해결:**
1. `.github/workflows/deploy-pages.yml` 파일이 있는지 확인
2. 파일이 있으면 수동으로 트리거:
   - Actions 탭 → "Deploy to GitHub Pages" → "Run workflow" → "Run workflow" 버튼

### 문제 3: 배포 후에도 README가 보임

**해결:**
1. GitHub Actions 로그 확인:
   - Actions 탭 → 최신 워크플로우 실행 → 로그 확인
2. "Copy frontend files to root" 단계가 성공했는지 확인
3. 캐시 문제일 수 있음:
   - 브라우저 캐시 삭제 (Ctrl+Shift+R 또는 Cmd+Shift+R)
   - 또는 시크릿 모드에서 테스트

## 설정 확인 체크리스트

- [ ] GitHub Pages Source가 "GitHub Actions"로 설정됨
- [ ] `.github/workflows/deploy-pages.yml` 파일이 존재함
- [ ] GitHub Actions 워크플로우가 실행됨
- [ ] 워크플로우가 성공적으로 완료됨
- [ ] `https://news.ashlight.store/`에서 페이지가 보임

## 참고

- GitHub Actions를 사용하면 `frontend` 폴더의 내용이 루트로 복사되어 배포됩니다
- 이렇게 하면 `/frontend/` 경로 없이 루트 도메인으로 접속 가능합니다
- 배포는 `frontend` 폴더가 변경될 때마다 자동으로 실행됩니다

