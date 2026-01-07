# GitHub Pages 루트 도메인 문제 해결

## 현재 문제
- `https://news.funnyfunny.cloud/` → README.md가 보임
- `https://news.funnyfunny.cloud/frontend/` → 실제 페이지가 보임

## 해결 방법

### 1단계: GitHub 저장소 설정 변경 (필수!)

1. GitHub 저장소로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Build and deployment** 섹션에서:
   - **Source**: 현재 "Deploy from a branch" 선택됨
   - **변경**: **"GitHub Actions"** 선택 ⚠️ **반드시 이것을 선택!**
5. **Save** 클릭

### 2단계: GitHub Actions 워크플로우 수동 실행

1. GitHub 저장소 → **Actions** 탭
2. 왼쪽에서 **"Deploy to GitHub Pages"** 워크플로우 선택
3. **"Run workflow"** 버튼 클릭
4. **"Run workflow"** 확인
5. 워크플로우가 완료될 때까지 대기 (약 1-2분)

### 3단계: 확인

1. 워크플로우가 "완료" 상태인지 확인
2. `https://news.funnyfunny.cloud/` 접속
3. 이제 루트 도메인에서 페이지가 보여야 함

## 워크플로우 개선 사항

워크플로우가 다음과 같이 개선되었습니다:

1. **README.md 자동 제거**: 배포 시 README.md와 다른 마크다운 파일 제거
2. **불필요한 폴더 제거**: backend, .github 폴더 제거
3. **.nojekyll 파일 생성**: Jekyll 처리 비활성화
4. **검증 추가**: index.html이 있는지 확인

## 문제 해결

### 문제 1: "GitHub Actions" 옵션이 보이지 않음

**원인:**
- 저장소가 Private이고 GitHub Pro가 아님
- 또는 Actions가 비활성화됨

**해결:**
1. 저장소를 Public으로 변경 (권장)
2. 또는 Settings → Actions → General에서 "Allow all actions" 확인

### 문제 2: 워크플로우가 실행되지 않음

**해결:**
1. Actions 탭에서 "Deploy to GitHub Pages" 워크플로우 확인
2. 수동으로 트리거: "Run workflow" 버튼 클릭

### 문제 3: 배포 후에도 README가 보임

**해결:**
1. GitHub Actions 로그 확인:
   - Actions 탭 → 최신 워크플로우 실행 → 로그 확인
2. "Copy frontend files to root" 단계 확인
3. "Files in root after copy" 로그에서 index.html이 있는지 확인
4. 브라우저 캐시 삭제 (Ctrl+Shift+R 또는 Cmd+Shift+R)

## 확인 체크리스트

- [ ] GitHub Pages Source가 "GitHub Actions"로 설정됨
- [ ] GitHub Actions 워크플로우가 실행됨
- [ ] 워크플로우가 성공적으로 완료됨
- [ ] Actions 로그에서 index.html이 복사되었는지 확인
- [ ] `https://news.funnyfunny.cloud/`에서 페이지가 보임

## 중요 참고사항

**GitHub Pages 설정을 "GitHub Actions"로 변경하지 않으면:**
- 워크플로우가 실행되어도 배포되지 않음
- 여전히 "Deploy from a branch" 모드로 작동
- README.md가 계속 표시됨

**반드시 Settings → Pages → Source를 "GitHub Actions"로 변경해야 합니다!**

