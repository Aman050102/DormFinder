/* ============================================================
   DORM FINDER — API Client
   ============================================================ */
'use strict'

const API_BASE = (() => {
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return window.__API_URL__
  }
  return 'http://localhost:8787/api'
})()

function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem('dormFinderSession') || '{}')
    return session.token || null
  } catch { return null }
}

function saveSession(token, user, rememberMe = true) {
  const session = { token, ...user, loginTime: new Date().toISOString(), rememberMe }
  localStorage.setItem('dormFinderSession', JSON.stringify(session))
}

function clearSession() { localStorage.removeItem('dormFinderSession') }

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  }
  if (!options.body) delete config.headers['Content-Type']

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok && !data.success) {
    throw new Error(data.message || `เกิดข้อผิดพลาด (${response.status})`)
  }
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
  async getMe() { return await apiFetch('/me') },
  async logout() {
    try { await apiFetch('/logout', { method: 'POST' }) } catch { /* ignore */ }
    clearSession()
  },
  isLoggedIn() {
    const session = JSON.parse(localStorage.getItem('dormFinderSession') || 'null')
    return !!(session && session.token)
  },
  getCachedUser() {
    const session = JSON.parse(localStorage.getItem('dormFinderSession') || 'null')
    if (!session || !session.token) return null
    const { token, loginTime, rememberMe, ...user } = session
    return user
  },
  setBaseUrl(url) {
    window.__API_URL__ = url.replace(/\/+$/, '') + '/api'
  },
}
