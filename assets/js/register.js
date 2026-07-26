/* ============================================================
   DORM FINDER — Register JavaScript
   ============================================================ */
'use strict'

// ─── SVG Icons (mirrors login.js) ────────────────────────
const SVG = {
  user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  shield: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
  userPlus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  loading: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="spin" style="animation:spin 1s linear infinite;vertical-align:middle"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
  alert: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  undo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
}

// ─── DOM ──────────────────────────────────────────────────
const roleCards         = document.querySelectorAll('.role-card')
const registerRoleBadge = document.getElementById('registerRoleBadge')
const registerForm      = document.getElementById('registerForm')
const regRole           = document.getElementById('regRole')
const alertBox          = document.getElementById('alertMessage')
const alertText         = document.getElementById('alertText')
const submitBtn         = document.getElementById('registerSubmitBtn')
let selectedRole        = 'user'

// ─── Role Card Selection ──────────────────────────────────
roleCards.forEach(card => {
  card.addEventListener('click', function () {
    const role = this.dataset.role; if (role === selectedRole) return
    roleCards.forEach(c => { c.classList.remove('selected-user', 'selected-admin'); c.setAttribute('aria-pressed', 'false') })
    this.classList.add(role === 'user' ? 'selected-user' : 'selected-admin')
    this.setAttribute('aria-pressed', 'true')
    selectedRole = role; regRole.value = role; updateRegisterRoleUI(role)
  })
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click() }
  })
})

function updateRegisterRoleUI(role) {
  const isUser = role === 'user'
  registerRoleBadge.className = `role-indicator ${role}`
  registerRoleBadge.innerHTML = isUser
    ? `${SVG.user} สมัครในฐานะ ผู้ใช้ทั่วไป`
    : `${SVG.shield} สมัครในฐานะ ผู้ดูแลระบบ`
  document.querySelector('.auth-header h2').textContent = isUser ? 'สร้างบัญชีผู้ใช้' : 'สร้างบัญชีผู้ดูแลระบบ'
  submitBtn.innerHTML = isUser ? `${SVG.userPlus} สมัครสมาชิก` : `${SVG.shield} สมัครแอดมิน`
}

// ─── Password Toggle ──────────────────────────────────────
function togglePasswordVisibility(fieldId, btn) {
  const field = document.getElementById(fieldId)
  if (!field) return
  field.type = field.type === 'password' ? 'text' : 'password'
  btn.innerHTML = field.type === 'password' ? SVG.eye : SVG.eyeOff
}

// ─── Alert ────────────────────────────────────────────────
function showAlert(msg, type = 'error') {
  const icon = type === 'success' ? SVG.check : SVG.alert
  alertBox.className = `alert alert-${type} show`
  alertText.textContent = msg
  const existing = alertBox.querySelector('svg')
  if (!existing) alertBox.insertAdjacentHTML('afterbegin', icon + ' ')
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
function hideAlert() { alertBox.className = 'alert'; alertText.textContent = ''; const s = alertBox.querySelector('svg'); if (s) s.remove() }

// ─── Password Strength ────────────────────────────────────
function getPasswordStrength(p) {
  let s = 0; if (p.length >= 8) s++; if (p.length >= 10) s++
  if (/[a-z]/.test(p)) s++; if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++; if (/[^a-zA-Z0-9]/.test(p)) s++
  if (s <= 2) return { label: 'อ่อน', color: '#DC2626' }
  if (s <= 4) return { label: 'ปานกลาง', color: '#D97706' }
  return { label: 'แข็งแรง', color: '#16A34A' }
}

function setLoading(loading) {
  submitBtn.disabled = loading
  submitBtn.innerHTML = loading
    ? `${SVG.loading} กำลังสมัคร...`
    : selectedRole === 'admin' ? `${SVG.shield} สมัครแอดมิน` : `${SVG.userPlus} สมัครสมาชิก`
}

// ─── Validate ─────────────────────────────────────────────
function validateForm() {
  const f = {
    username: document.getElementById('regUsername'), email: document.getElementById('regEmail'),
    password: document.getElementById('regPassword'), confirm: document.getElementById('regConfirmPassword'),
    phone: document.getElementById('regPhone'), dob: document.getElementById('regDob'),
    street: document.getElementById('regStreet'), alley: document.getElementById('regAlley'),
    subdistrict: document.getElementById('regSubdistrict'), district: document.getElementById('regDistrict'),
    province: document.getElementById('regProvince'), postalCode: document.getElementById('regPostalCode'),
  }
  const radios = document.querySelectorAll('input[name="gender"]')
  const terms = document.getElementById('termsCheckbox')
  Object.values(f).forEach(x => x && x.classList.remove('error')); hideAlert()

  if (!f.username.value.trim()) { return err('กรุณากรอกชื่อผู้ใช้', f.username) }
  if (f.username.value.trim().length < 3) { return err('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร', f.username) }
  if (!f.email.value.trim()) { return err('กรุณากรอกอีเมล', f.email) }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(f.email.value.trim())) { return err('รูปแบบอีเมลไม่ถูกต้อง', f.email) }
  if (!f.password.value) { return err('กรุณากรอกรหัสผ่าน', f.password) }
  if (f.password.value.length < 8) { return err('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', f.password) }
  if (!f.confirm.value) { return err('กรุณายืนยันรหัสผ่าน', f.confirm) }
  if (f.password.value !== f.confirm.value) { return err('รหัสผ่านไม่ตรงกัน', f.password, f.confirm) }
  if (!f.phone.value.trim()) { return err('กรุณากรอกเบอร์โทรศัพท์', f.phone) }
  if (!/^[0-9]{10}$/.test(f.phone.value.trim())) { return err('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก', f.phone) }
  if (!f.dob.value) { return err('กรุณาเลือกวันเกิด', f.dob) }
  let gv = ''; radios.forEach(r => { if (r.checked) gv = r.value })
  if (!gv) { showAlert('กรุณาเลือกเพศ'); return false }
  if (!f.street.value.trim()) { return err('กรุณากรอกบ้านเลขที่ / ถนน', f.street) }
  if (!f.subdistrict.value.trim()) { return err('กรุณากรอกแขวง / ตำบล', f.subdistrict) }
  if (!f.district.value.trim()) { return err('กรุณากรอกเขต / อำเภอ', f.district) }
  if (!f.province.value.trim()) { return err('กรุณากรอกจังหวัด', f.province) }
  if (!/^[0-9]{5}$/.test(f.postalCode.value.trim())) { return err('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก', f.postalCode) }
  if (!terms.checked) { showAlert('กรุณายอมรับข้อกำหนดและเงื่อนไข'); terms.focus(); return false }

  return {
    username: f.username.value.trim(), email: f.email.value.trim(), password: f.password.value,
    phone: f.phone.value.trim(), dob: f.dob.value, gender: gv,
    street: f.street.value.trim(), alley: f.alley.value.trim(),
    subdistrict: f.subdistrict.value.trim(), district: f.district.value.trim(),
    province: f.province.value.trim(), postalCode: f.postalCode.value.trim(),
    role: selectedRole,
  }

  function err(msg, ...el) { showAlert(msg); el.forEach(e => e.classList.add('error')); el[0]?.focus(); return false }
}

// ─── Handle Register ──────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault()
  const data = validateForm()
  if (!data) return
  setLoading(true); hideAlert()
  try {
    const result = await API.register(data)
    if (result.success) {
      showAlert('สมัครสมาชิกสำเร็จ! กำลังไปยังแดชบอร์ด...', 'success')
      setTimeout(() => window.location.href = data.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html', 1000)
    }
  } catch (err) {
    console.warn('API failed, using localStorage:', err.message)
    const users = JSON.parse(localStorage.getItem('dormFinderUsers') || '[]')
    if (users.some(u => u.email === data.email)) { showAlert('อีเมลนี้ถูกใช้งานไปแล้ว'); setLoading(false); return }
    users.push(data); localStorage.setItem('dormFinderUsers', JSON.stringify(users))
    localStorage.setItem('dormFinderSession', JSON.stringify({ username: data.username, email: data.email, role: data.role, loginTime: new Date().toISOString(), rememberMe: true }))
    showAlert('สมัครสมาชิกสำเร็จ', 'success')
    setTimeout(() => window.location.href = data.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html', 1000)
  }
}

// ─── Password Strength Indicator ──────────────────────────
;(function () {
  const pwd = document.getElementById('regPassword')
  if (!pwd) return
  const el = document.createElement('div')
  el.style.cssText = 'margin-top:5px;font-size:0.78rem;font-weight:600;transition:all .2s;'
  pwd.parentNode.appendChild(el)
  pwd.addEventListener('input', function () {
    if (!this.value) { el.textContent = ''; return }
    const s = getPasswordStrength(this.value)
    el.textContent = `ความแข็งแรง: ${s.label}`; el.style.color = s.color
  })
})()

// ─── Gender highlight ─────────────────────────────────────
document.querySelectorAll('.gender-option').forEach(opt => {
  opt.addEventListener('click', function () {
    document.querySelectorAll('.gender-option').forEach(o => o.classList.remove('selected'))
    this.classList.add('selected'); this.querySelector('input[type="radio"]').checked = true
  })
})

// ─── Reset ────────────────────────────────────────────────
registerForm.querySelector('button[type="reset"]').addEventListener('click', function () {
  setTimeout(() => {
    hideAlert()
    document.querySelectorAll('.gender-option').forEach(o => o.classList.remove('selected'))
    document.querySelectorAll('input').forEach(i => i.classList.remove('error'))
  }, 10)
})

registerForm.addEventListener('submit', handleRegister)

// ─── Init ─────────────────────────────────────────────────
;(function () {
  document.querySelector('.role-card[data-role="user"]')?.classList.add('selected-user')
  // Ensure spin style exists
  if (!document.getElementById('spinStyle')) {
    const s = document.createElement('style'); s.id = 'spinStyle'
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'
    document.head.appendChild(s)
  }
})()
