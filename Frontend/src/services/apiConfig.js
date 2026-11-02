/**
 * OptiVault Central API Configuration
 * Supports Local Development (Vite dev server, monolithic Express), and Cloud Deployments.
 */

const DEFAULT_RENDER_BACKEND = 'https://optivault-backend.onrender.com';

export function getStoredOverride() {
  try {
    return localStorage.getItem('OPTIVAULT_API_URL');
  } catch (e) {
    return null;
  }
}

export function resolveBaseUrl() {
  if (typeof window === 'undefined') return 'http://localhost:5001';

  // 1. Window object override
  if (window.__OPTIVAULT_API_URL__) {
    return window.__OPTIVAULT_API_URL__.replace(/\/+$/, '');
  }

  // 2. Local storage override
  const stored = getStoredOverride();
  if (stored) {
    return stored.replace(/\/+$/, '');
  }

  // 3. Local environment
  const host = window.location.hostname;
  const port = window.location.port;

  if (host === 'localhost' || host === '127.0.0.1' || host === '') {
    // If served from Express backend directly (port 5001)
    if (port === '5001') {
      return '';
    }
    // If running in Vite dev server (port 3000 or 5173), Vite proxies /api, but direct fallback is 5001
    return '';
  }

  // 4. Cloud deployment fallback if needed
  if (window.__OPTIVAULT_DIRECT_RENDER__) {
    return DEFAULT_RENDER_BACKEND;
  }

  return '';
}

export function getApiUrl(endpoint) {
  if (!endpoint) return '';
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const base = resolveBaseUrl();
  const cleanPath = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return base ? `${base}${cleanPath}` : cleanPath;
}

export function setBackendUrl(url) {
  try {
    if (url) {
      localStorage.setItem('OPTIVAULT_API_URL', url.trim());
      console.log('[OptiVault API] Backend URL set to:', url.trim());
    } else {
      localStorage.removeItem('OPTIVAULT_API_URL');
      console.log('[OptiVault API] Reset to default relative path');
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.OptiVaultAPI = {
    getBaseUrl: resolveBaseUrl,
    getUrl: getApiUrl,
    setBackendUrl
  };
  window.getApiUrl = getApiUrl;
  window.__GOOGLE_CLIENT_ID__ = window.__GOOGLE_CLIENT_ID__ || '304461158169-1ibf3i818r8a40hlrbtf1iub6b8tf8la.apps.googleusercontent.com';
}
