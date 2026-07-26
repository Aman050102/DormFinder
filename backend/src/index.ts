// ============================================================
// DORM FINDER API — Main Entry Point (Hono + D1)
// ============================================================
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRouter } from './routes/auth'

// ─── Types ────────────────────────────────────────────────
export type Env = {
  Bindings: {
    DB: D1Database
    FIREBASE_PROJECT_ID?: string
  }
}

const app = new Hono<Env>()

// ─── Middleware ────────────────────────────────────────────
app.use('*', logger())

app.use(
  '/api/*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8787',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8787',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─── Routes ───────────────────────────────────────────────
app.route('/api', authRouter)

// Health check
app.get('/api/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() })
)

// 404 fallback
app.notFound((c) => c.json({ success: false, message: 'Route not found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ success: false, message: 'Internal server error' }, 500)
})

export default app
