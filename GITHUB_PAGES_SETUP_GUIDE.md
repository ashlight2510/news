# GitHub Pages 루트 도메인 배포 완전 가이드

## ⚠️ 중요: GitHub Pages 설정 확인

**가장 중요한 단계입니다!** 이 설정이 잘못되어 있으면 `/frontend/` 경로로만 접속됩니다.

### 1. GitHub 저장소 설정 변경

1. GitHub 저장소로 이동
2. **Settings** (설정) 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션 확인:
   - ❌ **"Deploy from a branch"** 선택되어 있으면 → **"GitHub Actions"**로 변경
   - ✅ **"GitHub Actions"** 선택되어 있어야 함

### 2. 커스텀 도메인 확인

- **Custom domain** 필드에 `news.funnyfunny.cloud`가 입력되어 있는지 확인
- **Enforce HTTPS** 체크박스가 활성화되어 있는지 확인

## 배포 방법

### 자동 배포 (권장)

1. 변경사항 커밋 및 푸시:
```bash
git add .
git commit -m "Fix GitHub Pages root deployment"
git push origin main
```

2. GitHub Actions에서 배포 확인:
   - 저장소의 **Actions** 탭 클릭
   - "Deploy to GitHub Pages" 워크플로우 실행 확인
   - 배포가 완료될 때까지 대기 (약 1-2분)

### 수동 배포

1. GitHub 저장소 → **Actions** 탭
2. 왼쪽에서 **"Deploy to GitHub Pages"** 워크플로우 선택
3. **"Run workflow"** 버튼 클릭
4. **"Run workflow"** 확인

## 배포 후 확인

1. **배포 완료 대기**: GitHub Actions에서 "Deploy to GitHub Pages" 작업이 완료될 때까지 대기
2. **브라우저 캐시 클리어**: 
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. **접속 테스트**:
   - ✅ `https://news.funnyfunny.cloud/` → 메인 페이지가 보여야 함
   - ✅ `https://news.funnyfunny.cloud/about.html` → About 페이지가 보여야 함
   - ❌ `https://news.funnyfunny.cloud/frontend/` → 404 에러가 나야 함 (정상)

## 문제 해결

### 문제 1: 여전히 README.md가 보임

**원인**: GitHub Pages Source가 "Deploy from a branch"로 설정되어 있음

**해결**:
1. Settings → Pages → Source를 **"GitHub Actions"**로 변경
2. 수동으로 워크플로우 실행

### 문제 2: `/frontend/`로만 접속 가능

**원인**: GitHub Actions 배포가 실행되지 않았거나 실패함

**해결**:
1. GitHub Actions 탭에서 에러 로그 확인
2. 워크플로우를 수동으로 실행
3. Settings → Pages → Source가 "GitHub Actions"인지 확인

### 문제 3: 커스텀 도메인 작동 안 함

**원인**: DNS 설정 문제 또는 GitHub Pages 설정 문제

**해결**:
1. Settings → Pages에서 커스텀 도메인 제거 후 다시 추가
2. DNS 설정 확인 (CNAME 레코드가 올바른지)
3. DNS 전파 대기 (최대 24시간)

## 워크플로우 작동 방식

1. **Clean root directory**: 루트의 모든 파일 삭제 (frontend, backend, .git, .github 제외)
2. **Copy frontend to root**: frontend 폴더의 모든 내용을 루트로 복사
3. **Create .nojekyll**: Jekyll 비활성화 파일 생성
4. **Upload artifact**: 배포할 파일 업로드
5. **Deploy to GitHub Pages**: GitHub Pages에 배포

## 확인 사항 체크리스트

배포 전:
- [ ] GitHub Pages Source가 "GitHub Actions"로 설정됨
- [ ] `frontend/CNAME` 파일이 존재함
- [ ] `frontend/index.html` 파일이 존재함
- [ ] `.github/workflows/deploy-pages.yml` 파일이 존재함

배포 후:
- [ ] GitHub Actions에서 배포 성공 확인
- [ ] `https://news.funnyfunny.cloud/` 접속 시 메인 페이지 표시
- [ ] `https://news.funnyfunny.cloud/` 접속 시 README.md가 보이지 않음
- [ ] 브라우저 개발자 도구에서 404 에러 없음

