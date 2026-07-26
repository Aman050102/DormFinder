/* ============================================================
   DORM FINDER — Login JavaScript
   ============================================================ */
'use strict'

// ─── SVG Icons ────────────────────────────────────────────
const SVG = {
  user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  shield: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
  signIn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
  loading: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="spin" style="animation:spin 1s linear infinite;vertical-align:middle"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
  userPlus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  alert: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
}

// ─── DOM ──────────────────────────────────────────────────
const roleBtns      = document.querySelectorAll('.role-btn')
const roleIndicator = document.getElementById('roleIndicator')
const loginForm     = document.getElementById('loginForm')
const emailInput    = document.getElementById('loginEmail')
const passwordInput = document.getElementById('loginPassword')
const rememberMe    = document.getElementById('rememberMe')
const alertBox      = document.getElementById('alertMessage')
const alertText     = document.getElementById('alertText')
const submitBtn     = document.getElementById('loginSubmitBtn')
let currentRole     = 'user'

// ─── Role Toggle ──────────────────────────────────────────
roleBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    const role = this.dataset.role
    if (role === currentRole) return
    roleBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false') })
    this.classList.add('active'); this.setAttribute('aria-pressed', 'true')
    currentRole = role; updateRoleUI(role)
  })
  btn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click() }
  })
})

function updateRoleUI(role) {
  const isUser = role === 'user'
  roleIndicator.className = `role-indicator ${role}`
  roleIndicator.innerHTML = isUser
    ? `${SVG.user} เข้าสู่ระบบในฐานะ ผู้ใช้ทั่วไป`
    : `${SVG.shield} เข้าสู่ระบบในฐานะ ผู้ดูแลระบบ`
  submitBtn.innerHTML = isUser
    ? `${SVG.signIn} เข้าสู่ระบบ`
    : `${SVG.shield} เข้าสู่ระบบ`
  document.querySelector('.form-wrapper h2').textContent = isUser ? 'เข้าสู่ระบบ' : 'เข้าสู่ระบบสำหรับผู้ดูแล'
}

// ─── Password Toggle ──────────────────────────────────────
function togglePasswordVisibility(fieldId, btn) {
  const field = document.getElementById(fieldId)
  if (!field) return
  const isPw = field.type === 'password'
  field.type = isPw ? 'text' : 'password'
  btn.innerHTML = isPw ? SVG.eyeOff : SVG.eye
}

// ─── Alert ────────────────────────────────────────────────
function showAlert(msg, type = 'error') {
  const icon = type === 'success' ? SVG.check : SVG.alert
  alertBox.className = `alert alert-${type} show`
  alertText.textContent = msg
  // insert icon as first child
  const existingIcon = alertBox.querySelector('svg')
  if (!existingIcon) alertBox.insertAdjacentHTML('afterbegin', icon + ' ')
}
function hideAlert() { alertBox.className = 'alert'; alertText.textContent = ''; const svg = alertBox.querySelector('svg'); if (svg) svg.remove() }

// ─── Loading ──────────────────────────────────────────────
function setLoading(loading) {
  submitBtn.disabled = loading
  submitBtn.innerHTML = loading
    ? `${SVG.loading} กำลังเข้าสู่ระบบ...`
    : currentRole === 'admin'
      ? `${SVG.shield} เข้าสู่ระบบ`
      : `${SVG.signIn} เข้าสู่ระบบ`
}

// ─── Validate ─────────────────────────────────────────────
function validateForm() {
  const email = emailInput.value.trim(), password = passwordInput.value.trim()
  emailInput.classList.remove('error'); passwordInput.classList.remove('error')
  if (!email && !password) { showAlert('กรุณากรอกอีเมลและรหัสผ่าน'); emailInput.classList.add('error'); passwordInput.classList.add('error'); return false }
  if (!email) { showAlert('กรุณากรอกอีเมล'); emailInput.classList.add('error'); emailInput.focus(); return false }
  if (!password) { showAlert('กรุณากรอกรหัสผ่าน'); passwordInput.classList.add('error'); passwordInput.focus(); return false }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) { showAlert('รูปแบบอีเมลไม่ถูกต้อง'); emailInput.classList.add('error'); emailInput.focus(); return false }
  if (password.length < 8) { showAlert('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'); passwordInput.classList.add('error'); passwordInput.focus(); return false }
  return { email, password }
}

// ─── Handle Login ─────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault()
  const validated = validateForm()
  if (!validated) return
  setLoading(true); hideAlert()
  const { email, password } = validated
  try {
    const result = await API.login(email, password)
    if (result.success) {
      if (result.user.role !== currentRole) {
        showAlert('บทบาทผู้ใช้ไม่ตรงกับที่เลือก กรุณาตรวจสอบ')
        localStorage.removeItem('dormFinderSession')
        setLoading(false); return
      }
      showAlert('เข้าสู่ระบบสำเร็จ! กำลังนำไปยังแดชบอร์ด...', 'success')
      setTimeout(() => window.location.href = result.user.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html', 800)
    }
  } catch (err) {
    console.warn('API failed, fallback to local:', err.message)
    fallbackMockLogin(email, password)
  }
}

// ─── Fallback ─────────────────────────────────────────────
function fallbackMockLogin(email, password) {
  const users = JSON.parse(localStorage.getItem('dormFinderUsers') || '[]')
  const user = users.find(u => u.email === email && u.password === password && u.role === currentRole)
  if (user) {
    localStorage.setItem('dormFinderSession', JSON.stringify({ ...user, loginTime: new Date().toISOString(), rememberMe: rememberMe.checked }))
    showAlert('เข้าสู่ระบบสำเร็จ', 'success')
    setTimeout(() => window.location.href = user.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html', 800); return
  }
  if (email === 'admin@dormfinder.com' && password === 'admin1234' && currentRole === 'admin') {
    localStorage.setItem('dormFinderSession', JSON.stringify({ username: 'admin', email, role: 'admin', loginTime: new Date().toISOString() }))
    showAlert('เข้าสู่ระบบสำเร็จ', 'success')
    setTimeout(() => window.location.href = 'pages/admin/dashboard.html', 800); return
  }
  if (email === 'user@dormfinder.com' && password === 'user1234' && currentRole === 'user') {
    localStorage.setItem('dormFinderSession', JSON.stringify({ username: 'user', email, role: 'user', loginTime: new Date().toISOString() }))
    showAlert('เข้าสู่ระบบสำเร็จ', 'success')
    setTimeout(() => window.location.href = 'pages/user/dashboard.html', 800); return
  }
  showAlert('อีเมลหรือรหัสผ่านไม่ถูกต้องสำหรับบทบาทนี้')
  setLoading(false)
}

function goToRegister() { window.location.href = 'register.html' }

loginForm.addEventListener('submit', handleLogin)

// Init
;(function () {
  try {
    const s = JSON.parse(localStorage.getItem('dormFinderSession') || '{}')
    if (s.rememberMe && s.email) emailInput.value = s.email
  } catch {}
  // Inject spin animation
  if (!document.getElementById('spinStyle')) {
    const style = document.createElement('style')
    style.id = 'spinStyle'
    style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'
    document.head.appendChild(style)
  }
})()
