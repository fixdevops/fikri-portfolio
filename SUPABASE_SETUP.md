# Supabase Backend Setup Guide

## 📋 Overview

Portfolio ini menggunakan **Supabase** sebagai backend untuk:
- **Authentication** (Email/Password untuk admin, Google OAuth untuk chat)
- **Database** (PostgreSQL untuk semua data)
- **Realtime** (Chat Room dengan real-time updates)

## 🚀 Langkah Setup

### 1. Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com) dan login/register
2. Klik **"New Project"**
3. Isi nama project dan password database
4. Pilih region terdekat (Singapore untuk Indonesia)
5. Tunggu project selesai dibuat

### 2. Setup Database (Tabel)

1. Buka **SQL Editor** di Supabase Dashboard
2. Copy isi file `supabase-setup.sql` yang ada di root project
3. Paste dan klik **Run**
4. Pastikan semua tabel berhasil dibuat:
   - `my_project` - Data proyek
   - `my_certificate` - Data sertifikat
   - `my_blogs` - Data blog
   - `animes` - Data anime
   - `anime_story` - Data reels anime
   - `my_quotes` - Data quotes
   - `my_audios` - Data audio
   - `chat_messages` - Data chat room

### 3. Buat Akun Admin

1. Buka **Authentication** > **Users** di Supabase Dashboard
2. Klik **"Add User"** > **"Create New User"**
3. Masukkan email dan password untuk admin
4. Gunakan email dan password ini untuk login di `/login`

### 4. Setup Environment Variables

1. Buka **Settings** > **API** di Supabase Dashboard
2. Copy **Project URL** dan **anon/public key**
3. Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Setup Google OAuth (Opsional - Untuk Chat Room)

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih yang sudah ada
3. Buka **APIs & Services** > **Credentials**
4. Buat **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Di Supabase Dashboard, buka **Authentication** > **Providers** > **Google**
6. Aktifkan dan masukkan Client ID & Client Secret

### 6. Jalankan Project

```bash
npm install
npm run dev
```

## 📊 Struktur Tabel Database

| Tabel | Deskripsi | Kolom Utama |
|---|---|---|
| `my_project` | Proyek portfolio | title, description, thumbnail, tech_stacks, category |
| `my_certificate` | Sertifikat | title, image_url, course_url, category |
| `my_blogs` | Blog posts | title, slug, content, status, tags |
| `animes` | Koleksi anime | title, genres, episodes, rating, status |
| `anime_story` | Reels anime | title, video_url, thumbnail, hastag |
| `my_quotes` | Kutipan | text, author, category, status |
| `my_audios` | Library audio | title, audio_url, category |
| `chat_messages` | Chat room | text, display_name, photo_url, reply_to |

## 🔒 Keamanan (RLS)

Semua tabel menggunakan Row Level Security (RLS):
- **SELECT (Read)**: Publik - semua orang bisa membaca data
- **INSERT/UPDATE/DELETE (Write)**: Hanya user yang sudah login (authenticated)

## 🔗 Cloudinary (Upload Gambar)

Upload gambar (thumbnail project & sertifikat) menggunakan **Cloudinary**:
- Cloud Name: `dimscumz2`
- Upload Preset: `portfolio_certs`
- Folder: `projects/` dan `certificates/`

## 📁 Struktur File Backend

```
src/
├── supabase.js              # Supabase client configuration
├── components/
│   ├── common/
│   │   └── ProtectedRoute.jsx  # Auth guard untuk admin routes
│   ├── Layout.jsx           # Admin layout dengan logout
│   ├── ChatRoom.jsx         # Real-time chat component
│   ├── CertificatesSection.jsx # Fetch certificates
│   ├── ProjectsSection.jsx  # Fetch projects
│   └── BlogSection.jsx      # Blog section
├── pages/
│   ├── Project.jsx          # Public projects page
│   ├── Certificate.jsx      # Public certificates page
│   ├── Blog.jsx             # Public blog listing
│   ├── DetailBlog.jsx       # Blog detail page
│   └── admin/
│       ├── Login.jsx        # Admin login (Supabase Auth)
│       ├── Dashboard.jsx    # Admin dashboard
│       ├── ManageProject.jsx     # CRUD projects
│       ├── ManageCertificate.jsx # CRUD certificates
│       ├── ManageBlogs.jsx       # CRUD blogs
│       ├── ManageAnime.jsx       # CRUD animes
│       ├── ManageReelsAnime.jsx  # CRUD anime reels
│       ├── ManageQuotes.jsx      # CRUD quotes
│       └── ManageAudio.jsx       # CRUD audios
```
