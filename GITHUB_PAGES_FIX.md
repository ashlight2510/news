# GitHub Pages 루트 도메인 배포 문제 해결

## 문제
- `https://news.ashlight.store/` 접속 불가
- `https://news.ashlight.store/frontend/` 로만 접속 가능

## 해결 방법

### 1. GitHub 저장소 설정 확인

1. GitHub 저장소로 이동
2. **Settings** → **Pages** 메뉴 클릭
3. **Source** 섹션에서 **"GitHub Actions"** 선택 (중요!)
   - ❌ "Deploy from a branch" 선택하면 안 됨
   - ✅ "GitHub Actions" 선택해야 함

### 2. 워크플로우 확인

`.github/workflows/deploy-pages.yml` 파일이 올바르게 설정되어 있는지 확인:

- `frontend/` 폴더의 모든 파일을 루트로 복사
- `.nojekyll` 파일 생성
- `CNAME` 파일 포함

### 3. 배포 후 확인

배포가 완료되면:

1. GitHub Actions 탭에서 배포 상태 확인
2. `https://news.ashlight.store/` 접속 테스트
3. 브라우저 캐시 클리어 후 재시도 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### 4. 문제가 계속되면

1. GitHub 저장소 Settings → Pages에서 커스텀 도메인 제거 후 다시 추가
2. DNS 설정 확인 (CNAME 레코드가 올바른지)
3. GitHub Actions 로그 확인하여 에러 메시지 확인

## 현재 워크플로우 구조

```
1. Checkout 코드
2. Setup Pages
3. frontend/ 폴더의 모든 파일을 루트로 복사
4. .nojekyll 파일 생성
5. Artifact 업로드
6. GitHub Pages 배포
```

## 확인 사항

- [ ] GitHub Pages Source가 "GitHub Actions"로 설정됨
- [ ] `.github/workflows/deploy-pages.yml` 파일이 존재함
- [ ] `frontend/CNAME` 파일이 존재함
- [ ] `frontend/index.html` 파일이 존재함
- [ ] 배포 후 루트에 `.nojekyll` 파일이 생성됨

