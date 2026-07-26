/* ============================================================
   DORM FINDER — API Client
   ============================================================ */
'use strict'

const API_BASE = (() => {
  if (typeof window !== 'undefined' && window.__API_URL__) return window.__API_URL__
  return 'http://localhost:8787/api'
})()

function getToken() {
  try { const s = JSON.parse(localStorage.getItem('dormFinderSession') || '{}'); return s.token || null } catch { return null }
}

function saveSession(token, user, rememberMe = true) {
  const session = { token, ...user, loginTime: new Date().toISOString(), rememberMe }
  localStorage.setItem('dormFinderSession', JSON.stringify(session))
}

function clearSession() { localStorage.removeItem('dormFinderSession') }
function authHeaders() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {} }

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
    ...options,
  }
  if (!options.body) delete config.headers['Content-Type']
  const res = await fetch(url, config)
  const data = await res.json()
  if (!res.ok && !data.success) throw new Error(data.message || `Error (${res.status})`)
  return data
}

const API = {
  async register(formData) {
    const data = await apiFetch('/register', { method: 'POST', body: JSON.stringify(formData) })
    if (data.success && data.token) saveSession(data.token, data.user)
    return data
  },
  async login(email, password) {
    const data = await apiFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    if (data.success && data.token) saveSession(data.token, data.user)
    return data
  },
  /* ─── Social Login ────────────────────────────────────────
   * 🔐 Production: ใช้ OAuth flow จริง
   *   Google: ใช้ Google Identity Services (GIS) → ส่ง credential ไป POST /api/auth/google
   *   Apple:   ใช้ Apple JS SDK → ส่ง id_token ไป POST /api/auth/apple
   * ------------------------------------------------------- */
  async loginWithGoogle(credential) {
    const data = await apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) })
    if (data.success && data.token) saveSession(data.token, data.user)
    return data
  },
  async loginWithApple(idToken, appleUser) {
    const data = await apiFetch('/auth/apple', { method: 'POST', body: JSON.stringify({ id_token: idToken, user: appleUser }) })
    if (data.success && data.token) saveSession(data.token, data.user)
    return data
  },
  async getMe() { return await apiFetch('/me') },
  async logout() {
    try { await apiFetch('/logout', { method: 'POST' }) } catch { /* ignore */ }
    clearSession()
  },
  isLoggedIn() {
    return !!(JSON.parse(localStorage.getItem('dormFinderSession') || 'null')?.token)
  },
  getCachedUser() {
    try {
      const s = JSON.parse(localStorage.getItem('dormFinderSession') || 'null')
      if (!s?.token) return null
      const { token, loginTime, rememberMe, ...user } = s
      return user
    } catch { return null }
  },
  setBaseUrl(url) { window.__API_URL__ = url.replace(/\/+$/, '') + '/api' },
}
