import { getApiUrl } from './apiConfig';

export const AUTH_KEYS = {
  session: 'optivault-session',
  jwt: 'optivault-jwt'
};

export const ROLE_DESTINATIONS = {
  'company-admin': '/company-dashboard',
  'supervisor': '/warehouse-select',
  'platform-admin': '/platform-admin'
};

export function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveSession(user) {
  try {
    localStorage.setItem(AUTH_KEYS.session, JSON.stringify(user));
  } catch (e) {}
}

export function getToken() {
  try {
    return localStorage.getItem(AUTH_KEYS.jwt);
  } catch (e) {
    return null;
  }
}

export function logout() {
  try {
    localStorage.removeItem(AUTH_KEYS.session);
    localStorage.removeItem(AUTH_KEYS.jwt);
    localStorage.removeItem('optivault-unlocked');
    localStorage.removeItem('optivault-active-warehouse');
  } catch (e) {}
}

export async function loginUser(email, password, role) {
  const url = getApiUrl('/api/auth/login');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();

    if (res.ok && data.success && data.token) {
      localStorage.setItem(AUTH_KEYS.jwt, data.token);
      const session = data.user || { email, role, company: data.user?.company || email.split('@')[0] };
      saveSession(session);
      return { ok: true, session, message: data.message };
    }

    return {
      ok: false,
      message: data.message || 'Authentication credentials rejected.'
    };
  } catch (err) {
    return {
      ok: false,
      message: 'Could not connect to authentication service. Verify backend is running.'
    };
  }
}

export async function loginWithGoogle(credential, role = 'company-admin') {
  const url = getApiUrl('/api/auth/google');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, role })
    });
    const data = await res.json();

    if (res.ok && data.success && data.token) {
      localStorage.setItem(AUTH_KEYS.jwt, data.token);
      const session = data.user || { role, company: data.user?.company || 'Google Account' };
      saveSession(session);
      return { ok: true, session, message: data.message };
    }

    return {
      ok: false,
      message: data.message || 'Google authentication was declined.'
    };
  } catch (err) {
    return {
      ok: false,
      message: 'Could not connect to Google authentication service. Verify backend is running.'
    };
  }
}

export async function registerCompany(details) {
  const url = getApiUrl('/api/auth/register');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    });
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        ok: true,
        reference: data.reference || data.company?.reference,
        company: data.company,
        message: data.message
      };
    }

    return {
      ok: false,
      message: data.message || 'Registration could not be completed.'
    };
  } catch (err) {
    return {
      ok: false,
      message: 'Network error communicating with registration server.'
    };
  }
}
