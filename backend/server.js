const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 간단한 메모리 저장소 (실제로는 DB 사용 권장)
let articles = [];

// RSS 수집 모듈
const collectNews = require('./scripts/collect-news');

// API 엔드포인트
app.get('/api/articles', async (req, res) => {
  try {
    // 최신 기사 반환 (최대 50개)
    const sortedArticles = articles
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 50);
    
    res.json(sortedArticles);
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
    res.json({ 
      message: 'News collected successfully', 
      count: collected.length 
    });
  } catch (error) {
    console.error('Error collecting news:', error);
    res.status(500).json({ error: 'Failed to collect news' });
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

// 크론 작업 설정 (매 시간마다 뉴스 수집)
const cron = require('node-cron');
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled news collection...');
  try {
    const collected = await collectNews();
    articles = collected;
    console.log(`Scheduled collection completed: ${collected.length} articles`);
  } catch (error) {
    console.error('Scheduled collection failed:', error);
  }
});

