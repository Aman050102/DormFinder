/* ============================================================
   DORM FINDER — API Client
   ใช้เรียก Backend Hono + D1
   ============================================================ */
'use strict'

// ─── API Base URL ───────────────────────────────────────────
// ใน dev: wrangler dev รันที่ localhost:8787
// ใน production: เปลี่ยนเป็น URL ที่ deploy จริง
const API_BASE = (() => {
  // ถ้ามีการกำหนด API_URL ใน global (จาก script tag) ให้ใช้ค่านั้น
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return window.__API_URL__
  }
  // Dev default
  return 'http://localhost:8787/api'
})()

// ─── Helper: get token ──────────────────────────────────────
function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem('dormFinderSession') || '{}')
    return session.token || null
  } catch {
    return null
  }
}

// ─── Helper: save session ───────────────────────────────────
function saveSession(token, user, rememberMe = true) {
  const session = {
    token,
    ...user,
    loginTime: new Date().toISOString(),
    rememberMe,
  }
  localStorage.setItem('dormFinderSession', JSON.stringify(session))
}

// ─── Helper: clear session ──────────────────────────────────
function clearSession() {
  localStorage.removeItem('dormFinderSession')
}

// ─── Helper: set auth header ────────────────────────────────
function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Generic fetch wrapper ─────────────────────────────────
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

  // ถ้าไม่มี body ให้ลบ Content-Type
  if (!options.body) {
    delete config.headers['Content-Type']
  }

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok && !data.success) {
    throw new Error(data.message || `เกิดข้อผิดพลาด (${response.status})`)
  }

  return data
}

// ============================================================
// Public API Methods
// ============================================================
const API = {
  /** สมัครสมาชิก */
  async register(formData) {
    const data = await apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    })

    if (data.success && data.token) {
      saveSession(data.token, data.user)
    }

    return data
  },

  /** เข้าสู่ระบบ */
  async login(email, password) {
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (data.success && data.token) {
      saveSession(data.token, data.user)
    }

    return data
  },

  /** ดูข้อมูลผู้ใช้ปัจจุบัน */
  async getMe() {
    return await apiFetch('/me')
  },

  /** ออกจากระบบ */
  async logout() {
    try {
      await apiFetch('/logout', { method: 'POST' })
    } catch {
      // ignore errors — clear locally anyway
    }
    clearSession()
  },

  /** เช็คว่า logged in หรือไม่ */
  isLoggedIn() {
    const session = JSON.parse(localStorage.getItem('dormFinderSession') || 'null')
    return !!(session && session.token)
  },

  /** ดึง user จาก localStorage (ไม่ต้องเรียก API) */
  getCachedUser() {
    const session = JSON.parse(localStorage.getItem('dormFinderSession') || 'null')
    if (!session || !session.token) return null
    const { token, loginTime, rememberMe, ...user } = session
    return user
  },

  /** เปลี่ยน API URL (กรณี deploy แล้ว URL เปลี่ยน) */
  setBaseUrl(url) {
    window.__API_URL__ = url.replace(/\/+$/, '') + '/api'
  },
}

// ⚠️ สำหรับกรณีที่ API Server ยังไม่พร้อม ให้ fallback ใช้ localStorage
//    ดูใน login.js บรรทัด handleLogin() ที่จับ error แล้ว fallback
