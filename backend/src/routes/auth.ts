// ============================================================
// DORM FINDER API — Authentication Routes
//
// POST /api/register        — สมัครสมาชิก (email/password)
// POST /api/login           — เข้าสู่ระบบ (email/password)
// POST /api/auth/firebase   — Firebase Auth (Google / Apple)
// GET  /api/me              — ดูข้อมูลผู้ใช้ปัจจุบัน
// POST /api/logout          — ออกจากระบบ
// ============================================================
import { Hono } from 'hono'
import { hash, compare } from 'bcryptjs'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { Env } from '../index'
import {
  findUserByEmail,
  findUserById,
  createUser,
  createSession,
  findSession,
  deleteSession,
  toSafeUser,
} from '../db'

export const authRouter = new Hono<Env>()

// ─── Firebase project config ─────────────────────────────────
// ตั้งค่าใน Cloudflare dashboard > Worker > Variables
// หรือใส่ใน wrangler.toml > [vars]
const FIREBASE_PROJECT_ID = 'dorm-finder-be63f'

// ─── JWKS สำหรับ verify Firebase id_token ──────────────────
// Firebase public keys: https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
// แต่ jose ใช้ JWKS format ดังนั้นใช้ URL:
//   https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com
const firebaseJWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
)

/**
 * ตรวจสอบ Firebase ID Token และคืนค่า payload
 */
async function verifyFirebaseToken(idToken: string) {
  const { payload } = await jwtVerify(idToken, firebaseJWKS, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
  })
  return payload as {
    sub: string
    email?: string
    name?: string
    picture?: string
    firebase?: { sign_in_provider: string }
  }
}

// ─── POST /api/register ─────────────────────────────────────
authRouter.post('/register', async (c) => {
  try {
    const db = c.env.DB
    const body = await c.req.json()

    // ── Validate required fields ──
    const { username, email, password, role } = body
    if (!username || !email || !password) {
      return c.json(
        { success: false, message: 'กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน' },
        400
      )
    }

    // ── Email format ──
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(email)) {
      return c.json(
        { success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        400
      )
    }

    // ── Password length ──
    if (password.length < 8) {
      return c.json(
        { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' },
        400
      )
    }

    // ── Username length ──
    if (username.trim().length < 3) {
      return c.json(
        { success: false, message: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' },
        400
      )
    }

    // ── Role validation ──
    const userRole: 'user' | 'admin' =
      role === 'admin' ? 'admin' : 'user'

    // ── Check duplicate email ──
    const existing = await findUserByEmail(db, email)
    if (existing) {
      return c.json(
        { success: false, message: 'อีเมลนี้ถูกใช้งานไปแล้ว' },
        409
      )
    }

    // ── Hash password ──
    const hashedPassword = await hash(password, 10)

    // ── Create user ──
    const user = await createUser(db, {
      username: username.trim(),
      email,
      password: hashedPassword,
      phone: body.phone,
      dob: body.dob,
      gender: body.gender,
      role: userRole,
      street: body.street,
      alley: body.alley,
      subdistrict: body.subdistrict,
      district: body.district,
      province: body.province,
      postal_code: body.postalCode,
    })

    // ── Auto-login: create session ──
    const session = await createSession(db, user.id)

    return c.json(
      {
        success: true,
        message:
          userRole === 'admin'
            ? 'สมัครสมาชิกผู้ดูแลระบบสำเร็จ'
            : 'สมัครสมาชิกสำเร็จ',
        token: session.token,
        user,
      },
      201
    )
  } catch (err) {
    console.error('Register error:', err)
    return c.json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' }, 500)
  }
})

// ─── POST /api/login ────────────────────────────────────────
authRouter.post('/login', async (c) => {
  try {
    const db = c.env.DB
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json(
        { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        400
      )
    }

    // ── Find user ──
    const user = await findUserByEmail(db, email)
    if (!user) {
      return c.json(
        { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        401
      )
    }

    // ── Verify password ──
    const valid = await compare(password, user.password)
    if (!valid) {
      return c.json(
        { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        401
      )
    }

    // ── Create session ──
    const session = await createSession(db, user.id)

    return c.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token: session.token,
      user: toSafeUser(user),
    })
  } catch (err) {
    console.error('Login error:', err)
    return c.json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' }, 500)
  }
})

// ─── GET /api/me ────────────────────────────────────────────
authRouter.get('/me', async (c) => {
  try {
    const db = c.env.DB
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        { success: false, message: 'ไม่พบโทเคน (Unauthorized)' },
        401
      )
    }

    const token = authHeader.slice(7)
    const session = await findSession(db, token)

    if (!session) {
      return c.json(
        { success: false, message: 'โทเคนไม่ถูกต้องหรือหมดอายุ' },
        401
      )
    }

    const user = await findUserById(db, session.user_id)
    if (!user) {
      return c.json(
        { success: false, message: 'ไม่พบผู้ใช้งาน' },
        404
      )
    }

    return c.json({
      success: true,
      user: toSafeUser(user),
    })
  } catch (err) {
    console.error('Me error:', err)
    return c.json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' }, 500)
  }
})

// ============================================================
// POST /api/auth/firebase
// รับ Firebase ID Token (จาก Google / Apple Sign-In ฝั่ง Frontend)
// แล้ว find-or-create user ใน D1 database
// ============================================================
authRouter.post('/auth/firebase', async (c) => {
  try {
    const db = c.env.DB
    const { idToken } = await c.req.json()

    if (!idToken) {
      return c.json({ success: false, message: 'Missing idToken' }, 400)
    }

    // ── 1. ตรวจสอบ Firebase ID Token ──
    const payload = await verifyFirebaseToken(idToken)

    const email = payload.email
    if (!email) {
      return c.json(
        { success: false, message: 'Firebase account ต้องมีอีเมล' },
        400
      )
    }

    const name =
      payload.name || email.split('@')[0] || 'firebase_user'
    const picture = payload.picture || null
    const provider = payload.firebase?.sign_in_provider || 'unknown'

    // ── 2. Find or Create User ──
    let existingUser = await findUserByEmail(db, email)

    if (!existingUser) {
      // First time login via Firebase → สร้าง user อัตโนมัติ
      const randomPwd = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      await createUser(db, {
        username: name,
        email,
        password: randomPwd,
        phone: undefined,
        dob: undefined,
        gender: undefined,
        role: 'user',
        street: undefined,
        alley: undefined,
        subdistrict: undefined,
        district: undefined,
        province: undefined,
        postal_code: undefined,
      })

      existingUser = await findUserByEmail(db, email)
    }

    if (!existingUser) {
      return c.json({ success: false, message: 'ไม่สามารถสร้างผู้ใช้ได้' }, 500)
    }

    // ── 3. Create Session ──
    const session = await createSession(db, existingUser.id)

    return c.json({
      success: true,
      message: `เข้าสู่ระบบด้วย ${provider === 'apple.com' ? 'Apple' : 'Google'} สำเร็จ`,
      token: session.token,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
        picture,
      },
    })
  } catch (err: any) {
    console.error('Firebase auth error:', err)

    // ถ้า JWT หมดอายุหรือไม่ถูกต้อง
    if (err.code === 'ERR_JWT_EXPIRED' || err.code === 'ERR_JWT_INVALID') {
      return c.json(
        { success: false, message: 'โทเคน Firebase หมดอายุหรือไม่ถูกต้อง' },
        401
      )
    }

    return c.json(
      { success: false, message: 'Firebase Sign-In ล้มเหลว' },
      500
    )
  }
})

// ─── POST /api/logout ───────────────────────────────────────
authRouter.post('/logout', async (c) => {
  try {
    const db = c.env.DB
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: true, message: 'ออกจากระบบสำเร็จ' })
    }

    const token = authHeader.slice(7)
    await deleteSession(db, token)

    return c.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ',
    })
  } catch (err) {
    console.error('Logout error:', err)
    return c.json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' }, 500)
  }
})
