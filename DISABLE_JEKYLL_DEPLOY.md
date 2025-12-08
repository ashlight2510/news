# Jekyll 배포 비활성화 가이드

## 문제
배포 시 두 개의 워크플로우가 동시에 실행됩니다:
1. ✅ "Deploy static content to Pages" (우리가 만든 GitHub Actions)
2. ❌ "Deploy Jekyll with GitHub Pages dependencies preinstalled" (GitHub 기본 Jekyll 배포)

Jekyll 배포가 실행되면 README.md가 다시 표시될 수 있습니다.

## 해결 방법

### 방법 1: GitHub Pages 설정 변경 (권장)

1. **GitHub 저장소로 이동**
2. **Settings** → **Pages** 클릭
3. **Source** 섹션 확인:
   - 현재 "Deploy from a branch"가 선택되어 있을 수 있습니다
   - **"GitHub Actions"**로 변경하세요
4. **"Deploy from a branch" 옵션을 완전히 비활성화**:
   - Branch를 "None"으로 선택하거나
   - Source를 "GitHub Actions"로 변경

### 방법 2: gh-pages 브랜치 삭제 (선택사항)

Jekyll 배포가 `gh-pages` 브랜치를 사용하고 있다면:

```bash
# 로컬에서 gh-pages 브랜치 삭제 (선택사항)
git push origin --delete gh-pages
```

**주의**: 이 방법은 GitHub Pages 설정에서 "Deploy from a branch"가 비활성화된 후에만 사용하세요.

### 방법 3: .nojekyll 파일을 루트에 추가

루트 디렉토리에 `.nojekyll` 파일이 있으면 Jekyll이 비활성화됩니다.

현재 우리의 배포 워크플로우가 이미 `.nojekyll` 파일을 생성하고 있지만, 
Jekyll 배포가 먼저 실행되면 문제가 될 수 있습니다.

## 확인 방법

### 1. GitHub Pages 설정 확인

Settings → Pages에서:
- ✅ Source: **"GitHub Actions"**만 선택
- ❌ Source: "Deploy from a branch" 선택 안 함

### 2. Actions 탭에서 확인

배포 후 Actions 탭에서:
- ✅ "Deploy to GitHub Pages" 워크플로우만 실행됨
- ❌ "Deploy Jekyll with GitHub Pages dependencies preinstalled" 워크플로우가 실행되지 않음

### 3. 배포 로그 확인

우리의 배포 워크플로우 로그에서:
```
✅ .nojekyll
✅ README.md and all .md files removed
✅ index.html is present and will be served as default
```

## 현재 상태 확인

1. **Settings → Pages**에서 Source 확인
2. **Actions** 탭에서 최근 실행된 워크플로우 확인
3. `https://news.ashlight.store/` 접속하여 README.md가 아닌 index.html이 표시되는지 확인

## 추가 조치

만약 여전히 Jekyll 배포가 실행된다면:

1. **워크플로우 파일 확인**:
   - `.github/workflows/` 디렉토리에 Jekyll 관련 워크플로우가 있는지 확인
   - 있다면 삭제하거나 비활성화

2. **GitHub Pages 설정 재설정**:
   - Source를 다른 옵션으로 변경
   - 저장
   - 다시 "GitHub Actions"로 변경
   - 저장

3. **캐시 클리어**:
   - 브라우저 캐시 삭제
   - 시크릿 모드로 접속 테스트

## 참고

- GitHub Pages는 기본적으로 Jekyll을 사용합니다
- `.nojekyll` 파일이 있으면 Jekyll 처리가 비활성화됩니다
- "Deploy from a branch"를 사용하면 Jekyll 배포가 자동으로 실행됩니다
- "GitHub Actions"를 사용하면 우리가 만든 워크플로우만 실행됩니다

