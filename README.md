# 🏠 Dorm Finder

ระบบจัดการหอพักอัจฉริยะ — ค้นหา จอง และบริหารหอพัก

## 📁 โครงสร้างโปรเจกต์

```
├── index.html                    # หน้า Login (เลือก Role: User / Admin)
├── register.html                 # หน้า Register (แยก Role ชัดเจน)
├── assets/
│   ├── css/style.css             # สไตล์ทั้งหมด
│   └── js/
│       ├── api.js                # API Client ส่วนกลาง
│       ├── login.js              # ฟังก์ชัน Login
│       └── register.js           # ฟังก์ชัน Register
├── pages/
│   ├── user/dashboard.html       # หน้าแรกผู้ใช้ทั่วไป
│   └── admin/dashboard.html      # แดชบอร์ดผู้ดูแลระบบ
└── backend/                      # Hono + D1 API
    ├── package.json
    ├── tsconfig.json
    ├── wrangler.toml
    ├── migrations/0001_create_users.sql
    └── src/
        ├── index.ts              # Entry point (Hono + CORS)
        ├── db.ts                 # Database helpers
        └── routes/auth.ts        # Auth API (register/login/logout/me)
```

## ✨ ฟีเจอร์

- **แยก Role ชัดเจน:** ผู้ใช้ทั่วไป (User) 🟢 / ผู้ดูแลระบบ (Admin) 🔵
- **Login:** เลือก Role ก่อนเข้าสู่ระบบ → ไป dashboard ตาม Role
- **Register:** เลือก Role ตอนสมัคร → ฟอร์มครบ (username, email, password, ที่อยู่ ฯลฯ)
- **Frontend Fallback:** ถ้า Backend ยังไม่เปิด → ใช้ localStorage อัตโนมัติ
- **Backend จริง:** Hono + Cloudflare D1 (SQLite) + bcrypt password

## 🧪 บัญชีทดสอบ (Frontend Fallback)

| บทบาท | อีเมล | รหัสผ่าน |
|-------|-------|---------|
| ผู้ใช้ | `user@dormfinder.com` | `user1234` |
| แอดมิน | `admin@dormfinder.com` | `admin1234` |

## 🚀 เริ่มใช้งาน Backend

```bash
cd backend
npm install
npx wrangler d1 create dorm-finder-db      # สร้าง D1 database (ครั้งแรก)
# เอา database_id ไปใส่ใน wrangler.toml
npm run migrate:local                       # รัน migration
npm run dev                                 # เปิด API ที่ localhost:8787
```

เปิด `index.html` หรือ `register.html` ใน browser → ระบบจะเรียก API จริง พร้อม fallback อัตโนมัติ
