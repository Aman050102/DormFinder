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

    const userRole: 'user' | 'admin' = role === 'admin' ? 'admin' : 'user'

    const existing = await findUserByEmail(db, email)
    if (existing) return c.json({ success: false, message: 'อีเมลนี้ถูกใช้งานไปแล้ว' }, 409)

    const hashedPassword = await hash(password, 10)
    const user = await createUser(db, {
      username: username.trim(), email, password: hashedPassword,
      phone: body.phone, dob: body.dob, gender: body.gender, role: userRole,
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
