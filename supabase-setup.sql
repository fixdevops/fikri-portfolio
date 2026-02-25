-- ============================================================
-- SUPABASE DATABASE SETUP - Fikri Asyam Portfolio
-- ============================================================
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================================

-- ============================================================
-- 1. TABEL: my_project (Projects)
-- ============================================================
CREATE TABLE IF NOT EXISTS my_project (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  link_preview TEXT,
  code_url TEXT,
  category TEXT DEFAULT 'project' CHECK (category IN ('project', 'template', 'components', 'design')),
  tech_stacks TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. TABEL: my_certificate (Certificates)
-- ============================================================
CREATE TABLE IF NOT EXISTS my_certificate (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  course_url TEXT,
  category TEXT DEFAULT 'certificate' CHECK (category IN ('certificate', 'badge')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. TABEL: my_blogs (Blog Posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS my_blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  thumbnail TEXT,
  reading_time INTEGER DEFAULT 2,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. TABEL: animes (Anime Collection)
-- ============================================================
CREATE TABLE IF NOT EXISTS animes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genres TEXT[] DEFAULT '{}',
  episodes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Completed', 'Upcoming')),
  synopsis TEXT,
  cover_image TEXT,
  embed_url TEXT,
  rating NUMERIC(3,1) DEFAULT 0,
  studio TEXT,
  release_year INTEGER,
  season TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. TABEL: anime_story (Anime Reels/Stories)
-- ============================================================
CREATE TABLE IF NOT EXISTS anime_story (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  hastag TEXT[] DEFAULT '{}',
  category TEXT,
  upload_date DATE DEFAULT CURRENT_DATE,
  video_url TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. TABEL: my_quotes (Quotes Collection)
-- ============================================================
CREATE TABLE IF NOT EXISTS my_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('motivation', 'life', 'love', 'wisdom', 'funny', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. TABEL: my_audios (Audio Library)
-- ============================================================
CREATE TABLE IF NOT EXISTS my_audios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  category TEXT DEFAULT 'quote_random' CHECK (category IN ('sound_efect', 'quote_random', 'arabic', 'islamic', 'jawa', 'india')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. TABEL: chat_messages (Chat Room)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  uid TEXT,
  is_owner BOOLEAN DEFAULT false,
  reply_to JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES (Performance Optimization)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_my_project_category ON my_project(category);
CREATE INDEX IF NOT EXISTS idx_my_project_created_at ON my_project(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_my_project_featured ON my_project(featured);

CREATE INDEX IF NOT EXISTS idx_my_certificate_category ON my_certificate(category);
CREATE INDEX IF NOT EXISTS idx_my_certificate_created_at ON my_certificate(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_my_blogs_slug ON my_blogs(slug);
CREATE INDEX IF NOT EXISTS idx_my_blogs_status ON my_blogs(status);
CREATE INDEX IF NOT EXISTS idx_my_blogs_published_at ON my_blogs(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_animes_created_at ON animes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_animes_status ON animes(status);

CREATE INDEX IF NOT EXISTS idx_anime_story_upload_date ON anime_story(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_anime_story_category ON anime_story(category);

CREATE INDEX IF NOT EXISTS idx_my_quotes_status ON my_quotes(status);
CREATE INDEX IF NOT EXISTS idx_my_quotes_category ON my_quotes(category);
CREATE INDEX IF NOT EXISTS idx_my_quotes_created_at ON my_quotes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_my_audios_category ON my_audios(category);
CREATE INDEX IF NOT EXISTS idx_my_audios_created_at ON my_audios(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at ASC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE my_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_certificate ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE animes ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_story ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ─── PUBLIC READ POLICIES (Semua orang bisa baca) ──────────

CREATE POLICY "Public read access for projects"
  ON my_project FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for certificates"
  ON my_certificate FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for blogs"
  ON my_blogs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for animes"
  ON animes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for anime stories"
  ON anime_story FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for quotes"
  ON my_quotes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for audios"
  ON my_audios FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for chat messages"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── AUTHENTICATED WRITE POLICIES (Hanya user login) ──────

-- Projects: Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert projects"
  ON my_project FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON my_project FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON my_project FOR DELETE
  TO authenticated
  USING (true);

-- Certificates
CREATE POLICY "Authenticated users can insert certificates"
  ON my_certificate FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update certificates"
  ON my_certificate FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete certificates"
  ON my_certificate FOR DELETE
  TO authenticated
  USING (true);

-- Blogs
CREATE POLICY "Authenticated users can insert blogs"
  ON my_blogs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blogs"
  ON my_blogs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blogs"
  ON my_blogs FOR DELETE
  TO authenticated
  USING (true);

-- Animes
CREATE POLICY "Authenticated users can insert animes"
  ON animes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update animes"
  ON animes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete animes"
  ON animes FOR DELETE
  TO authenticated
  USING (true);

-- Anime Stories
CREATE POLICY "Authenticated users can insert anime stories"
  ON anime_story FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update anime stories"
  ON anime_story FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete anime stories"
  ON anime_story FOR DELETE
  TO authenticated
  USING (true);

-- Quotes
CREATE POLICY "Authenticated users can insert quotes"
  ON my_quotes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotes"
  ON my_quotes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete quotes"
  ON my_quotes FOR DELETE
  TO authenticated
  USING (true);

-- Audios
CREATE POLICY "Authenticated users can insert audios"
  ON my_audios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update audios"
  ON my_audios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete audios"
  ON my_audios FOR DELETE
  TO authenticated
  USING (true);

-- Chat Messages: Authenticated users can insert (send messages)
CREATE POLICY "Authenticated users can insert chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- ENABLE REALTIME (Untuk Chat Room)
-- ============================================================
-- Jalankan ini untuk mengaktifkan realtime pada tabel chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================================
-- SELESAI! 🎉
-- ============================================================
-- Setelah menjalankan SQL ini:
-- 1. Buat akun admin di Authentication > Users > Add User
-- 2. Salin URL dan Anon Key dari Settings > API
-- 3. Masukkan ke file .env:
--    VITE_SUPABASE_URL=https://your-project.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key-here
-- 4. Untuk Chat Room dengan Google OAuth:
--    - Pergi ke Authentication > Providers > Google
--    - Aktifkan dan masukkan Google OAuth credentials
-- ============================================================
