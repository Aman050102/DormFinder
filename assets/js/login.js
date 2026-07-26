/* ============================================================
   DORM FINDER — Login JavaScript (Unified)
   ============================================================ */
'use strict'

const SVG = {
  loading: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="animation:spin 1s linear infinite;vertical-align:middle"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
  alert: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
}

// DOM
const form           = document.getElementById('loginForm')
const emailInput     = document.getElementById('loginEmail')
const passwordInput  = document.getElementById('loginPassword')
const rememberMe     = document.getElementById('rememberMe')
const alertBox       = document.getElementById('alertMessage')
const alertText      = document.getElementById('alertText')
const submitBtn      = document.getElementById('loginSubmitBtn')

// ─── Password Toggle ──────────────────────────────────────
function togglePasswordVisibility(fieldId, btn) {
  const f = document.getElementById(fieldId); if (!f) return
  f.type = f.type === 'password' ? 'text' : 'password'
  btn.innerHTML = f.type === 'password' ? SVG.eye : SVG.eyeOff
}

// ─── Alert ────────────────────────────────────────────────
function showAlert(msg, type = 'error') {
  const icon = type === 'success' ? SVG.check : SVG.alert
  alertBox.className = `alert alert-${type} show`
  alertText.textContent = msg
  if (!alertBox.querySelector('svg')) alertBox.insertAdjacentHTML('afterbegin', icon + ' ')
}
function hideAlert() {
  alertBox.className = 'alert'; alertText.textContent = ''
  const s = alertBox.querySelector('svg'); if (s) s.remove()
}

function setLoading(loading) {
  submitBtn.disabled = loading
  submitBtn.innerHTML = loading
    ? `${SVG.loading} กำลังเข้าสู่ระบบ...`
    : 'เข้าสู่ระบบ'
}

// ─── Validate ─────────────────────────────────────────────
function validate() {
  const email = emailInput.value.trim(), pw = passwordInput.value.trim()
  emailInput.classList.remove('error'); passwordInput.classList.remove('error')
  if (!email && !pw) { showAlert('กรุณากรอกอีเมลและรหัสผ่าน'); emailInput.classList.add('error'); passwordInput.classList.add('error'); return false }
  if (!email) { showAlert('กรุณากรอกอีเมล'); emailInput.classList.add('error'); emailInput.focus(); return false }
  if (!pw) { showAlert('กรุณากรอกรหัสผ่าน'); passwordInput.classList.add('error'); passwordInput.focus(); return false }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) { showAlert('รูปแบบอีเมลไม่ถูกต้อง'); emailInput.classList.add('error'); emailInput.focus(); return false }
  if (pw.length < 8) { showAlert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); passwordInput.classList.add('error'); passwordInput.focus(); return false }
  return { email, password: pw }
}

// ─── Handle Login ─────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault()
  const data = validate()
  if (!data) return
  setLoading(true); hideAlert()
  try {
    const result = await API.login(data.email, data.password)
    if (result.success) {
      showAlert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ${result.user.role === 'admin' ? ' แอดมิน' : ''}`, 'success')
      const dest = result.user.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html'
      setTimeout(() => window.location.href = dest, 800)
    }
  } catch (err) {
    console.warn('API failed, using local fallback:', err.message)
    fallbackLogin(data.email, data.password)
  }
}

// ─── Fallback (auto-detect role from email) ──────────────
function fallbackLogin(email, password) {
  const users = JSON.parse(localStorage.getItem('dormFinderUsers') || '[]')
  const user = users.find(u => u.email === email && u.password === password)

  if (user) {
    localStorage.setItem('dormFinderSession', JSON.stringify({ ...user, loginTime: new Date().toISOString(), rememberMe: rememberMe.checked }))
    showAlert('เข้าสู่ระบบสำเร็จ', 'success')
    const dest = user.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html'
    setTimeout(() => window.location.href = dest, 800); return
  }

  // Test accounts (auto‑detect role)
  if (email === 'admin@dormfinder.com' && password === 'admin1234') {
    localStorage.setItem('dormFinderSession', JSON.stringify({ username: 'admin', email, role: 'admin', loginTime: new Date().toISOString() }))
    showAlert('เข้าสู่ระบบแล้ว (แอดมิน)', 'success')
    setTimeout(() => window.location.href = 'pages/admin/dashboard.html', 800); return
  }
  if (email === 'user@dormfinder.com' && password === 'user1234') {
    localStorage.setItem('dormFinderSession', JSON.stringify({ username: 'user', email, role: 'user', loginTime: new Date().toISOString() }))
    showAlert('เข้าสู่ระบบแล้ว', 'success')
    setTimeout(() => window.location.href = 'pages/user/dashboard.html', 800); return
  }

  showAlert('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  setLoading(false)
}

// ─── Social Login ─────────────────────────────────────────
function handleSocialLogin(provider) {
  showAlert(`กำลังเชื่อมต่อ ${provider === 'google' ? 'Google' : 'Apple'}... โปรดรอสักครู่`, 'success')
  submitBtn.disabled = true

  // 🔐 ในโปรเจคจริง ให้เปลี่ยนเป็น OAuth Flow จริง:
  // Google: ใช้ Google Identity Services (gis) + redirect_uri
  // Apple: ใช้ Apple JS SDK (AppleID.auth)
  //
  // ตัวอย่าง mock — จะ redirect ไป dashboard user เสมอ
  setTimeout(() => {
    const mockUser = {
      username: `${provider}_user`,
      email: `user@${provider}.com`,
      role: 'user',
      loginTime: new Date().toISOString(),
    }
    localStorage.setItem('dormFinderSession', JSON.stringify(mockUser))
    showAlert('เข้าสู่ระบบด้วย ' + (provider === 'google' ? 'Google' : 'Apple') + ' สำเร็จ', 'success')
    setTimeout(() => window.location.href = 'pages/user/dashboard.html', 800)
  }, 1200)
}

// ─── Events ───────────────────────────────────────────────
form.addEventListener('submit', handleLogin)

// ─── Init ─────────────────────────────────────────────────
;(function () {
  try {
    const s = JSON.parse(localStorage.getItem('dormFinderSession') || '{}')
    if (s.rememberMe && s.email) emailInput.value = s.email
  } catch {}
  if (!document.getElementById('spinStyle')) {
    const st = document.createElement('style'); st.id = 'spinStyle'
    st.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'
    document.head.appendChild(st)
  }
})()
