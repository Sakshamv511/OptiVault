/**
 * OptiVault Central API Configuration
 * Supports Local Development, Vercel Frontend, and Render Backend Deployments.
 */
(function (window) {
  'use strict';

  // 1. Check for manual override in localStorage or window
  // Allows testing any backend URL without modifying code:
  // In DevTools console: OptiVaultAPI.setBackendUrl('https://your-app.onrender.com')
  const getStoredOverride = function () {
    try {
      return localStorage.getItem('OPTIVAULT_API_URL');
    } catch (e) {
      return null;
    }
  };

  // 2. Default Render Production Backend URL
  // Can be adjusted if a default custom domain is used
  const DEFAULT_RENDER_BACKEND = 'https://optivault-backend.onrender.com';

  function resolveBaseUrl() {
    // Priority 1: Window object override (e.g. injected at build or script level)
    if (window.__OPTIVAULT_API_URL__) {
      return window.__OPTIVAULT_API_URL__.replace(/\/+$/, '');
    }

    // Priority 2: Stored override in localStorage
    const stored = getStoredOverride();
    if (stored) {
      return stored.replace(/\/+$/, '');
    }

    // Priority 3: Local environment
    const host = window.location.hostname;
    const port = window.location.port;

    // Running directly from localhost or 127.0.0.1
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      // If served from backend server itself (port 5001)
      if (port === '5001') {
        return '';
      }
      // If frontend served on a separate local dev server (e.g., Live Server port 5500)
      return 'http://localhost:5001';
    }

    // Priority 4: Cloud deployment (Vercel, Render, etc.)
    // When hosted on Vercel with vercel.json rewrites, relative path '' is proxied to Render.
    // If vercel.json is not yet set up, returning DEFAULT_RENDER_BACKEND enables direct CORS calls.
    if (window.__OPTIVAULT_DIRECT_RENDER__) {
      return DEFAULT_RENDER_BACKEND;
    }

    return '';
  }

  function getApiUrl(endpoint) {
    if (!endpoint) return '';
    // If endpoint is already an absolute URL, return as-is
    if (/^https?:\/\//i.test(endpoint)) return endpoint;

    const base = resolveBaseUrl();
    const cleanPath = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    return base ? `${base}${cleanPath}` : cleanPath;
  }

  window.OptiVaultAPI = {
    getBaseUrl: resolveBaseUrl,
    getUrl: getApiUrl,
    setBackendUrl: function (url) {
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
  };

  // Expose convenient global helper
  window.getApiUrl = getApiUrl;

  // Google OAuth 2.0 Client ID for instant client-side rendering
  window.__GOOGLE_CLIENT_ID__ = '304461158169-1ibf3i818r8a40hlrbtf1iub6b8tf8la.apps.googleusercontent.com';
})(window);
