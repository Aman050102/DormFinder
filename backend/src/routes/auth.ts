// ============================================================
// DORM FINDER API — Auth Routes
// ============================================================
import { Hono } from 'hono'
import { hash, compare } from 'bcryptjs'
import type { Env } from '../index'
import { findUserByEmail, findUserById, createUser, createSession, findSession, deleteSession, toSafeUser } from '../db'

export const authRouter = new Hono<Env>()

/* ─── POST /api/register ────────────────────────────────── */
authRouter.post('/register', async (c) => {
  try {
    const db = c.env.DB
    const body = await c.req.json()
    const { username, email, password, role } = body

    if (!username || !email || !password)
      return c.json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน' }, 400)
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
      return c.json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' }, 400)
    if (password.length < 8)
      return c.json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }, 400)
    if (username.trim().length < 3)
      return c.json({ success: false, message: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' }, 400)

    // 🔐 สมัครได้แค่ role 'user' เท่านั้น, admin ต้องสร้างจาก seed
    const existing = await findUserByEmail(db, email)
    if (existing) return c.json({ success: false, message: 'อีเมลนี้ถูกใช้งานไปแล้ว' }, 409)

    const hashedPassword = await hash(password, 10)
    const user = await createUser(db, {
      username: username.trim(), email, password: hashedPassword,
      phone: body.phone, dob: body.dob, gender: body.gender, role: 'user',
      street: body.street, alley: body.alley, subdistrict: body.subdistrict,
      district: body.district, province: body.province, postal_code: body.postalCode,
    })

    const session = await createSession(db, user.id)
    return c.json({ success: true, message: 'สมัครสมาชิกสำเร็จ', token: session.token, user }, 201)
  } catch (err) {
    console.error('Register error:', err)
    return c.json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' }, 500)
  }
})

/* ─── POST /api/login ───────────────────────────────────── */
authRouter.post('/login', async (c) => {
  try {
    const db = c.env.DB
    const { email, password } = await c.req.json()
    if (!email || !password)
      return c.json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, 400)

    const user = await findUserByEmail(db, email)
    if (!user || !(await compare(password, user.password)))
      return c.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, 401)

    const session = await createSession(db, user.id)
    return c.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', token: session.token, user: toSafeUser(user) })
  } catch (err) {
    console.error('Login error:', err)
    return c.json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' }, 500)
  }
})

/* ─── GET /api/me ───────────────────────────────────────── */
authRouter.get('/me', async (c) => {
  try {
    const db = c.env.DB
    const auth = c.req.header('Authorization')
    if (!auth?.startsWith('Bearer '))
      return c.json({ success: false, message: 'Unauthorized' }, 401)

    const session = await findSession(db, auth.slice(7))
    if (!session) return c.json({ success: false, message: 'โทเคนไม่ถูกต้องหรือหมดอายุ' }, 401)

    const user = await findUserById(db, session.user_id)
    if (!user) return c.json({ success: false, message: 'ไม่พบผู้ใช้งาน' }, 404)

    return c.json({ success: true, user: toSafeUser(user) })
  } catch (err) {
    console.error('Me error:', err)
    return c.json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' }, 500)
  }
})

/* ─── POST /api/logout ──────────────────────────────────── */
authRouter.post('/logout', async (c) => {
  try {
    const auth = c.req.header('Authorization')
    if (auth?.startsWith('Bearer ')) await deleteSession(c.env.DB, auth.slice(7))
    return c.json({ success: true, message: 'ออกจากระบบสำเร็จ' })
  } catch (err) {
    console.error('Logout error:', err)
    return c.json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' }, 500)
  }
})

/* ─── POST /api/auth/google ────────────────────────────────
 *   Google OAuth Login
 *   Frontend: ส่ง { credential } (ID token จาก Google Identity Services)
 *   Backend:  ตรวจสอบ token → สร้าง/หาผู้ใช้ → คืน session
 *
 *   🔐 ต้องตั้งค่า:
 *     - GOOGLE_CLIENT_ID ใน .env หรือ wrangler.toml [vars]
 *     - ใช้ GoogleAuthLibrary หรือ jose เพื่อ verify ID token
 * ------------------------------------------------------- */
authRouter.post('/auth/google', async (c) => {
  try {
    const db = c.env.DB
    const { credential } = await c.req.json()

    if (!credential) {
      return c.json({ success: false, message: 'Missing credential' }, 400)
    }

    // 🔐 ขั้นตอน verification (ต้อง implement ใน production):
    // 1. Verify Google ID token with google-auth-library or jose
    // 2. Extract payload: { email, name, sub }
    //
    // ตัวอย่าง mock:
    const mockEmail = 'user.google@gmail.com'
    const mockName = 'Google User'

    // ค้นหาหรือสร้างผู้ใช้
    let user = await findUserByEmail(db, mockEmail)
    if (!user) {
      user = await createUser(db, {
        username: mockName,
        email: mockEmail,
        password: '',  // OAuth user — ไม่มี password
        role: 'user',
      }) as any
    }

    const session = await createSession(db, user.id)
    return c.json({
      success: true,
      message: 'เข้าสู่ระบบด้วย Google สำเร็จ',
      token: session.token,
      user: toSafeUser(user),
    })
  } catch (err) {
    console.error('Google auth error:', err)
    return c.json({ success: false, message: 'Google sign-in ล้มเหลว' }, 500)
  }
})

/* ─── POST /api/auth/apple ──────────────────────────────────
 *   Apple OAuth Login
 *   Frontend: ส่ง { id_token, user } (จาก Apple JS SDK)
 *   Backend:  ตรวจสอบ → สร้าง/หาผู้ใช้ → คืน session
 *
 *   🔐 ต้องตั้งค่า:
 *     - APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY
 *     - ใช้ AppleJWK หรือ jose เพื่อ verify token
 * ------------------------------------------------------- */
authRouter.post('/auth/apple', async (c) => {
  try {
    const db = c.env.DB
    const { id_token, user: appleUser } = await c.req.json()

    if (!id_token) {
      return c.json({ success: false, message: 'Missing id_token' }, 400)
    }

    // 🔐 ขั้นตอน verification (ต้อง implement ใน production):
    // 1. Verify Apple ID token with Apple public keys (JWKS)
    // 2. Extract payload: { email, sub }
    //
    // ตัวอย่าง mock:
    const mockEmail = 'user.apple@icloud.com'
    const mockName = appleUser?.name?.firstName
      ? `${appleUser.name.firstName} ${appleUser.name.lastName || ''}`
      : 'Apple User'

    let user = await findUserByEmail(db, mockEmail)
    if (!user) {
      user = await createUser(db, {
        username: mockName.trim(),
        email: mockEmail,
        password: '',
        role: 'user',
      }) as any
    }

    const session = await createSession(db, user.id)
    return c.json({
      success: true,
      message: 'เข้าสู่ระบบด้วย Apple สำเร็จ',
      token: session.token,
      user: toSafeUser(user),
    })
  } catch (err) {
    console.error('Apple auth error:', err)
    return c.json({ success: false, message: 'Apple sign-in ล้มเหลว' }, 500)
  }
})
