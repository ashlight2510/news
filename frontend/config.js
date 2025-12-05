// 백엔드 API 설정
// Render에서 배포한 백엔드 URL을 여기에 입력하세요
// 예: https://it-news-api.onrender.com

const CONFIG = {
  // 프로덕션 백엔드 URL (Render 배포 URL)
  BACKEND_URL: 'https://news-u60e.onrender.com',
  
  // 로컬 개발 백엔드 URL
  LOCAL_BACKEND_URL: 'http://localhost:3000'
};

// 환경에 따라 API URL 결정
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${CONFIG.LOCAL_BACKEND_URL}/api/articles`;
  }
  return `${CONFIG.BACKEND_URL}/api/articles`;
};

// 전역으로 export (HTML에서 사용)
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.getApiUrl = getApiUrl;
}

