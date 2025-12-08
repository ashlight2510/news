/**
 * [DEPRECATED] OpenAI API를 사용한 뉴스 요약 생성 모듈
 * 
 * ⚠️ 이 모듈은 더 이상 사용되지 않습니다.
 * 현재는 GitHub Actions + Ollama 기반의 완전 무료 요약 시스템으로 전환되었습니다.
 * 요약 데이터는 `public/news-summaries.json` 파일에서 정적으로 제공됩니다.
 * 
 * 환경 변수:
 * - OPENAI_API_KEY: OpenAI API 키
 * 
 * 사용법:
 * const { generateSummary } = require('./lib/gptSummary');
 * const summary = await generateSummary(title, description, language);
 */

const https = require('https');

// 요약 생성 (OpenAI API 사용)
async function generateSummary(title, description, language = 'ko') {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // API 키가 없으면 기본 요약 반환
  if (!apiKey) {
    console.warn('⚠️  OPENAI_API_KEY not set, using fallback summary');
    return generateFallbackSummary(title, description, language);
  }

  // 설명이 너무 짧으면 기본 요약 반환
  if (!description || description.length < 50) {
    return generateFallbackSummary(title, description, language);
  }

  try {
    const prompt = language === 'ko' 
      ? `다음 IT 뉴스 기사를 읽고 요약해주세요.

제목: ${title}

내용: ${description.substring(0, 2000)}

다음 JSON 형식으로 응답해주세요:
{
  "summary": "기사 내용을 2-3줄로 요약한 텍스트",
  "points": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "insight": "이 뉴스가 IT 업계에 미치는 영향이나 의미를 1-2줄로 설명"
}

요약은 중립적이고 객관적으로 작성하고, 포인트는 간결하게 3개만 제시하며, 인사이트는 실용적인 관점에서 작성해주세요.`
      : `Please summarize the following IT news article.

Title: ${title}

Content: ${description.substring(0, 2000)}

Respond in the following JSON format:
{
  "summary": "2-3 line summary of the article",
  "points": ["Key point 1", "Key point 2", "Key point 3"],
  "insight": "1-2 line explanation of the impact or significance of this news for the IT industry"
}

Write the summary objectively and neutrally, provide exactly 3 concise points, and write the insight from a practical perspective.`;

    const response = await callOpenAI(prompt, apiKey);
    
    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || generateFallbackSummary(title, description, language).summary,
        points: Array.isArray(parsed.points) && parsed.points.length > 0 
          ? parsed.points.slice(0, 3) 
          : generateFallbackSummary(title, description, language).points,
        insight: parsed.insight || generateFallbackSummary(title, description, language).insight
      };
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트에서 추출 시도
      console.warn('Failed to parse OpenAI response as JSON, using fallback');
      return generateFallbackSummary(title, description, language);
    }
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return generateFallbackSummary(title, description, language);
  }
}

// OpenAI API 호출
function callOpenAI(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes IT news articles in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(responseData);
            resolve(json.choices[0].message.content);
          } catch (error) {
            reject(new Error('Failed to parse OpenAI response'));
          }
        } else {
          reject(new Error(`OpenAI API error: ${res.statusCode} - ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// API 키가 없을 때 사용하는 기본 요약 생성
function generateFallbackSummary(title, description, language) {
  const text = description || title;
  const sentences = text.split(/[.!?。！？]\s*/).filter(s => s.trim().length > 10);
  
  const summary = language === 'ko'
    ? sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '')
    : sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');
  
  // 핵심 포인트 추출 (간단한 키워드 기반)
  const points = [];
  const keywords = language === 'ko' 
    ? ['기술', '서비스', '플랫폼', '시스템', '개발', '보안', '클라우드', 'AI', '데이터']
    : ['technology', 'service', 'platform', 'system', 'development', 'security', 'cloud', 'AI', 'data'];
  
  for (let i = 0; i < 3 && i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 20 && sentence.length < 150) {
      points.push(sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''));
    }
  }
  
  // 포인트가 부족하면 생성
  while (points.length < 3) {
    points.push(language === 'ko' 
      ? 'IT 업계의 중요한 변화와 트렌드를 반영하는 뉴스입니다.'
      : 'This news reflects important changes and trends in the IT industry.');
  }

  const insight = language === 'ko'
    ? '이 뉴스는 IT 업계의 최신 동향을 보여주며, 기술 발전과 시장 변화에 대한 중요한 정보를 제공합니다.'
    : 'This news shows the latest trends in the IT industry and provides important information about technological developments and market changes.';

  return {
    summary: summary || title,
    points: points.slice(0, 3),
    insight: insight
  };
}

// 오늘의 기술 인사이트 생성
async function generateTodayInsight(articles, language = 'ko') {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return generateFallbackInsight(articles, language);
  }

  try {
    // 최신 기사 10개 제목 추출
    const recentTitles = articles
      .slice(0, 10)
      .map(a => `- ${a.title}`)
      .join('\n');

    const prompt = language === 'ko'
      ? `오늘의 주요 IT 뉴스 제목들:

${recentTitles}

위 뉴스들을 종합하여 다음 JSON 형식으로 응답해주세요:
{
  "insight": "오늘의 기술 트렌드를 3줄로 요약한 인사이트",
  "trends": ["트렌드 키워드 1", "트렌드 키워드 2", "트렌드 키워드 3", "트렌드 키워드 4"],
  "column": "오늘의 뉴스를 바탕으로 한 2-3줄 칼럼 (사이트의 자체 의견)"
}

인사이트는 실용적이고 명확하게, 트렌드는 최대 4개까지, 칼럼은 독자에게 도움이 되는 관점으로 작성해주세요.`
      : `Today's major IT news headlines:

${recentTitles}

Based on the above news, respond in the following JSON format:
{
  "insight": "3-line insight summarizing today's technology trends",
  "trends": ["Trend keyword 1", "Trend keyword 2", "Trend keyword 3", "Trend keyword 4"],
  "column": "2-3 line column based on today's news (the site's own opinion)"
}

Write the insight practically and clearly, provide up to 4 trends, and write the column from a perspective helpful to readers.`;

    const response = await callOpenAI(prompt, apiKey);
    
    try {
      const parsed = JSON.parse(response);
      return {
        insight: parsed.insight || generateFallbackInsight(articles, language).insight,
        trends: Array.isArray(parsed.trends) && parsed.trends.length > 0
          ? parsed.trends.slice(0, 4)
          : generateFallbackInsight(articles, language).trends,
        column: parsed.column || generateFallbackInsight(articles, language).column
      };
    } catch (parseError) {
      console.warn('Failed to parse insight response, using fallback');
      return generateFallbackInsight(articles, language);
    }
  } catch (error) {
    console.error('Failed to generate insight:', error.message);
    return generateFallbackInsight(articles, language);
  }
}

// 기본 인사이트 생성
function generateFallbackInsight(articles, language) {
  const trends = language === 'ko'
    ? ['AI', '클라우드', '보안', '스타트업']
    : ['AI', 'Cloud', 'Security', 'Startups'];
  
  const insight = language === 'ko'
    ? '오늘의 IT 뉴스는 AI 기술의 발전과 클라우드 서비스 확산, 그리고 보안 이슈에 대한 관심이 높아지고 있음을 보여줍니다. 특히 스타트업 생태계의 활발한 움직임이 눈에 띕니다.'
    : "Today's IT news shows growing interest in AI technology development, cloud service expansion, and security issues. Particularly notable is the active movement in the startup ecosystem.";
  
  const column = language === 'ko'
    ? '기술의 빠른 변화 속에서 최신 트렌드를 파악하는 것이 중요합니다. 오늘의 뉴스는 IT 업계의 지속적인 혁신과 성장을 보여주며, 개발자와 기업들에게 새로운 기회를 제시하고 있습니다.'
    : 'It is important to understand the latest trends in the rapidly changing technology landscape. Today\'s news shows continuous innovation and growth in the IT industry, presenting new opportunities for developers and companies.';

  return {
    insight,
    trends,
    column
  };
}

module.exports = {
  generateSummary,
  generateTodayInsight
};

