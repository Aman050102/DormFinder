// ============================================================
// DORM FINDER API — Main Entry
// ============================================================
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRouter } from './routes/auth'

export type Env = {
  Bindings: { DB: D1Database }
}

const app = new Hono<Env>()

app.use('*', logger())
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:8787', 'http://127.0.0.1:3000', 'http://127.0.0.1:8787'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.route('/api', authRouter)

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.notFound((c) => c.json({ success: false, message: 'Route not found' }, 404))
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ success: false, message: 'Internal server error' }, 500)
})

export default app
