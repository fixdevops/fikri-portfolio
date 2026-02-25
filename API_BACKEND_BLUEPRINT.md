# Backend Node.js Blueprint (React Native) - app.pojoktic.my.id

Dokumen ini siap kirim ke tim/teman sebagai referensi implementasi backend production-ready.

## 1) Rekomendasi Stack

Alternatif:
- Express: sederhana, ekosistem besar.
- Fastify: performa lebih tinggi, schema-driven, logging pino native.

Rekomendasi utama:
- Framework: Fastify
- ORM: Prisma
- DB: MySQL
- Auth: JWT Access + Refresh token (rotating refresh token)
- Validation: Zod
- Hash: bcryptjs
- Security: helmet, cors whitelist, rate-limit
- Logging: pino (built-in Fastify)

---

## 2) Struktur Folder (Clean)

```txt
backend-rn-api/
  src/
    app.ts
    server.ts
    config/
      env.ts
      prisma.ts
      plugins.ts
    middleware/
      auth.guard.ts
    utils/
      jwt.ts
      hash.ts
      sanitize.ts
    modules/
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.repository.ts
        auth.schema.ts
      posts/
        post.routes.ts
        post.controller.ts
        post.service.ts
        post.repository.ts
        post.schema.ts
    types/
      fastify.d.ts
  prisma/
    schema.prisma
    seed.ts
  docs/
    deploy-windows-vps.md
    react-native-consumption.md
  .env.example
  package.json
  tsconfig.json
```

---

## 3) Endpoint yang Diminta

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Resource Contoh (Posts)
- GET `/api/posts`
- GET `/api/posts/:id`
- POST `/api/posts`
- PUT `/api/posts/:id`
- DELETE `/api/posts/:id`

---

## 4) Prisma Schema + Migrasi Awal

`prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  name          String?
  passwordHash  String
  posts         Post[]
  refreshTokens RefreshToken[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
}

model RefreshToken {
  id         String   @id
  userId     Int
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash  String
  userAgent  String?
  ipAddress  String?
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

Command migrasi:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## 5) `.env.example`

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="mysql://dbuser:dbpass@127.0.0.1:3306/pojoktic_api"

JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CORS_ORIGINS=https://app.pojoktic.my.id,http://localhost:3000,http://localhost:5173
```

---

## 6) Standar Keamanan

Checklist:
- [x] Input sanitization (recursive sanitizer, anti-XSS)
- [x] Login rate limit (`max 5/minute`)
- [x] CORS whitelist by env
- [x] JWT access + refresh dengan rotation
- [x] Refresh token disimpan dalam bentuk hash
- [x] Global error handler (Zod + fallback 500)

Contoh plugin security:
```ts
await app.register(helmet)
await app.register(cors, { origin: whitelistFn })
await app.register(rateLimit, { global: true, max: 100, timeWindow: '1 minute' })
```

---

## 7) Scripts `package.json`

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "migrate": "prisma migrate deploy",
    "seed": "tsx prisma/seed.ts",
    "lint": "eslint \"src/**/*.ts\""
  }
}
```

---

## 8) Deploy ke VPS Windows (Step-by-step)

### A. Install & Build
```powershell
cd C:\apps\pojoktic-api
npm ci
npx prisma generate
npm run migrate
npm run seed
npm run build
```

### B. Run Production via PM2
```powershell
npm i -g pm2
pm2 start dist/server.js --name pojoktic-api --time
pm2 save
```

Auto-start PM2 di Windows:
```powershell
npm i -g pm2-windows-startup
pm2-startup install
pm2 save
```

### C. Reverse Proxy ke Domain `app.pojoktic.my.id`

Nginx sample:
```nginx
server {
  listen 80;
  server_name app.pojoktic.my.id;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Reload nginx:
```powershell
nginx -s reload
```

---

## 9) Contoh Konsumsi API dari React Native

`axios` instance + interceptor refresh token flow:

```ts
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const api = axios.create({
  baseURL: 'https://app.pojoktic.my.id/api',
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const accessToken = await AsyncStorage.getItem('accessToken')
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let isRefreshing = false
let queue: Array<(token: string | null) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      throw error
    }

    original._retry = true
    const refreshToken = await AsyncStorage.getItem('refreshToken')
    if (!refreshToken) throw error

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((newToken) => {
          if (!newToken) return reject(error)
          original.headers.Authorization = `Bearer ${newToken}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true

    try {
      const { data } = await axios.post('https://app.pojoktic.my.id/api/auth/refresh', { refreshToken })

      await AsyncStorage.setItem('accessToken', data.accessToken)
      await AsyncStorage.setItem('refreshToken', data.refreshToken)

      queue.forEach((cb) => cb(data.accessToken))
      queue = []

      original.headers.Authorization = `Bearer ${data.accessToken}`
      return api(original)
    } catch (e) {
      queue.forEach((cb) => cb(null))
      queue = []
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken'])
      throw e
    } finally {
      isRefreshing = false
    }
  }
)

export default api
```

---

## 10) Checklist Go-Live

- [ ] `.env` production terisi benar
- [ ] JWT secret kuat dan berbeda access/refresh
- [ ] CORS origin whitelist hanya domain valid
- [ ] Login rate-limit aktif
- [ ] HTTPS aktif (SSL valid)
- [ ] PM2 running + auto startup
- [ ] Backup DB terjadwal
- [ ] Monitoring log + alert
- [ ] Uji refresh token flow di perangkat real

### Troubleshooting Umum
- 401 terus: cek header Authorization, expiry token, server time
- CORS block: cek origin app/web + `CORS_ORIGINS`
- Refresh gagal: cek token rotation/revoke logic
- Prisma connect error: cek `DATABASE_URL`, user permission MySQL
- PM2 tidak auto start: ulang `pm2-startup install` lalu `pm2 save`

---

## Quick Commands (Copy-Paste)

```bash
mkdir pojoktic-api && cd pojoktic-api
npm init -y
npm i fastify @fastify/cors @fastify/helmet @fastify/rate-limit dotenv zod jsonwebtoken bcryptjs prisma @prisma/client xss
npm i -D typescript tsx @types/node @types/jsonwebtoken eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx tsc --init
npx prisma init
```
