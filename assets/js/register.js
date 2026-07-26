/* ============================================================
   DORM FINDER — Register JavaScript (เชื่อมต่อ Backend จริง)
   ============================================================ */
'use strict'

/* ===== DOM Elements ===== */
const roleCards         = document.querySelectorAll('.role-card')
const registerRoleBadge = document.getElementById('registerRoleBadge')
const registerForm      = document.getElementById('registerForm')
const regRole           = document.getElementById('regRole')
const alertBox          = document.getElementById('alertMessage')
const alertText         = document.getElementById('alertText')
const submitBtn         = document.getElementById('registerSubmitBtn')

let selectedRole = 'user'

/* ===== Role Card Selection ===== */
roleCards.forEach((card) => {
  card.addEventListener('click', function () {
    const role = this.dataset.role
    if (role === selectedRole) return

    roleCards.forEach((c) => {
      c.classList.remove('selected-user', 'selected-admin')
      c.setAttribute('aria-pressed', 'false')
    })

    this.classList.add(role === 'user' ? 'selected-user' : 'selected-admin')
    this.setAttribute('aria-pressed', 'true')

    selectedRole = role
    regRole.value = role
    updateRegisterRoleUI(role)
  })

  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      this.click()
    }
  })
})

function updateRegisterRoleUI(role) {
  const isUser = role === 'user'

  registerRoleBadge.className = `role-indicator ${role}`
  registerRoleBadge.innerHTML = isUser
    ? '<i class="fas fa-user"></i> กำลังสมัครในฐานะ ผู้ใช้ทั่วไป'
    : '<i class="fas fa-shield-alt"></i> กำลังสมัครในฐานะ ผู้ดูแลระบบ'

  document.querySelector('.auth-header h2').textContent = isUser
    ? 'สร้างบัญชีผู้ใช้'
    : 'สร้างบัญชีผู้ดูแลระบบ'

  submitBtn.innerHTML = isUser
    ? '<i class="fas fa-user-plus"></i> สมัครสมาชิก'
    : '<i class="fas fa-shield-alt"></i> สมัครแอดมิน'
}

/* ===== Toggle Password ===== */
function togglePasswordVisibility(fieldId, btnElement) {
  const field = document.getElementById(fieldId)
  if (!field) return
  const icon = btnElement.querySelector('i')
  if (field.type === 'password') {
    field.type = 'text'
    icon.className = 'fas fa-eye-slash'
  } else {
    field.type = 'password'
    icon.className = 'fas fa-eye'
  }
}

/* ===== Alert ===== */
function showAlert(message, type = 'error') {
  alertBox.className = `alert alert-${type} show`
  alertText.textContent = message
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
function hideAlert() {
  alertBox.className = 'alert'
  alertText.textContent = ''
}

/* ===== Password Strength ===== */
function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 10) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'อ่อน', color: '#E74C3C' }
  if (score <= 4) return { label: 'ปานกลาง', color: '#F39C12' }
  return { label: 'แข็งแรง', color: '#27AE60' }
}

/* ===== Set loading state ===== */
function setLoading(loading) {
  submitBtn.disabled = loading
  submitBtn.innerHTML = loading
    ? '<i class="fas fa-spinner fa-spin"></i> กำลังสมัคร...'
    : selectedRole === 'admin'
      ? '<i class="fas fa-shield-alt"></i> สมัครแอดมิน'
      : '<i class="fas fa-user-plus"></i> สมัครสมาชิก'
}

/* ===== Validation ===== */
function validateForm() {
  const fields = {
    username: document.getElementById('regUsername'),
    email: document.getElementById('regEmail'),
    password: document.getElementById('regPassword'),
    confirmPassword: document.getElementById('regConfirmPassword'),
    phone: document.getElementById('regPhone'),
    dob: document.getElementById('regDob'),
    street: document.getElementById('regStreet'),
    alley: document.getElementById('regAlley'),
    subdistrict: document.getElementById('regSubdistrict'),
    district: document.getElementById('regDistrict'),
    province: document.getElementById('regProvince'),
    postalCode: document.getElementById('regPostalCode'),
  }

  const genderRadios = document.querySelectorAll('input[name="gender"]')
  const termsCheckbox = document.getElementById('termsCheckbox')

  Object.values(fields).forEach((f) => f && f.classList.remove('error'))
  hideAlert()

  // Username
  if (!fields.username.value.trim()) {
    showAlert('⚠️ กรุณากรอกชื่อผู้ใช้')
    fields.username.classList.add('error')
    fields.username.focus()
    return false
  }
  if (fields.username.value.trim().length < 3) {
    showAlert('⚠️ ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร')
    fields.username.classList.add('error')
    fields.username.focus()
    return false
  }

  // Email
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!fields.email.value.trim()) {
    showAlert('⚠️ กรุณากรอกอีเมล')
    fields.email.classList.add('error')
    fields.email.focus()
    return false
  }
  if (!emailPattern.test(fields.email.value.trim())) {
    showAlert('⚠️ รูปแบบอีเมลไม่ถูกต้อง')
    fields.email.classList.add('error')
    fields.email.focus()
    return false
  }

  // Password
  if (!fields.password.value) {
    showAlert('⚠️ กรุณากรอกรหัสผ่าน')
    fields.password.classList.add('error')
    fields.password.focus()
    return false
  }
  if (fields.password.value.length < 8) {
    showAlert('⚠️ รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
    fields.password.classList.add('error')
    fields.password.focus()
    return false
  }

  // Confirm password
  if (!fields.confirmPassword.value) {
    showAlert('⚠️ กรุณายืนยันรหัสผ่าน')
    fields.confirmPassword.classList.add('error')
    fields.confirmPassword.focus()
    return false
  }
  if (fields.password.value !== fields.confirmPassword.value) {
    showAlert('⚠️ รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง')
    fields.password.classList.add('error')
    fields.confirmPassword.classList.add('error')
    fields.confirmPassword.focus()
    return false
  }

  // Phone
  const phonePattern = /^[0-9]{10}$/
  if (!fields.phone.value.trim()) {
    showAlert('⚠️ กรุณากรอกเบอร์โทรศัพท์')
    fields.phone.classList.add('error')
    fields.phone.focus()
    return false
  }
  if (!phonePattern.test(fields.phone.value.trim())) {
    showAlert('⚠️ เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก (เช่น 0812345678)')
    fields.phone.classList.add('error')
    fields.phone.focus()
    return false
  }

  // Date of Birth
  if (!fields.dob.value) {
    showAlert('⚠️ กรุณาเลือกวันเกิด')
    fields.dob.classList.add('error')
    fields.dob.focus()
    return false
  }

  // Gender
  let genderSelected = false
  let genderValue = ''
  genderRadios.forEach((r) => {
    if (r.checked) {
      genderSelected = true
      genderValue = r.value
    }
  })
  if (!genderSelected) {
    showAlert('⚠️ กรุณาเลือกเพศ')
    return false
  }

  // Address
  if (!fields.street.value.trim()) {
    showAlert('⚠️ กรุณากรอกบ้านเลขที่ / ถนน')
    fields.street.classList.add('error')
    fields.street.focus()
    return false
  }
  if (!fields.subdistrict.value.trim()) {
    showAlert('⚠️ กรุณากรอกแขวง / ตำบล')
    fields.subdistrict.classList.add('error')
    fields.subdistrict.focus()
    return false
  }
  if (!fields.district.value.trim()) {
    showAlert('⚠️ กรุณากรอกเขต / อำเภอ')
    fields.district.classList.add('error')
    fields.district.focus()
    return false
  }
  if (!fields.province.value.trim()) {
    showAlert('⚠️ กรุณากรอกจังหวัด')
    fields.province.classList.add('error')
    fields.province.focus()
    return false
  }

  // Postal Code
  const postalPattern = /^[0-9]{5}$/
  if (!fields.postalCode.value.trim()) {
    showAlert('⚠️ กรุณากรอกรหัสไปรษณีย์')
    fields.postalCode.classList.add('error')
    fields.postalCode.focus()
    return false
  }
  if (!postalPattern.test(fields.postalCode.value.trim())) {
    showAlert('⚠️ รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก (เช่น 10110)')
    fields.postalCode.classList.add('error')
    fields.postalCode.focus()
    return false
  }

  // Terms
  if (!termsCheckbox.checked) {
    showAlert('⚠️ กรุณายอมรับข้อกำหนดและเงื่อนไข')
    termsCheckbox.focus()
    return false
  }

  // Return cleaned data
  return {
    username: fields.username.value.trim(),
    email: fields.email.value.trim(),
    password: fields.password.value,
    phone: fields.phone.value.trim(),
    dob: fields.dob.value,
    gender: genderValue,
    street: fields.street.value.trim(),
    alley: fields.alley.value.trim(),
    subdistrict: fields.subdistrict.value.trim(),
    district: fields.district.value.trim(),
    province: fields.province.value.trim(),
    postalCode: fields.postalCode.value.trim(),
    role: selectedRole,
  }
}

/* ===== Handle Register (ใช้ Backend API) ===== */
async function handleRegister(e) {
  e.preventDefault()

  const data = validateForm()
  if (!data) return

  setLoading(true)
  hideAlert()

  try {
    // ── เรียก API จริง ──
    const result = await API.register(data)

    if (result.success) {
      const roleLabel = data.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'
      showAlert(
        `✅ สมัครสมาชิกสำเร็จ (${roleLabel})! กำลังนำไปยังหน้าแดชบอร์ด...`,
        'success'
      )

      const dashboard =
        data.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html'

      setTimeout(() => {
        window.location.href = dashboard
      }, 1000)
    }
  } catch (err) {
    // ❌ ถ้า Backend ไม่ทำงาน → fallback เป็น LocalStorage
    console.warn('API register failed, falling back to localStorage:', err.message)

    const storedUsers = JSON.parse(localStorage.getItem('dormFinderUsers') || '[]')

    // Check duplicate
    if (storedUsers.some((u) => u.email === data.email)) {
      showAlert('❌ อีเมลนี้ถูกใช้งานไปแล้ว')
      setLoading(false)
      return
    }

    storedUsers.push(data)
    localStorage.setItem('dormFinderUsers', JSON.stringify(storedUsers))

    // Set session
    const session = {
      username: data.username,
      email: data.email,
      role: data.role,
      loginTime: new Date().toISOString(),
      rememberMe: true,
    }
    localStorage.setItem('dormFinderSession', JSON.stringify(session))

    const roleLabel = data.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'
    showAlert(
      `✅ สมัครสมาชิกสำเร็จ (${roleLabel} — โหมด Local)! กำลังนำไปยังแดชบอร์ด...`,
      'success'
    )

    const dashboard =
      data.role === 'admin' ? 'pages/admin/dashboard.html' : 'pages/user/dashboard.html'

    setTimeout(() => {
      window.location.href = dashboard
    }, 1000)
  }
}

/* ===== Password Strength Indicator ===== */
;(function initPasswordStrength() {
  const pwdInput = document.getElementById('regPassword')
  if (!pwdInput) return

  const indicator = document.createElement('div')
  indicator.style.cssText =
    'margin-top:4px; font-size:0.78rem; font-weight:600; transition:all 0.2s;'
  pwdInput.parentNode.appendChild(indicator)

  pwdInput.addEventListener('input', function () {
    const val = this.value
    if (!val) {
      indicator.textContent = ''
      return
    }
    const strength = getPasswordStrength(val)
    indicator.textContent = `ความแข็งแรงของรหัสผ่าน: ${strength.label}`
    indicator.style.color = strength.color
  })
})()

/* ===== Gender option highlight ===== */
document.querySelectorAll('.gender-option').forEach((opt) => {
  opt.addEventListener('click', function () {
    document.querySelectorAll('.gender-option').forEach((o) => o.classList.remove('selected'))
    this.classList.add('selected')
    const radio = this.querySelector('input[type="radio"]')
    if (radio) radio.checked = true
  })
})

/* ===== Reset clears errors ===== */
registerForm.querySelector('button[type="reset"]').addEventListener('click', function () {
  setTimeout(() => {
    hideAlert()
    document.querySelectorAll('.gender-option').forEach((o) => o.classList.remove('selected'))
    document.querySelectorAll('input').forEach((i) => i.classList.remove('error'))
  }, 10)
})

/* ===== Submit ===== */
registerForm.addEventListener('submit', handleRegister)

/* ===== Init ===== */
;(function init() {
  const userCard = document.querySelector('.role-card[data-role="user"]')
  if (userCard) userCard.classList.add('selected-user')
})()
