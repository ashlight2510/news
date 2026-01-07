# 배포 전 체크리스트

## ✅ 현재 상태 확인

### 1. 워크플로우 파일 확인
- ✅ `deploy-pages.yml` - 메인 배포 워크플로우 (존재)
- ✅ `news-summary.yml` - 뉴스 요약 생성 워크플로우 (존재)
- ❌ `static.yml` - 삭제됨
- ❌ `jekyll-gh-pages.yml` - 삭제됨
- ❌ `disable-jekyll.yml` - 삭제됨

### 2. 배포 워크플로우 설정 확인
- ✅ `concurrency: cancel-in-progress: true` - 충돌 방지
- ✅ `frontend/` 내용을 루트로 복사
- ✅ README.md 삭제
- ✅ `.nojekyll` 파일 생성
- ✅ `index.html` 검증

### 3. GitHub Pages 설정 확인
**Settings → Pages**에서:
- ✅ Source: **"GitHub Actions"** 선택
- ❌ "Deploy from a branch" 비활성화

## 🚀 배포 절차

### 1단계: 변경사항 커밋 및 푸시

```bash
git add .github/workflows/
git commit -m "fix: 불필요한 워크플로우 삭제 및 배포 충돌 방지"
git push origin main
```

### 2단계: 배포 확인

1. **GitHub 저장소** → **Actions** 탭
2. **"Deploy to GitHub Pages"** 워크플로우 확인
3. 워크플로우가 자동으로 실행됨 (또는 수동으로 "Run workflow" 클릭)
4. 배포 완료 대기 (약 1-2분)

### 3단계: 배포 로그 확인

배포 로그에서 다음 메시지 확인:
```
✅ index.html
✅ .nojekyll
✅ CNAME
✅ README.md and all .md files removed
✅ Deployment ready!
```

### 4단계: 사이트 확인

배포 완료 후 (약 2-3분 대기):

1. **루트 경로 확인**:
   - `https://news.funnyfunny.cloud/` 접속
   - ✅ `index.html`이 표시되어야 함
   - ❌ README.md가 표시되면 안 됨
   - ❌ 404 에러가 나면 안 됨

2. **브라우저 캐시 문제 해결**:
   - 시크릿 모드로 접속 테스트
   - 또는 `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)로 강력 새로고침

3. **개발자 도구 확인**:
   - F12 → Network 탭
   - `index.html`이 200 상태로 로드되는지 확인

## 🔍 예상 결과

### 성공 시:
- ✅ `https://news.funnyfunny.cloud/` → `index.html` 표시
- ✅ `https://news.funnyfunny.cloud/frontend/` → 404 또는 리다이렉트 (정상)
- ✅ Actions 탭에 "Deploy to GitHub Pages"만 실행됨
- ✅ 다른 워크플로우는 실행되지 않음

### 실패 시:
- ❌ 여전히 README.md가 표시됨
- ❌ 404 에러 발생
- ❌ 여러 워크플로우가 동시에 실행됨

## 🛠️ 문제 해결

### 문제 1: 여전히 README.md가 보임

**해결:**
1. GitHub Actions 로그에서 "README.md removed" 메시지 확인
2. `.nojekyll` 파일이 생성되었는지 확인
3. 브라우저 캐시 삭제
4. GitHub Pages CDN 캐시는 최대 10분 걸릴 수 있음

### 문제 2: 404 에러

**해결:**
1. Actions 탭에서 배포가 성공했는지 확인
2. 배포 로그에서 `index.html`이 있는지 확인
3. Settings → Pages에서 Source가 "GitHub Actions"인지 확인
4. 수동으로 "Run workflow" 다시 실행

### 문제 3: 여러 워크플로우가 실행됨

**해결:**
1. `.github/workflows/` 디렉토리 확인
2. `deploy-pages.yml`과 `news-summary.yml`만 있어야 함
3. 다른 워크플로우 파일이 있으면 삭제

## 📝 참고

- 배포는 보통 1-2분 정도 걸립니다
- GitHub Pages CDN 캐시는 최대 10분까지 걸릴 수 있습니다
- 첫 배포는 더 오래 걸릴 수 있습니다
- `concurrency: cancel-in-progress: true`로 설정되어 있어서 동시 배포는 취소됩니다

