-- DORM FINDER — Seed: สร้าง Admin Account เริ่มต้น
-- ใช้ admin@dormfinder.com / admin1234 ในการล็อกอินครั้งแรก

INSERT OR IGNORE INTO users (username, email, password, role, created_at, updated_at)
VALUES (
  'admin',
  'admin@dormfinder.com',
  -- bcrypt hash of "admin1234" (cost=10)
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  datetime('now'),
  datetime('now')
);
