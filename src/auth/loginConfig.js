/** Client-side demo login only — not suitable for production without a real auth backend. */
export const LOGIN_EMAIL = 'spuc_admin@soundarya.edu';
export const LOGIN_PASSWORD = 'Soundarya@2026';
export const AUTH_STORAGE_KEY = 'spuc_ra_authed';

export function isStoredSessionValid() {
  return typeof window !== 'undefined' && window.localStorage.getItem(AUTH_STORAGE_KEY) === '1';
}

export function persistSession() {
  window.localStorage.setItem(AUTH_STORAGE_KEY, '1');
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function validateLogin(email, password) {
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');
  return e === LOGIN_EMAIL.toLowerCase() && p === LOGIN_PASSWORD;
}
