/**
 * 뉴스 수집 및 Ollama LLM을 사용한 요약 생성 스크립트
 * GitHub Actions에서 실행되어 정적 JSON 파일 생성
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { generateArticleSummary } from './ollamaClient.mjs';
import https from 'https';
import http from 'http';

// RSS 파서 (간단한 구현)
class SimpleRSSParser {
  async parseString(xmlText) {
    const items = [];
    const titleMatch = xmlText.match(/<title>(.*?)<\/title>/i);
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi);
    
    for (const match of itemMatches) {
      const itemXml = match[1];
      const title = this.extractTag(itemXml, 'title');
      const link = this.extractTag(itemXml, 'link');
      const pubDate = this.extractTag(itemXml, 'pubDate');
      const description = this.extractTag(itemXml, 'description') || this.extractTag(itemXml, 'content:encoded');
      
      if (title && link) {
        items.push({
          title: this.cleanText(title),
          link: this.cleanText(link),
          pubDate: pubDate || new Date().toISOString(),
          description: this.cleanText(description || ''),
        });
      }
    }
    
    return { items };
  }
  
  extractTag(xml, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }
  
  cleanText(text) {
    if (!text) return '';
    // HTML 태그 제거
    text = text.replace(/<[^>]*>/g, '');
    // HTML 엔티티 디코딩 (간단한 버전)
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    // 공백 정리
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }
}

const parser = new SimpleRSSParser();

/**
 * RSS 피드를 가져와서 UTF-8로 변환
 */
async function fetchRSSWithEncoding(url, language = 'en') {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      const chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        let text;
        
        try {
          // UTF-8로 시도
          text = buffer.toString('utf-8');
          
          // 한국어 피드의 경우 인코딩 문제가 있을 수 있음
          if (language === 'ko' && !/[가-힣]/.test(text)) {
            // EUC-KR 시도
            try {
              const iconv = await import('iconv-lite');
              text = iconv.default.decode(buffer, 'euc-kr');
            } catch (e) {
              // UTF-8 유지
            }
          }
        } catch (error) {
          text = buffer.toString('utf-8');
        }
        
        resolve(text);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// 주요 IT 뉴스 사이트 RSS 피드 목록
const RSS_FEEDS = [
  // 한국어 뉴스 소스
  {
    name: 'ZDNet Korea',
    url: 'https://www.zdnet.co.kr/rss/all.xml',
    source: 'ZDNet Korea',
    language: 'ko'
  },
  {
    name: '전자신문 IT',
    url: 'https://www.etnews.com/RSS/Section060101.xml',
    source: '전자신문',
    language: 'ko'
  },
  {
    name: '보안뉴스',
    url: 'https://www.boannews.com/media/news_rss.xml',
    source: '보안뉴스',
    language: 'ko'
  },
  {
    name: 'IT조선',
    url: 'https://it.chosun.com/rss/all.xml',
    source: 'IT조선',
    language: 'ko'
  },
  {
    name: '블로터',
    url: 'https://www.bloter.net/rss/all.xml',
    source: '블로터',
    language: 'ko'
  },
  // 영어 뉴스 소스
  {
    name: '테크크런치',
    url: 'https://techcrunch.com/feed/',
    source: 'TechCrunch',
    language: 'en'
  },
  {
    name: '더버지',
    url: 'https://www.theverge.com/rss/index.xml',
    source: 'The Verge',
    language: 'en'
  },
  {
    name: '아르스 테크니카',
    url: 'https://arstechnica.com/feed/',
    source: 'Ars Technica',
    language: 'en'
  }
];

/**
 * RSS 피드에서 뉴스 수집
 */
async function collectNews() {
  const allArticles = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Collecting from ${feed.name} (${feed.url})...`);
      
      let feedData;
      if (feed.language === 'ko') {
        const rssText = await fetchRSSWithEncoding(feed.url, feed.language);
        feedData = await parser.parseString(rssText);
      } else {
        const rssText = await fetchRSSWithEncoding(feed.url, feed.language);
        feedData = await parser.parseString(rssText);
      }
      
      if (!feedData.items || feedData.items.length === 0) {
        console.warn(`  ⚠ No items found in ${feed.name}`);
        continue;
      }
      
      feedData.items.forEach(item => {
        allArticles.push({
          title: item.title || 'No title',
          link: item.link || '#',
          source: feed.source,
          publishedAt: item.pubDate || new Date().toISOString(),
          description: item.description || '',
          language: feed.language || 'en'
        });
      });
      
      console.log(`  ✓ Collected ${feedData.items.length} articles from ${feed.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to collect from ${feed.name}:`, error.message);
    }
  }

  // 중복 제거 (URL 기준)
  const uniqueArticles = [];
  const seenUrls = new Set();
  
  for (const article of allArticles) {
    if (!seenUrls.has(article.link)) {
      seenUrls.add(article.link);
      uniqueArticles.push(article);
    }
  }

  // 날짜순 정렬 (최신순)
  uniqueArticles.sort((a, b) => {
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  console.log(`Total unique articles collected: ${uniqueArticles.length}`);
  return uniqueArticles.slice(0, 50); // 최대 50개만 처리
}

/**
 * 기존 요약 JSON 로드
 */
async function loadExistingSummaries() {
  const filePath = 'public/news-summaries.json';
  
  if (!existsSync(filePath)) {
    return { articles: [] };
  }
  
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load existing summaries:', error.message);
    return { articles: [] };
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 Starting news summary generation...\n');
  
  // public 디렉토리 생성
  if (!existsSync('public')) {
    await mkdir('public', { recursive: true });
  }
  
  // 기존 요약 로드
  const existing = await loadExistingSummaries();
  const existingLinks = new Set(existing.articles.map(a => a.link));
  
  console.log(`Found ${existing.articles.length} existing summaries\n`);
  
  // 뉴스 수집
  console.log('📰 Collecting news articles...\n');
  const articles = await collectNews();
  
  // 새 기사만 필터링
  const newArticles = articles.filter(a => !existingLinks.has(a.link));
  console.log(`\n📝 Found ${newArticles.length} new articles to summarize\n`);
  
  // 각 기사에 대해 요약 생성
  const summarizedArticles = [...existing.articles];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < newArticles.length; i++) {
    const article = newArticles[i];
    console.log(`[${i + 1}/${newArticles.length}] Summarizing: ${article.title.substring(0, 50)}...`);
    
    try {
      const summary = await generateArticleSummary(article, 'phi3:mini');
      
      summarizedArticles.push({
        ...article,
        summary: summary.summary,
        points: summary.points,
        insight: summary.insight,
      });
      
      successCount++;
      console.log(`  ✓ Success\n`);
      
      // Ollama 부하 방지를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}\n`);
      
      // 실패한 경우 fallback 요약 사용
      const fallbackSummary = article.description.substring(0, 200) || article.title;
      summarizedArticles.push({
        ...article,
        summary: fallbackSummary,
        points: [],
        insight: '',
      });
      
      failCount++;
    }
  }
  
  // 날짜순 정렬
  summarizedArticles.sort((a, b) => {
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });
  
  // 최신 50개만 유지
  const finalArticles = summarizedArticles.slice(0, 50);
  
  // JSON 파일 저장
  const output = {
    generatedAt: new Date().toISOString(),
    articles: finalArticles,
  };
  
  await writeFile(
    'public/news-summaries.json',
    JSON.stringify(output, null, 2),
    'utf8'
  );
  
  console.log('\n✅ Summary generation complete!');
  console.log(`   - Success: ${successCount}`);
  console.log(`   - Failed: ${failCount}`);
  console.log(`   - Total articles: ${finalArticles.length}`);
  console.log(`   - Saved to: public/news-summaries.json\n`);
}

// 실행
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
