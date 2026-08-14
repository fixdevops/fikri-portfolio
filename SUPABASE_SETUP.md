# 🚀 Panduan Setup Supabase Dari Awal (Step-by-Step)

> Panduan ini untuk menghubungkan portfolio dengan Supabase dari NOL.
> Ikuti langkah berurutan dari 1 sampai selesai.

---

## LANGKAH 1 — Buat Akun & Project Supabase

### 1.1 Buat akun Supabase
1. Buka **https://supabase.com** di browser
2. Klik **"Start your project"** → daftar pakai **GitHub** atau **email**
3. Verifikasi email jika daftar pakai email

### 1.2 Buat project baru
1. Login ke dashboard Supabase
2. Klik **"New Project"**
3. Isi form:
   - **Name**: `portfolio-vikri` (bebas, untuk identifikasi aja)
   - **Database Password**: **WAJIB CATAT/DISIMPAN** — ini password database, nanti diperlukan
   - **Region**: pilih **Southeast Asia (Singapore)** — paling dekat dari Indonesia
   - **Plan**: **Free** (cukup untuk portfolio)
4. Klik **"Create new project"**
5. **Tunggu ±2 menit** sampai project selesai dibuat (status "Project is ready")

---

## LANGKAH 2 — Jalankan SQL (Buat Tabel & Storage)

### 2.1 Buka SQL Editor
1. Di dashboard project, klik menu **"SQL Editor"** di sidebar kiri
2. Klik **"New query"**

### 2.2 Paste SQL
1. Buka file **`supabase-setup.sql`** di project ini (di folder root)
2. **Copy SEMUA isi file** tersebut
3. **Paste** ke kolom SQL Editor di Supabase
4. Klik tombol **"Run"** (atau tekan `Ctrl+Enter`)

### 2.3 Verifikasi berhasil
Setelah di-run, cek:
1. Klik menu **"Table Editor"** di sidebar kiri
2. Pastikan muncul tabel berikut:
   - ✅ `my_project`
   - ✅ `my_certificate`
   - ✅ `my_blogs`
   - ✅ `animes`
   - ✅ `anime_story`
   - ✅ `my_quotes`
   - ✅ `my_audios`
   - ✅ `chat_messages`

### 2.4 Verifikasi Storage bucket
1. Klik menu **"Storage"** di sidebar kiri
2. Pastikan ada bucket bernama **`portfolio-assets`**
3. Klik bucket tersebut, pastikan bertulisan **"Public"**

> Jika bucket `portfolio-assets` TIDAK muncul, buat manual:
> 1. Klik **"New bucket"**
> 2. Nama: `portfolio-assets`
> 3. Centang **"Public bucket"**
> 4. Klik **Create bucket**

---

## LANGKAH 3 — Ambil API Key (URL & Anon Key)

### 3.1 Buka Settings
1. Klik ikon **gear ⚙️** di sidebar kiri bawah → **"Project Settings"**
2. Klik menu **"API"** di sebelah kiri

### 3.2 Copy kedua nilai berikut

| Yang dicari | Nama di dashboard | Contoh |
|---|---|---|
| Project URL | **Project URL** | `https://abcdefgh.supabase.co` |
| Anon Public Key | **anon / public** (di kolom Project API keys) | `eyJhbGciOiJIUzI1NiIsInR5c...` |

> ⚠️ **JANGAN** copy `service_role` key — itu rahasia, hanya untuk backend.
> Yang dipakai adalah **anon / public** key saja.

---

## LANGKAH 4 — Isi File `.env` di Project

### 4.1 Buat file `.env`
File `.env` sudah ada (dengan isi contoh). Buka dan ganti isinya:

1. Buka file **`.env`** di root project (folder `D:\Project Jadi\vikri-main`)
2. Ganti isi dengan URL dan Anon Key yang sudah di-copy:

```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> Ganti `abcdefgh` dengan ID project Anda, dan key dengan anon key Anda.

### 4.2 Restart development server
```bash
npm run dev
```
> Supabase membaca `.env` saat pertama kali Vite jalan. Jika `.env` sudah ada
> sebelumnya, cukup restart (`Ctrl+C` lalu `npm run dev` lagi).

---

## LANGKAH 5 — Buat Akun Admin (Email + Password)

### 5.1 Buka Authentication
1. Kembali ke Supabase Dashboard
2. Klik menu **"Authentication"** di sidebar kiri
3. Klik sub-menu **"Users"**

### 5.2 Tambah user admin
1. Klik tombol **"Add user"** (pojok kanan atas)
2. Pilih **"Create new user"**
3. Isi:
   - **Email**: `admin@emailanda.com` (email yang Anda inginkan untuk login)
   - **Password**: buat password minimal 6 karakter (contoh: `Admin123!`)
   - **Auto Confirm User**: ✅ **CENTANG** (supaya tidak perlu verifikasi email)
4. Klik **"Create user"**

> 📝 **CATAT EMAIL & PASSWORD INI!** Ini yang dipakai untuk login di website.

### 5.3 Verifikasi
1. Pastikan user muncul di daftar Users
2. Status user = **"Confirmed"** (karena auto-confirm dicentang)

---

## LANGKAH 6 — Test Login di Website

### 6.1 Jalankan project
```bash
npm run dev
```

### 6.2 Buka halaman login
1. Buka browser → `http://localhost:6565/login`
2. Masukkan **email** dan **password** yang sudah dibuat di Langkah 5
3. Klik **"Login"**
4. Jika berhasil, otomatis redirect ke **`/dashboard`**

### 6.3 Cek admin panel
Dari dashboard, Anda bisa mengakses:
- `/dashboard/frontdev/manage-projects` → Kelola project
- `/dashboard/frontdev/manage-certificates` → Kelola sertifikat
- `/dashboard/frontdev/manage-blogs` → Kelola blog
- `/dashboard/manage-animes` → Kelola anime
- `/dashboard/animes/manage-reels` → Kelola reels anime
- `/dashboard/creator/manage-quotes` → Kelola quotes
- `/dashboard/creator/manage-audio` → Kelola audio

### 6.4 Cek upload gambar
1. Buka **"Manage Certificates"** atau **"Manage Projects"**
2. Klik **"Add New"**
3. Upload gambar → gambar akan tersimpan ke **Supabase Storage** (bucket `portfolio-assets`)
4. Cek di Supabase Dashboard → **Storage** → **portfolio-assets** → file sudah ada di folder `certificates/` atau `projects/`

---

## LANGKAH 7 — Deploy ke Vercel (Opsional)

### 7.1 Setup Environment Variables di Vercel
1. Buka **Vercel Dashboard** → project Anda
2. Klik **"Settings"** → **"Environment Variables"**
3. Tambahkan 2 variable:
   - `VITE_SUPABASE_URL` = `https://abcdefgh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Klik **"Save"**
5. **Redeploy** (atau push commit baru ke GitHub, Vercel auto-deploy)

> ⚠️ **PENTING**: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` HARUS
> juga di-set di Vercel. File `.env` lokal TIDAK dibaca oleh Vercel.

---

## 🆘 Troubleshooting

### Error: "Supabase URL or Anon Key is missing"
- Cek file `.env` — pastikan isinya benar (bukan placeholder `your-project-id`)
- Pastikan restart `npm run dev` setelah mengubah `.env`

### Login gagal: "Invalid login credentials"
- Pastikan email & password BENAR (cek di Supabase → Auth → Users)
- Pastikan user status **"Confirmed"** (bukan "Waiting for email verification")
- Jika belum confirmed, klik user → **"Confirm user"** manual

### Upload gambar gagal
- Pastikan bucket `portfolio-assets` ada di Storage
- Pastikan bucket sudah **Public**
- Pastikan sudah **login admin** (upload butuh authenticated user)
- Cek tab **Policies** di bucket → harus ada 4 policies (SELECT, INSERT, UPDATE, DELETE)

### Error di SQL Editor saat run `supabase-setup.sql`
- Jangan khawatir, run ulang saja — semua query pakai `IF NOT EXISTS` / `ON CONFLICT DO NOTHING`
- Aman di-run berkali-kali

### Lupa password admin?
- Buka Supabase → Authentication → Users → klik user admin
- Klik **"Send reset email"** atau **"Set new password"** manual

---

## 📋 Ringkasan Cepat

| Step | Apa | Di Mana |
|------|-----|---------|
| 1 | Buat project Supabase | supabase.com |
| 2 | Run SQL setup | Supabase → SQL Editor → paste isi `supabase-setup.sql` |
| 3 | Copy URL & Anon Key | Supabase → Settings → API |
| 4 | Isi `.env` di project | File `.env` di root folder |
| 5 | Buat user admin | Supabase → Authentication → Users → Add User |
| 6 | Test login | Buka `localhost:6565/login` |
| 7 | Deploy (opsional) | Set env vars di Vercel → Redeploy |
