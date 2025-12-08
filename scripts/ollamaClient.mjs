/**
 * Ollama LLM 클라이언트
 * GitHub Actions 러너에서 로컬 Ollama 서버와 통신
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

/**
 * Ollama LLM을 사용하여 텍스트 생성
 * @param {Object} options
 * @param {string} options.model - 사용할 모델 (기본값: 'phi3:mini')
 * @param {string} options.prompt - 프롬프트
 * @param {boolean} options.stream - 스트리밍 여부 (기본값: false)
 * @returns {Promise<string>} 생성된 텍스트
 */
export async function generateText({ model = 'phi3:mini', prompt, stream = false }) {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Ollama generation error:', error.message);
    throw error;
  }
}

/**
 * 뉴스 기사를 요약하는 프롬프트 생성
 * @param {string} title - 기사 제목
 * @param {string} content - 기사 내용
 * @param {string} language - 언어 ('ko' 또는 'en')
 * @returns {string} 프롬프트
 */
export function createSummaryPrompt(title, content, language = 'ko') {
  const contentPreview = content.substring(0, 2000); // 너무 긴 내용은 자름

  if (language === 'ko') {
    return `다음은 IT/기술 관련 뉴스 기사 내용이다.

이 기사를 기반으로 다음 JSON 형식으로만 출력해라:

{
  "summary": "기사의 핵심 내용을 2~3문장으로 요약 (한국어)",
  "points": ["핵심 포인트 3개를 bullet 형식으로 한국어로 작성", "...", "..."],
  "insight": "이 뉴스가 IT/기술 업계에 가지는 의미나 인사이트를 1~2문장으로 한국어로 작성"
}

기사 제목: ${title}

기사 내용:
---
${contentPreview}
---

JSON만 출력하고 다른 설명은 하지 마라.`;
  } else {
    return `The following is an IT/technology news article.

Based on this article, output only in the following JSON format:

{
  "summary": "Summarize the core content in 2-3 sentences (English)",
  "points": ["3 key points as bullets in English", "...", "..."],
  "insight": "The meaning or insight this news has for the IT/technology industry in 1-2 sentences (English)"
}

Article Title: ${title}

Article Content:
---
${contentPreview}
---

Output only JSON, no other explanations.`;
  }
}

/**
 * LLM 응답에서 JSON 추출 시도
 * @param {string} text - LLM 응답 텍스트
 * @returns {Object|null} 파싱된 JSON 또는 null
 */
export function extractJSON(text) {
  try {
    // JSON 코드 블록 제거
    let cleaned = text.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    cleaned = cleaned.trim();
    
    // JSON 객체 찾기
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // 전체 텍스트가 JSON인 경우
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('JSON extraction failed:', error.message);
    return null;
  }
}

/**
 * 뉴스 기사 요약 생성
 * @param {Object} article - 기사 객체
 * @param {string} model - 사용할 모델
 * @returns {Promise<Object>} 요약 결과 {summary, points, insight}
 */
export async function generateArticleSummary(article, model = 'phi3:mini') {
  const { title, description, language = 'ko' } = article;
  const content = description || title || '';

  try {
    const prompt = createSummaryPrompt(title, content, language);
    const response = await generateText({ model, prompt });
    const parsed = extractJSON(response);

    if (parsed && parsed.summary) {
      return {
        summary: parsed.summary || '',
        points: Array.isArray(parsed.points) ? parsed.points.slice(0, 3) : [],
        insight: parsed.insight || '',
      };
    }

    // JSON 파싱 실패 시 fallback
    throw new Error('Failed to parse JSON from LLM response');
  } catch (error) {
    console.warn(`Failed to generate summary for "${title}":`, error.message);
    
    // Fallback: 간단한 요약 생성
    return generateFallbackSummary(title, content, language);
  }
}

/**
 * Fallback 요약 생성 (LLM 실패 시)
 * @param {string} title - 기사 제목
 * @param {string} content - 기사 내용
 * @param {string} language - 언어
 * @returns {Object} 기본 요약
 */
function generateFallbackSummary(title, content, language) {
  const sentences = content.split(/[.!?。！？]\s*/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');
  
  const points = [];
  for (let i = 0; i < 3 && i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 20 && sentence.length < 150) {
      points.push(sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''));
    }
  }
  
  while (points.length < 3) {
    points.push(
      language === 'ko'
        ? 'IT 업계의 중요한 변화와 트렌드'
        : 'Important changes and trends in the IT industry'
    );
  }

  const insight =
    language === 'ko'
      ? '이 뉴스는 IT 업계의 최신 동향을 보여주며, 기술 발전과 시장 변화에 대한 중요한 정보를 제공합니다.'
      : 'This news shows the latest trends in the IT industry and provides important information about technological developments and market changes.';

  return {
    summary: summary || title,
    points: points.slice(0, 3),
    insight: insight,
  };
}

