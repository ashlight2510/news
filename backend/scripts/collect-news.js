const Parser = require('rss-parser');
const he = require('he'); // HTML 엔티티 디코딩 라이브러리
const iconv = require('iconv-lite'); // 인코딩 변환 라이브러리
const https = require('https');
const http = require('http');

// 인코딩 옵션을 포함한 파서 설정
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
});

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
      
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Content-Type에서 인코딩 확인
        const contentType = res.headers['content-type'] || '';
        let encoding = 'utf-8';
        
        // Content-Type에서 charset 추출
        const charsetMatch = contentType.match(/charset=([^;]+)/i);
        if (charsetMatch) {
          encoding = charsetMatch[1].toLowerCase().trim();
        }
        
        // XML 선언에서 인코딩 확인
        const xmlHeader = buffer.toString('utf-8', 0, Math.min(200, buffer.length));
        const xmlEncodingMatch = xmlHeader.match(/encoding\s*=\s*["']([^"']+)["']/i);
        if (xmlEncodingMatch) {
          encoding = xmlEncodingMatch[1].toLowerCase().trim();
        }
        
        // 한국어 RSS 피드는 보통 EUC-KR 또는 CP949 사용
        if (language === 'ko' && (encoding === 'utf-8' || encoding === 'utf8' || !encoding)) {
          // EUC-KR로 시도
          try {
            const eucKrText = iconv.decode(buffer, 'euc-kr');
            // 한글이 제대로 디코딩되었는지 확인
            if (/[가-힣]/.test(eucKrText)) {
              encoding = 'euc-kr';
            }
          } catch (e) {
            // EUC-KR 실패 시 CP949 시도
            try {
              const cp949Text = iconv.decode(buffer, 'cp949');
              if (/[가-힣]/.test(cp949Text)) {
                encoding = 'cp949';
              }
            } catch (e2) {
              // 모두 실패 시 UTF-8 유지
            }
          }
        }
        
        let text;
        try {
          if (encoding === 'utf-8' || encoding === 'utf8') {
            text = buffer.toString('utf-8');
          } else {
            text = iconv.decode(buffer, encoding);
          }
        } catch (error) {
          // 인코딩 변환 실패 시 UTF-8로 시도
          console.warn(`Failed to decode as ${encoding}, trying UTF-8:`, error.message);
          text = buffer.toString('utf-8');
        }
        
        resolve(text);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * 텍스트 정리 함수 (HTML 엔티티 디코딩 및 인코딩 변환)
 */
function cleanText(text) {
  if (!text) return '';
  
  try {
    // HTML 엔티티 디코딩 (he 라이브러리 사용)
    let cleaned = he.decode(text, { strict: true });
    
    // HTML 태그 제거
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // 공백 정리
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  } catch (error) {
    console.warn('Text cleaning error:', error.message);
    // 에러 발생 시 원본 텍스트 반환 (최소한의 처리)
    return text.replace(/<[^>]*>/g, '').trim();
  }
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
  // 더 많은 RSS 피드 추가 가능
];

/**
 * RSS 피드에서 뉴스 수집
 */
async function collectNews() {
  const allArticles = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Collecting from ${feed.name} (${feed.url})...`);
      
      // 한국어 피드는 인코딩 변환 후 파싱
      let feedData;
      if (feed.language === 'ko') {
        const rssText = await fetchRSSWithEncoding(feed.url, feed.language);
        feedData = await parser.parseString(rssText);
      } else {
        // 영어 피드는 기존 방식 사용
        feedData = await parser.parseURL(feed.url);
      }
      
      if (!feedData.items || feedData.items.length === 0) {
        console.warn(`  ⚠ No items found in ${feed.name}`);
        continue;
      }
      
      feedData.items.forEach(item => {
        // 텍스트 정리 및 인코딩 처리
        const title = cleanText(item.title || 'No title');
        const summary = cleanText(item.contentSnippet || item.content || item.description || '');
        const description = cleanText(item.content || item.contentSnippet || item.description || '');
        
        allArticles.push({
          title: title,
          url: item.link || '#',
          source: feed.source,
          published_at: item.pubDate || new Date().toISOString(),
          summary: summary,
          description: description,
          language: feed.language || 'en' // 언어 정보 추가
        });
      });
      
      console.log(`  ✓ Collected ${feedData.items.length} articles from ${feed.name} (${feed.language || 'en'})`);
    } catch (error) {
      console.error(`  ✗ Failed to collect from ${feed.name}:`, error.message);
      console.error(`    URL: ${feed.url}`);
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

  // 언어별 통계
  const langStats = {};
  uniqueArticles.forEach(article => {
    const lang = article.language || 'en';
    langStats[lang] = (langStats[lang] || 0) + 1;
  });
  
  console.log(`Total unique articles collected: ${uniqueArticles.length}`);
  console.log(`Language breakdown:`, langStats);
  
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

