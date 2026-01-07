#!/bin/bash

# 전체 시스템 상태 확인 스크립트

BACKEND_URL="https://news-u60e.onrender.com"

echo "🔍 IT 뉴스 시스템 상태 점검"
echo "================================"
echo ""

echo "1️⃣ 백엔드 헬스 체크"
echo "-------------------"
HEALTH=$(curl -s "${BACKEND_URL}/api/health")
if [ $? -eq 0 ]; then
  echo "✅ 백엔드 서버 응답: $HEALTH"
else
  echo "❌ 백엔드 서버 연결 실패"
fi
echo ""

echo "2️⃣ 뉴스 수집 테스트"
echo "-------------------"
COLLECT=$(curl -s -X POST "${BACKEND_URL}/api/collect")
if [ $? -eq 0 ]; then
  echo "✅ 수집 결과: $COLLECT"
else
  echo "❌ 수집 실패"
fi
echo ""

echo "3️⃣ 뉴스 목록 확인 (최대 3개)"
echo "-------------------"
ARTICLES=$(curl -s "${BACKEND_URL}/api/articles")
if [ $? -eq 0 ]; then
  COUNT=$(echo "$ARTICLES" | grep -o '"title"' | wc -l)
  echo "✅ 뉴스 개수: $COUNT"
  echo "$ARTICLES" | head -c 500
  echo "..."
else
  echo "❌ 뉴스 목록 조회 실패"
fi
echo ""

echo "4️⃣ 프론트엔드 확인"
echo "-------------------"
echo "브라우저에서 다음 URL 접속:"
echo "  https://news.funnyfunny.cloud/frontend/"
echo ""
echo "브라우저 콘솔(F12)에서 확인:"
echo "  - API URL 로그"
echo "  - 에러 메시지"
echo "  - Network 탭에서 /api/articles 요청 상태"
echo ""

echo "================================"
echo "점검 완료!"

