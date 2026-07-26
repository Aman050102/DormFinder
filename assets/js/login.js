/* ============================================================
   DORM FINDER — Login JavaScript
   ============================================================ */
'use strict'

const roleBtns = document.querySelectorAll('.role-btn')
const roleIndicator = document.getElementById('roleIndicator')
const loginForm = document.getElementById('loginForm')
const emailInput = document.getElementById('loginEmail')
const passwordInput = document.getElementById('loginPassword')
const rememberMe = document.getElementById('rememberMe')
const alertBox = document.getElementById('alertMessage')
const alertText = document.getElementById('alertText')
const submitBtn = document.getElementById('loginSubmitBtn')
let currentRole = 'user'

roleBtns.forEach((btn) => {
  btn.addEventListener('click', function () {
    const role = this.dataset.role
    if (role === currentRole) return
    roleBtns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false') })
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
    ? '<i class="fas fa-user"></i> กำลังเข้าสู่ระบบในฐานะ ผู้ใช้'
    : '<i class="fas fa-shield-alt"></i> กำลังเข้าสู่ระบบในฐานะ ผู้ดูแลระบบ'
  submitBtn.innerHTML = isUser
    ? '<i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ'
    : '<i class="fas fa-shield-alt"></i> เข้าสู่ระบบ (แอดมิน)'
  document.querySelector('.form-wrapper h2').textContent = isUser ? 'เข้าสู่ระบบ' : 'เข้าสู่ระบบสำหรับผู้ดูแล'
}

function togglePasswordVisibility(fieldId, btnElement) {
  const field = document.getElementById(fieldId)
  if (!field) return
  const icon = btnElement.querySelector('i')
  field.type = field.type === 'password' ? 'text' : 'password'
  icon.className = field.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash'
}

function showAlert(message, type = 'error') { alertBox.className = `alert alert-${type} show`; alertText.textContent = message }
function hideAlert() { alertBox.className = 'alert'; alertText.textContent = '' }

function setLoading(loading) {
  submitBtn.disabled = loading
  submitBtn.innerHTML = loading
    ? '<i class="fas fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...'
    : currentRole === 'admin'
      ? '<i class="fas fa-shield-alt"></i> เข้าสู่ระบบ (แอดมิน)'
      : '<i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ'
}

function validateForm() {
  const email = emailInput.value.trim(); const password = passwordInput.value.trim()
  emailInput.classList.remove('error'); passwordInput.classList.remove('error')
  if (!email && !password) { showAlert('⚠️ กรุณากรอกอีเมลและรหัสผ่าน'); emailInput.classList.add('error'); passwordInput.classList.add('error'); return false }
  if (!email) { showAlert('⚠️ กรุณากรอกอีเมล'); emailInput.classList.add('error'); emailInput.focus(); return false }
  if (!password) { showAlert('⚠️ กรุณากรอกรหัสผ่าน'); passwordInput.classList.add('error'); passwordInput.focus(); return false }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) { showAlert('⚠️ รูปแบบอีเมลไม่ถูกต้อง'); emailInput.classList.add('error'); emailInput.focus(); return false }
  if (password.length < 8) { showAlert('⚠️ รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'); passwordInput.classList.add('error'); passwordInput.focus(); return false }
  return { email, password }
}

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
        showAlert('❌ บทบาทผู้ใช้ไม่ตรงกับที่เลือก กรุณาตรวจสอบ')
        localStorage.removeItem('dormFinderSession')
        setLoading(false); return
      }
      showAlert('✅ เข้าสู่ระบบสำเร็จ! กำลังนำไปยังแดชบอร์ด...', 'success')
      const dashboard = result.user.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html'
      setTimeout(() => window.location.href = dashboard, 800)
    }
  } catch (err) {
    console.warn('API failed, using local fallback:', err.message)
    fallbackMockLogin(email, password)
  }
}

function fallbackMockLogin(email, password) {
  const storedUsers = JSON.parse(localStorage.getItem('dormFinderUsers') || '[]')
  const user = storedUsers.find(u => u.email === email && u.password === password && u.role === currentRole)
  if (user) {
    localStorage.setItem('dormFinderSession', JSON.stringify({ ...user, loginTime: new Date().toISOString(), rememberMe: rememberMe.checked }))
    showAlert('✅ เข้าสู่ระบบสำเร็จ (Local)!', 'success')
    setTimeout(() => window.location.href = user.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html', 800)
    return
  }
  if (email === 'admin@dormfinder.com' && password === 'admin1234' && currentRole === 'admin') {
    localStorage.setItem('dormFinderSession', JSON.stringify({ username: 'admin', email, role: 'admin', loginTime: new Date().toISOString() }))
    showAlert('✅ เข้าสู่ระบบสำเร็จ (Local)!', 'success')
    setTimeout(() => window.location.href = 'pages/admin/dashboard.html', 800); return
  }
  if (email === 'user@dormfinder.com' && password === 'user1234' && currentRole === 'user') {
    localStorage.setItem('dormFinderSession', JSON.stringify({ username: 'user', email, role: 'user', loginTime: new Date().toISOString() }))
    showAlert('✅ เข้าสู่ระบบสำเร็จ (Local)!', 'success')
    setTimeout(() => window.location.href = 'pages/user/dashboard.html', 800); return
  }
  showAlert('❌ อีเมลหรือรหัสผ่านไม่ถูกต้องสำหรับบทบาทนี้')
  setLoading(false)
}

function goToRegister() { window.location.href = 'register.html' }

loginForm.addEventListener('submit', handleLogin)

;(function init() {
  try {
    const session = JSON.parse(localStorage.getItem('dormFinderSession') || '{}')
    if (session.rememberMe && session.email) emailInput.value = session.email
  } catch {}
})()
