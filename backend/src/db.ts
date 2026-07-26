// ============================================================
// DORM FINDER API — Database Helpers
// ============================================================

export type UserRow = {
  id: number; username: string; email: string; password: string
  phone: string | null; dob: string | null; gender: string | null
  role: 'user' | 'admin'
  street: string | null; alley: string | null; subdistrict: string | null
  district: string | null; province: string | null; postal_code: string | null
  created_at: string; updated_at: string
}

export type SessionRow = {
  id: number; user_id: number; token: string; expires_at: string; created_at: string
}

export type SafeUser = Omit<UserRow, 'password'>

export function toSafeUser(user: UserRow): SafeUser {
  const { password, ...safe } = user
  return safe
}

export async function findUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
  return (await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>()) ?? null
}

export async function findUserById(db: D1Database, id: number): Promise<UserRow | null> {
  return (await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>()) ?? null
}

export async function createUser(
  db: D1Database,
  data: {
    username: string; email: string; password: string
    phone?: string; dob?: string; gender?: string; role: 'user' | 'admin'
    street?: string; alley?: string; subdistrict?: string; district?: string
    province?: string; postal_code?: string
  }
): Promise<SafeUser> {
  const result = await db.prepare(
    `INSERT INTO users (username,email,password,phone,dob,gender,role,street,alley,subdistrict,district,province,postal_code)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING *`
  ).bind(
    data.username, data.email, data.password,
    data.phone ?? null, data.dob ?? null, data.gender ?? null, data.role,
    data.street ?? null, data.alley ?? null, data.subdistrict ?? null,
    data.district ?? null, data.province ?? null, data.postal_code ?? null
  ).first<UserRow>()
  if (!result) throw new Error('Failed to create user')
  return toSafeUser(result)
}

export function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createSession(db: D1Database, userId: number): Promise<SessionRow> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const result = await db.prepare(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?,?,?) RETURNING *'
  ).bind(userId, token, expiresAt).first<SessionRow>()
  if (!result) throw new Error('Failed to create session')
  return result
}

export async function findSession(db: D1Database, token: string): Promise<SessionRow | null> {
  return (await db.prepare(
    'SELECT * FROM sessions WHERE token = ? AND expires_at > ? LIMIT 1'
  ).bind(token, new Date().toISOString()).first<SessionRow>()) ?? null
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
}

export async function deleteUserSessions(db: D1Database, userId: number): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run()
}
