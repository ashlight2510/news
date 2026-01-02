const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
// CORS 설정 - 모든 origin 허용 (프로덕션에서는 특정 도메인만 허용 권장)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 간단한 메모리 저장소 (실제로는 DB 사용 권장)
let articles = [];
let todayInsight = null;
let insightLastUpdated = null;

// RSS 수집 모듈
const collectNews = require('./scripts/collect-news');

// 요약 생성 모듈
const { generateSummary, generateTodayInsight } = require('./lib/gptSummary');
const { getCachedSummary, setCachedSummary, cleanOldCache } = require('./lib/summaryCache');

// 기사에 요약 추가하는 함수
async function enrichArticleWithSummary(article) {
  // 캐시 확인
  const cached = getCachedSummary(article.url);
  if (cached) {
    return {
      ...article,
      aiSummary: cached.summary,
      aiPoints: cached.points,
      aiInsight: cached.insight
    };
  }

  // 요약 생성
  try {
    const summaryData = await generateSummary(
      article.title,
      article.description || article.summary,
      article.language || 'ko'
    );

    // 캐시 저장
    setCachedSummary(article.url, summaryData);

    return {
      ...article,
      aiSummary: summaryData.summary,
      aiPoints: summaryData.points,
      aiInsight: summaryData.insight
    };
  } catch (error) {
    console.error(`Failed to generate summary for ${article.url}:`, error.message);
    // 요약 실패 시 원본 기사 반환
    return article;
  }
}

// API 엔드포인트
app.get('/api/articles', async (req, res) => {
  try {
    // 최신 기사 반환 (최대 50개)
    const sortedArticles = articles
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 50);
    
    // 요약이 포함된 기사 반환 (비동기 처리로 성능 최적화)
    // 처음 10개만 요약 생성하고, 나머지는 캐시에서 가져오거나 기본값 사용
    const articlesWithSummary = await Promise.all(
      sortedArticles.slice(0, 10).map(article => enrichArticleWithSummary(article))
    );
    
    // 나머지 기사는 캐시에서만 확인
    const remainingArticles = sortedArticles.slice(10).map(article => {
      const cached = getCachedSummary(article.url);
      if (cached) {
        return {
          ...article,
          aiSummary: cached.summary,
          aiPoints: cached.points,
          aiInsight: cached.insight
        };
      }
      return article;
    });
    
    const allArticles = [...articlesWithSummary, ...remainingArticles];
    
    // UTF-8 인코딩 명시
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(allArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 뉴스 수집 엔드포인트 (수동 트리거용)
app.post('/api/collect', async (req, res) => {
  try {
    const collected = await collectNews();
    articles = collected;
    
    // 오래된 캐시 정리
    cleanOldCache();
    
    res.json({ 
      message: 'News collected successfully', 
      count: collected.length 
    });
  } catch (error) {
    console.error('Error collecting news:', error);
    res.status(500).json({ error: 'Failed to collect news' });
  }
});

// 오늘의 기술 인사이트 엔드포인트
app.get('/api/insight', async (req, res) => {
  try {
    const language = req.query.lang || 'ko';
    const now = new Date();
    
    // 인사이트가 없거나 6시간 이상 지났으면 새로 생성
    if (!todayInsight || !insightLastUpdated || 
        (now - new Date(insightLastUpdated)) / (1000 * 60 * 60) >= 6) {
      console.log('Generating new today insight...');
      todayInsight = await generateTodayInsight(articles, language);
      insightLastUpdated = now.toISOString();
    }
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(todayInsight);
  } catch (error) {
    console.error('Error generating insight:', error);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // 서버 시작 시 뉴스 수집
  collectNews().then(collected => {
    articles = collected;
    console.log(`Initial news collection completed: ${collected.length} articles`);
  }).catch(err => {
    console.error('Initial collection failed:', err);
  });
});

// 크론 작업 설정 (6시간마다 뉴스 수집)
const cron = require('node-cron');
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled news collection...');
  try {
    const collected = await collectNews();
    articles = collected;
    
    // 오래된 캐시 정리
    cleanOldCache();
    
    // 인사이트 초기화 (새 뉴스로 재생성)
    todayInsight = null;
    insightLastUpdated = null;
    
    console.log(`Scheduled collection completed: ${collected.length} articles`);
  } catch (error) {
    console.error('Scheduled collection failed:', error);
  }
});

// 매일 자정에 인사이트 재생성
cron.schedule('0 0 * * *', async () => {
  console.log('Resetting today insight...');
  todayInsight = null;
  insightLastUpdated = null;
});
