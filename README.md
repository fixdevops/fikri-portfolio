# NewPortoFixz

Frontend React (Vite) dengan backend Node.js (Express).

## Stack

- Frontend: React + Vite + Tailwind
- Backend: Express + JWT + file-based JSON DB (`backend/src/data/db.json`)

## Menjalankan Lokal

1. Install dependency frontend:

```bash
npm install
```

2. Install dependency backend:

```bash
npm --prefix backend install
```

3. Salin env:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

4. Jalankan backend:

```bash
npm run dev:api
```

5. Jalankan frontend (terminal lain):

```bash
npm run dev
```

Frontend: `http://localhost:6565`  
Backend API: `http://localhost:3000/api`

## Login Admin Default

Diset dari `backend/.env`:

- `ADMIN_EMAIL` (default `admin@example.com`)
- `ADMIN_PASSWORD` (default `admin123`)

Akun admin otomatis dibuat saat backend pertama kali start jika database masih kosong.

## Catatan

- Frontend sekarang memakai shim `firebase/*` lokal (`src/shims`) yang mengarah ke API Node.js.
- Data persisten disimpan di `backend/src/data/db.json`.
