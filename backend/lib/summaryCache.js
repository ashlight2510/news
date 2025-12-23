/**
 * 요약 캐시 관리 모듈
 * URL을 키로 하여 요약 결과를 캐싱하여 API 비용 절감
 */

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '../data/summary-cache.json');
const CACHE_DIR = path.join(__dirname, '../data');
const CACHE_TTL_HOURS = 6; // 요약 캐시 유지 시간

// 캐시 디렉토리 생성
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// 캐시 로드
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Failed to load cache:', error.message);
  }
  return {};
}

// 캐시 저장
function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save cache:', error.message);
  }
}

// 캐시에서 요약 가져오기
function getCachedSummary(url) {
  const cache = loadCache();
  const cached = cache[url];
  
  if (cached) {
    // 캐시가 TTL 이내면 사용
    const cacheTime = new Date(cached.timestamp);
    const now = new Date();
    const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
    
    if (hoursDiff < CACHE_TTL_HOURS) {
      // data 필드가 없던 예전 캐시 구조도 함께 지원
      return cached.data || cached.summary || null;
    }
  }
  
  return null;
}

// 요약 캐시에 저장
function setCachedSummary(url, summary) {
  const cache = loadCache();
  cache[url] = {
    data: summary,
    timestamp: new Date().toISOString()
  };
  saveCache(cache);
}

// 오래된 캐시 정리 (TTL 이상)
function cleanOldCache() {
  const cache = loadCache();
  const now = new Date();
  let cleaned = false;
  
  for (const url in cache) {
    const cached = cache[url];
    const cacheTime = new Date(cached.timestamp);
    const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
    
    if (hoursDiff >= CACHE_TTL_HOURS) {
      delete cache[url];
      cleaned = true;
    }
  }
  
  if (cleaned) {
    saveCache(cache);
    console.log('Cleaned old cache entries');
  }
}

module.exports = {
  getCachedSummary,
  setCachedSummary,
  cleanOldCache
};
