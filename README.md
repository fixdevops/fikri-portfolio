# Fikri Asyam Portfolio

Frontend React (Vite) dengan backend Supabase.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Realtime)
- Image Upload: Cloudinary
- Comments: Giscus (GitHub Discussions)

## Menjalankan Lokal

1. Install dependency:

```bash
npm install
```

2. Setup Supabase:

   - Buat project di [supabase.com](https://supabase.com)
   - Jalankan SQL dari `supabase-setup.sql` di SQL Editor
   - Buat akun admin di Authentication > Users
   - Lihat panduan lengkap di `SUPABASE_SETUP.md`

3. Salin dan isi environment variables:

```bash
cp .env.example .env
```

Isi `.env` dengan URL dan Key dari Supabase Dashboard (Settings > API):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Jalankan project:

```bash
npm run dev
```

Frontend: `http://localhost:6565`

## Login Admin

Buat akun admin di Supabase Dashboard:
1. Buka **Authentication** > **Users**
2. Klik **Add User** > **Create New User**
3. Masukkan email dan password
4. Gunakan untuk login di `/login`

## Fitur

- 🏠 Homepage dengan profile, projects, certificates, dan blog
- 📁 Manage Projects (CRUD)
- 📄 Manage Certificates (CRUD + Cloudinary upload)
- ✍️ Manage Blogs (CRUD + Markdown editor)
- 🎬 Manage Animes & Reels (CRUD)
- 💬 Manage Quotes (CRUD + status management)
- 🎧 Manage Audio Library (CRUD)
- 💬 Real-time Chat Room (Supabase Realtime + Google OAuth)
- 📝 Guestbook (Giscus - GitHub Discussions)
- 🔒 Protected Admin Dashboard

## Deployment (Vercel)

```bash
npm run build
```

Project sudah dikonfigurasi untuk deploy ke Vercel dengan `vercel.json`.
