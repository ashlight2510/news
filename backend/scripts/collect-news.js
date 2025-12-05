const Parser = require('rss-parser');
const parser = new Parser();

// 주요 IT 뉴스 사이트 RSS 피드 목록
const RSS_FEEDS = [
  {
    name: '테크크런치',
    url: 'https://techcrunch.com/feed/',
    source: 'TechCrunch'
  },
  {
    name: '더버지',
    url: 'https://www.theverge.com/rss/index.xml',
    source: 'The Verge'
  },
  {
    name: '아르스 테크니카',
    url: 'https://arstechnica.com/feed/',
    source: 'Ars Technica'
  },
  {
    name: '한국 IT 뉴스 (예시)',
    url: 'https://www.zdnet.co.kr/view/?no=20231201000001', // 실제 RSS URL로 교체 필요
    source: 'ZDNet Korea'
  }
  // 더 많은 RSS 피드 추가 가능
];

/**
 * RSS 피드에서 뉴스 수집
 */
async function collectNews() {
  const allArticles = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Collecting from ${feed.name}...`);
      const feedData = await parser.parseURL(feed.url);
      
      feedData.items.forEach(item => {
        allArticles.push({
          title: item.title || 'No title',
          url: item.link || '#',
          source: feed.source,
          published_at: item.pubDate || new Date().toISOString(),
          summary: item.contentSnippet || item.content || '',
          description: item.content || item.contentSnippet || ''
        });
      });
      
      console.log(`  ✓ Collected ${feedData.items.length} articles from ${feed.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to collect from ${feed.name}:`, error.message);
      // 에러가 있어도 다른 피드는 계속 수집
    }
  }

  // 중복 제거 (URL 기준)
  const uniqueArticles = [];
  const seenUrls = new Set();
  
  for (const article of allArticles) {
    if (!seenUrls.has(article.url)) {
      seenUrls.add(article.url);
      uniqueArticles.push(article);
    }
  }

  // 날짜순 정렬 (최신순)
  uniqueArticles.sort((a, b) => {
    return new Date(b.published_at) - new Date(a.published_at);
  });

  console.log(`Total unique articles collected: ${uniqueArticles.length}`);
  return uniqueArticles;
}

// 직접 실행 시
if (require.main === module) {
  collectNews()
    .then(articles => {
      console.log(`\n✅ Collection complete: ${articles.length} articles`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Collection failed:', error);
      process.exit(1);
    });
}

module.exports = collectNews;

