/* ============================================================
   DORM FINDER — Register JavaScript (User only)
   ============================================================ */
'use strict'

const SVG = {
  loading: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="animation:spin 1s linear infinite;vertical-align:middle"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
  alert: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
}

const form     = document.getElementById('registerForm')
const alertBox = document.getElementById('alertMessage')
const alertText = document.getElementById('alertText')
const submitBtn = document.getElementById('registerSubmitBtn')

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
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
function hideAlert() { alertBox.className = 'alert'; alertText.textContent = ''; const s = alertBox.querySelector('svg'); if (s) s.remove() }

function passwordStrength(p) {
  let s = 0; if (p.length >= 8) s++; if (p.length >= 10) s++
  if (/[a-z]/.test(p)) s++; if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++; if (/[^a-zA-Z0-9]/.test(p)) s++
  if (s <= 2) return { label: 'อ่อน', color: '#DC2626' }
  if (s <= 4) return { label: 'ปานกลาง', color: '#D97706' }
  return { label: 'แข็งแรง', color: '#16A34A' }
}

function setLoading(loading) {
  submitBtn.disabled = loading
  submitBtn.innerHTML = loading ? `${SVG.loading} กำลังสมัคร...` : 'สมัครสมาชิก'
}

// ─── Validate ─────────────────────────────────────────────
function validate() {
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

  if (!f.username.value.trim()) return err('กรุณากรอกชื่อผู้ใช้', f.username)
  if (f.username.value.trim().length < 3) return err('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร', f.username)
  if (!f.email.value.trim()) return err('กรุณากรอกอีเมล', f.email)
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(f.email.value.trim())) return err('รูปแบบอีเมลไม่ถูกต้อง', f.email)
  if (!f.password.value) return err('กรุณากรอกรหัสผ่าน', f.password)
  if (f.password.value.length < 8) return err('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', f.password)
  if (!f.confirm.value) return err('กรุณายืนยันรหัสผ่าน', f.confirm)
  if (f.password.value !== f.confirm.value) return err('รหัสผ่านไม่ตรงกัน', f.password, f.confirm)
  if (!f.phone.value.trim()) return err('กรุณากรอกเบอร์โทรศัพท์', f.phone)
  if (!/^[0-9]{10}$/.test(f.phone.value.trim())) return err('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก', f.phone)
  if (!f.dob.value) return err('กรุณาเลือกวันเกิด', f.dob)
  let gv = ''; radios.forEach(r => { if (r.checked) gv = r.value })
  if (!gv) { showAlert('กรุณาเลือกเพศ'); return false }
  if (!f.street.value.trim()) return err('กรุณากรอกบ้านเลขที่ / ถนน', f.street)
  if (!f.subdistrict.value.trim()) return err('กรุณากรอกแขวง / ตำบล', f.subdistrict)
  if (!f.district.value.trim()) return err('กรุณากรอกเขต / อำเภอ', f.district)
  if (!f.province.value.trim()) return err('กรุณากรอกจังหวัด', f.province)
  if (!/^[0-9]{5}$/.test(f.postalCode.value.trim())) return err('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก', f.postalCode)
  if (!terms.checked) { showAlert('กรุณายอมรับข้อกำหนดและเงื่อนไข'); terms.focus(); return false }

  return {
    username: f.username.value.trim(), email: f.email.value.trim(), password: f.password.value,
    phone: f.phone.value.trim(), dob: f.dob.value, gender: gv,
    street: f.street.value.trim(), alley: f.alley.value.trim(),
    subdistrict: f.subdistrict.value.trim(), district: f.district.value.trim(),
    province: f.province.value.trim(), postalCode: f.postalCode.value.trim(),
    role: 'user',
  }
  function err(msg, ...el) { showAlert(msg); el.forEach(e => e.classList.add('error')); el[0]?.focus(); return false }
}

// ─── Handle Register ──────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault()
  const data = validate()
  if (!data) return
  setLoading(true); hideAlert()
  try {
    const result = await API.register(data)
    if (result.success) {
      showAlert('สมัครสมาชิกสำเร็จ! กำลังไปยังแดชบอร์ด...', 'success')
      setTimeout(() => window.location.href = 'pages/user/dashboard.html', 1000)
    }
  } catch (err) {
    console.warn('API failed, using localStorage:', err.message)
    const users = JSON.parse(localStorage.getItem('dormFinderUsers') || '[]')
    if (users.some(u => u.email === data.email)) { showAlert('อีเมลนี้ถูกใช้งานไปแล้ว'); setLoading(false); return }
    users.push(data); localStorage.setItem('dormFinderUsers', JSON.stringify(users))
    localStorage.setItem('dormFinderSession', JSON.stringify({ username: data.username, email: data.email, role: 'user', loginTime: new Date().toISOString(), rememberMe: true }))
    showAlert('สมัครสมาชิกสำเร็จ', 'success')
    setTimeout(() => window.location.href = 'pages/user/dashboard.html', 1000)
  }
}

// ─── Password Strength ────────────────────────────────────
;(function () {
  const pwd = document.getElementById('regPassword')
  if (!pwd) return
  const el = document.createElement('div')
  el.style.cssText = 'margin-top:5px;font-size:0.78rem;font-weight:600;transition:all .2s;'
  pwd.parentNode.appendChild(el)
  pwd.addEventListener('input', function () {
    if (!this.value) { el.textContent = ''; return }
    const s = passwordStrength(this.value)
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

form.addEventListener('submit', handleRegister)

// ─── Init ─────────────────────────────────────────────────
;(function () {
  if (!document.getElementById('spinStyle')) {
    const s = document.createElement('style'); s.id = 'spinStyle'
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'
    document.head.appendChild(s)
  }
})()
