/**
 * 뉴스 수집 및 Ollama LLM을 사용한 요약 생성 스크립트
 * GitHub Actions에서 실행되어 정적 JSON 파일 생성
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { generateArticleSummary } from "./ollamaClient.mjs";
import https from "https";
import http from "http";

// RSS 파서 (개선된 구현)
class SimpleRSSParser {
  async parseString(xmlText) {
    const items = [];
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi);

    for (const match of itemMatches) {
      const itemXml = match[1];

      // 타이틀 추출 (여러 형식 시도)
      let title =
        this.extractTag(itemXml, "title") ||
        this.extractTag(itemXml, "dc:title") ||
        this.extractTag(itemXml, "media:title");

      const link =
        this.extractTag(itemXml, "link") || this.extractTag(itemXml, "guid");
      const pubDate =
        this.extractTag(itemXml, "pubDate") ||
        this.extractTag(itemXml, "dc:date") ||
        this.extractTag(itemXml, "published");
      const description =
        this.extractTag(itemXml, "description") ||
        this.extractTag(itemXml, "content:encoded") ||
        this.extractTag(itemXml, "content");

      // 타이틀이 비어있거나 공백만 있을 때 description에서 추출 시도
      const cleanedTitle = this.cleanText(title || "");
      if (
        !cleanedTitle ||
        cleanedTitle === "No title" ||
        cleanedTitle.trim().length === 0
      ) {
        const cleanedDesc = this.cleanText(description || "");
        // description의 첫 100자에서 의미있는 텍스트 추출
        if (cleanedDesc && cleanedDesc.length > 10) {
          title = cleanedDesc.substring(0, 100).replace(/\s+/g, " ").trim();
        } else if (link) {
          // link에서 파일명이나 경로에서 추출 시도
          const urlParts = link.split("/").filter((p) => p.length > 0);
          if (urlParts.length > 0) {
            const lastPart = urlParts[urlParts.length - 1];
            title = decodeURIComponent(lastPart)
              .replace(/[-_]/g, " ")
              .substring(0, 80);
          }
        }
      }

      // 최종 타이틀 정리
      const finalTitle = this.cleanText(title || "");

      // link가 있어야만 추가 (타이틀은 최소한의 fallback 사용)
      if (link) {
        items.push({
          title: finalTitle || "제목 없음",
          link: this.cleanText(link),
          pubDate: pubDate || new Date().toISOString(),
          description: this.cleanText(description || ""),
        });
      }
    }

    return { items };
  }

  extractTag(xml, tagName) {
    // CDATA 처리 포함한 정규식
    const patterns = [
      // 일반 태그: <title>content</title>
      new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"),
      // CDATA 태그: <title><![CDATA[content]]></title>
      new RegExp(
        `<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`,
        "i"
      ),
    ];

    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  cleanText(text) {
    if (!text) return "";

    // CDATA 제거 (혹시 남아있을 경우)
    text = text.replace(/<!\[CDATA\[(.*?)\]\]>/gi, "$1");

    // HTML 태그 제거
    text = text.replace(/<[^>]*>/g, "");

    // HTML 엔티티 디코딩 (개선된 버전)
    // 숫자 엔티티 처리 (&#8217; 등)
    text = text.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });

    // 16진수 엔티티 처리 (&#x27; 등)
    text = text.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    // 일반 HTML 엔티티
    const entityMap = {
      "&lt;": "<",
      "&gt;": ">",
      "&amp;": "&",
      "&quot;": '"',
      "&apos;": "'",
      "&#39;": "'",
      "&nbsp;": " ",
      "&copy;": "©",
      "&reg;": "®",
      "&trade;": "™",
      "&hellip;": "...",
      "&mdash;": "—",
      "&ndash;": "–",
    };

    for (const [entity, char] of Object.entries(entityMap)) {
      text = text.replace(new RegExp(entity, "g"), char);
    }

    // 공백 정리
    text = text.replace(/\s+/g, " ").trim();

    return text;
  }
}

const parser = new SimpleRSSParser();

/**
 * RSS 피드를 가져와서 UTF-8로 변환
 */
function extractCharsetFromContentType(contentType = "") {
  const match = contentType.match(/charset=([^;]+)/i);
  return match ? match[1].trim().toLowerCase() : null;
}

function extractCharsetFromXml(buffer) {
  const head = buffer.toString("ascii");
  const match = head.match(/encoding=["']([^"']+)["']/i);
  return match ? match[1].trim().toLowerCase() : null;
}

function countHangul(text) {
  const matches = text.match(/[가-힣]/g);
  return matches ? matches.length : 0;
}

function countReplacement(text) {
  const matches = text.match(/\uFFFD/g);
  return matches ? matches.length : 0;
}

async function loadIconvLite() {
  try {
    const imported = await import("iconv-lite");
    return imported.default || imported;
  } catch (error) {
    try {
      const imported = await import(
        new URL("../backend/node_modules/iconv-lite/lib/index.js", import.meta.url)
      );
      return imported.default || imported;
    } catch (fallbackError) {
      return null;
    }
  }
}

async function decodeWithCandidates(buffer, candidates) {
  let iconv;
  const results = [];

  for (const encoding of candidates) {
    let decoded;
    if (encoding === "utf-8" || encoding === "utf8") {
      decoded = buffer.toString("utf-8");
    } else {
      if (!iconv) {
        iconv = await loadIconvLite();
      }
      if (!iconv) {
        continue;
      }
      decoded = iconv.decode(buffer, encoding);
    }
    results.push({
      encoding,
      text: decoded,
      hangul: countHangul(decoded),
      replacements: countReplacement(decoded),
    });
  }

  return results;
}

async function fetchRSSWithEncoding(url, language = "en") {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    client
      .get(url, (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", async () => {
          const buffer = Buffer.concat(chunks);
          const headerCharset = extractCharsetFromContentType(
            res.headers["content-type"] || ""
          );
          const xmlCharset = extractCharsetFromXml(buffer);

          let candidates = ["utf-8"];
          if (headerCharset && !candidates.includes(headerCharset)) {
            candidates.unshift(headerCharset);
          }
          if (xmlCharset && !candidates.includes(xmlCharset)) {
            candidates.unshift(xmlCharset);
          }
          if (language === "ko") {
            for (const enc of ["euc-kr", "cp949"]) {
              if (!candidates.includes(enc)) {
                candidates.push(enc);
              }
            }
          }

          try {
            const decoded = await decodeWithCandidates(buffer, candidates);
            let chosen = decoded[0];

            if (language === "ko") {
              chosen = decoded.reduce((best, current) => {
                if (current.hangul > best.hangul) return current;
                if (current.hangul === best.hangul) {
                  return current.replacements < best.replacements
                    ? current
                    : best;
                }
                return best;
              }, decoded[0]);
            }

            resolve(chosen.text);
          } catch (error) {
            resolve(buffer.toString("utf-8"));
          }
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// 주요 IT 뉴스 사이트 RSS 피드 목록
const RSS_FEEDS = [
  // 한국어 뉴스 소스
  {
    name: "ZDNet Korea",
    url: "https://www.zdnet.co.kr/rss/all.xml",
    source: "ZDNet Korea",
    language: "ko",
  },
  {
    name: "전자신문 IT",
    url: "https://www.etnews.com/RSS/Section060101.xml",
    source: "전자신문",
    language: "ko",
  },
  {
    name: "보안뉴스",
    url: "https://www.boannews.com/media/news_rss.xml",
    source: "보안뉴스",
    language: "ko",
  },
  {
    name: "IT조선",
    url: "https://it.chosun.com/rss/all.xml",
    source: "IT조선",
    language: "ko",
  },
  {
    name: "블로터",
    url: "https://www.bloter.net/rss/all.xml",
    source: "블로터",
    language: "ko",
  },
  // 영어 뉴스 소스
  {
    name: "테크크런치",
    url: "https://techcrunch.com/feed/",
    source: "TechCrunch",
    language: "en",
  },
  {
    name: "더버지",
    url: "https://www.theverge.com/rss/index.xml",
    source: "The Verge",
    language: "en",
  },
  {
    name: "아르스 테크니카",
    url: "https://arstechnica.com/feed/",
    source: "Ars Technica",
    language: "en",
  },
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
      if (feed.language === "ko") {
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

      feedData.items.forEach((item) => {
        // 타이틀 검증 및 개선
        let title = item.title || "";
        title = title.trim();

        // 타이틀이 비어있거나 "No title"인 경우 description에서 추출 시도
        if (!title || title === "No title" || title.length === 0) {
          const desc = (item.description || "").trim();
          if (desc && desc.length > 10) {
            // description의 첫 100자를 타이틀로 사용
            title = desc.substring(0, 100).replace(/\s+/g, " ").trim();
          } else if (item.link) {
            // link에서 파일명 추출 시도
            try {
              const urlParts = item.link.split("/").filter((p) => p.length > 0);
              if (urlParts.length > 0) {
                const lastPart = urlParts[urlParts.length - 1];
                title = decodeURIComponent(lastPart)
                  .replace(/[-_]/g, " ")
                  .substring(0, 80);
              }
            } catch (e) {
              // URL 디코딩 실패 시 무시
            }
          }
        }

        // 최종 타이틀 (fallback)
        const finalTitle = title || "제목 없음";

        // 타이틀이 여전히 문제가 있으면 경고
        if (finalTitle === "제목 없음" || finalTitle.length < 3) {
          console.warn(
            `  ⚠ Warning: Article with missing/invalid title from ${feed.name}: ${item.link}`
          );
        }

        allArticles.push({
          title: finalTitle,
          link: item.link || "#",
          source: feed.source,
          publishedAt: item.pubDate || new Date().toISOString(),
          description: item.description || "",
          language: feed.language || "en",
        });
      });

      console.log(
        `  ✓ Collected ${feedData.items.length} articles from ${feed.name}`
      );
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
  const filePath = "public/news-summaries.json";

  if (!existsSync(filePath)) {
    return { articles: [] };
  }

  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    const cleaned = (parsed.articles || []).filter((article) => {
      const fields = [
        article.title,
        article.description,
        article.summary,
        article.insight,
        ...(Array.isArray(article.points) ? article.points : []),
      ]
        .filter(Boolean)
        .join(" ");
      return !fields.includes("�");
    });
    return { ...parsed, articles: cleaned };
  } catch (error) {
    console.warn("Failed to load existing summaries:", error.message);
    return { articles: [] };
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log("🚀 Starting news summary generation...\n");

  // public 디렉토리 생성
  if (!existsSync("public")) {
    await mkdir("public", { recursive: true });
  }

  // 기존 요약 로드
  const existing = await loadExistingSummaries();
  const existingLinks = new Set(existing.articles.map((a) => a.link));

  console.log(`Found ${existing.articles.length} existing summaries\n`);

  // 뉴스 수집
  console.log("📰 Collecting news articles...\n");
  const articles = await collectNews();

  // 새 기사만 필터링
  const newArticles = articles.filter((a) => !existingLinks.has(a.link));
  console.log(`\n📝 Found ${newArticles.length} new articles to summarize\n`);

  // 각 기사에 대해 요약 생성
  const summarizedArticles = [...existing.articles];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < newArticles.length; i++) {
    const article = newArticles[i];
    console.log(
      `[${i + 1}/${newArticles.length}] Summarizing: ${article.title.substring(
        0,
        50
      )}...`
    );

    try {
      const summary = await generateArticleSummary(article, "phi3:mini");

      summarizedArticles.push({
        ...article,
        summary: summary.summary,
        points: summary.points,
        insight: summary.insight,
      });

      successCount++;
      console.log(`  ✓ Success\n`);

      // Ollama 부하 방지를 위한 짧은 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}\n`);

      // 실패한 경우 fallback 요약 사용
      const fallbackSummary =
        article.description.substring(0, 200) || article.title;
      summarizedArticles.push({
        ...article,
        summary: fallbackSummary,
        points: [],
        insight: "",
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

  // JSON 파일 저장 (UTF-8 인코딩 명시)
  const output = {
    generatedAt: new Date().toISOString(),
    articles: finalArticles,
  };

  // JSON.stringify 시 한글이 제대로 유니코드로 저장되도록 보장
  const jsonString = JSON.stringify(output, null, 2);

  // UTF-8 BOM 없이 저장 (일부 브라우저에서 BOM이 문제를 일으킬 수 있음)
  await writeFile("public/news-summaries.json", jsonString, {
    encoding: "utf8",
  });

  // frontend 디렉토리에도 복사
  await writeFile("frontend/news-summaries.json", jsonString, {
    encoding: "utf8",
  });

  console.log("\n✅ Summary generation complete!");
  console.log(`   - Success: ${successCount}`);
  console.log(`   - Failed: ${failCount}`);
  console.log(`   - Total articles: ${finalArticles.length}`);
  console.log(`   - Saved to: public/news-summaries.json\n`);
}

// 실행
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
