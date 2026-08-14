# HANDOFF — Migrasi Upload Gambar ke Supabase Storage

> Dokumen ini dibuat agar AI / pengembang lain bisa melanjutkan pekerjaan dengan
> jelas tanpa kehilangan konteks. Dibuat tanggal 2026-07-03.

---

## 1. LATAR BELAKANG & KEPUTUSAN USER

Project `vikri-main` adalah portfolio **frontend-only** (React + Vite, deploy ke Vercel
sebagai static site). Sebelumnya, upload gambar (sertifikat & thumbnail project) pakai
**Cloudinary**. User (pemilik project) minta:

> "Tambahkan Supabase untuk menyimpan foto dll. Jangan langsung masuk ke Supabase,
> tapi ke public dulu lalu ke Supabase, jadi gambar tidak hilang. Apakah ini ada admin?"

### Keputusan yang sudah dikonfirmasi user:
1. **Pakai Supabase Storage dengan bucket PUBLIC** (bukan dual-storage ke folder
   `public/`, bukan buat backend server). Alasan: project frontend-only tidak bisa
   menulis file ke folder `public/` saat runtime. Bucket public = URL gambar bisa
   diakses langsung tanpa login. Gambar **tidak akan hilang** selama bucket Supabase
   tidak dihapus.
2. **Jenis file**: gambar (sertifikat, thumbnail project, thumbnail blog) + foto
   profil & asset lain (opsional, belum dikerjakan).
3. **Pertanyaan "apakah ada admin?"** → SUDAH ADA. Login di `/login` (pakai Supabase
   Auth email/password). Akun admin dibuat manual di Supabase Dashboard →
   Authentication → Users → Add User. Setelah login, redirect ke `/dashboard` yang
   diproteksi `ProtectedRoute`. Lihat daftar rute admin di `src/App.jsx` baris 57-64.

### Catatan interpretasi "public dulu":
User awalnya minta "simpan ke public dulu, baru Supabase". Setelah dijelaskan bahwa
browser tidak bisa menulis ke folder repo saat runtime, user memilih **opsi bucket
PUBLIC Supabase** (URL gambar publik, tidak butuh login untuk melihat, upload hanya
oleh admin). Ini adalah interpretasi yang **direkomendasikan & sudah disepakati**.

---

## 2. YANG SUDAH DIKERJAKAN ✅

### 2.1 File baru: `src/lib/supabaseStorage.js`
Helper reusable untuk semua halaman admin. Berisi:
- `STORAGE_BUCKET = "portfolio-assets"` — nama bucket publik.
- `uploadAsset(file, folder, onProgress)` → upload ke
  `portfolio-assets/{folder}/{timestamp}-{filename}`, return `{ publicUrl, path }`.
  - Validasi: tipe (jpeg/png/webp/gif), max 5MB.
  - Nama file di-sanitize + diberi prefix timestamp supaya unik.
- `deleteAsset(path)` → hapus file dari Storage (skip kalau path kosong).
- `pathFromPublicUrl(url)` → ekstrak path relatif dari public URL Supabase
  (dipakai untuk hapus file lama saat delete record).

### 2.2 `supabase-setup.sql` — ditambah section STORAGE
Ditambahkan sebelum section "ENABLE REALTIME":
- `INSERT INTO storage.buckets` buat bucket `portfolio-assets` (public=true),
  pakai `ON CONFLICT DO NOTHING` (aman di-run ulang).
- 4 storage policies:
  - **SELECT** → `public` (siapa saja bisa lihat gambar).
  - **INSERT / UPDATE / DELETE** → `authenticated` (hanya admin yang login).

### 2.3 `src/pages/admin/ManageCertificate.jsx` ✅ SELESAI
- Hapus import & konstanta Cloudinary.
- Import `uploadAsset, pathFromPublicUrl, deleteAsset` dari helper.
- Ganti `uploadImageToCloudinary` → `uploadImage` (pakai `uploadAsset(file,"certificates")`).
- `handleSubmit` tetap upload dulu → dapat URL → simpan ke tabel `my_certificate`.
- `handleDelete` sekarang juga menghapus gambar lama dari Storage via
  `deleteAsset(pathFromPublicUrl(...))`.

### 2.4 `src/pages/admin/ManageProject.jsx` ✅ SELESAI
- Sama persis polanya, folder `"projects"`, field `thumbnail`.
- `handleDelete` juga hapus thumbnail lama dari Storage.

---

## 3. YANG BELUM DIKERJAKAN ❌ (TODO)

### 3.1 `src/pages/admin/ManageBlogs.jsx` — **SETENGAH JALAN**
- **Status**: BELUM diubah. Saat ini thumbnail HANYA input URL manual
  (lihat baris ~248-255). Belum ada `<input type="file">`.
- **Yang harus dilakukan**:
  1. Tambah import: `import { uploadAsset } from "../../lib/supabaseStorage";`
  2. Tambah state: `const [isUploading, setIsUploading] = useState(false);`
     dan `const [uploadProgress, setUploadProgress] = useState(0);`
  3. Tambah `useRef` untuk file input (perlu import `useRef`).
  4. Buat fungsi `handleThumbnailUpload` mirip `uploadImage` di ManageCertificate.
  5. Di form modal (baris ~247-255), TAMBAH opsi upload file **di samping** input
     URL yang sudah ada (biar fleksibel: admin bisa upload ATAU paste URL).
     Pakai pola drag-drop / klik-to-upload yang sama dengan ManageCertificate
     (baris 257-275 di ManageCertificate.jsx bisa jadi referensi).
  6. Fungsi ini dipanggil saat user pilih file → upload → set `currentBlog.thumbnail`
     ke `publicUrl` yang dihasilkan.
- **Referensi pola lengkap**: lihat `src/pages/admin/ManageCertificate.jsx`
  fungsi `uploadImage` dan blok UI upload-nya.

### 3.2 Foto profil & asset lain (eksplisit diminta user)
- **Status**: BELUM dikerjakan. Foto profil saat ini hardcode di `public/`
  (mis. `public/pp.jpg`, `public/fotoprofile fixz.png`, `public/assets/profil.jpg`).
- **Yang harus dilakukan** (jika user mau): buat halaman admin baru atau section
  di Dashboard untuk upload foto profil → simpan ke Storage folder `"profile"` →
  simpan URL-nya ke tabel baru (mis. `site_settings`) atau hardcode ganti path.
- **Perlu konfirmasi user dulu** apakah benar-benar mau foto profil dinamis.

### 3.3 Logo / icon (user minta: "gantikan logo icon jadi logo yang baik")
- **Status**: BELUM Dikerjakan. User request ini di tengah migrasi storage.
- **Yang harus dilakukan**: Identifikasi logo/icon mana yang dimaksud.
  Kemungkinan: favicon (`public/favicon.png`), logo di Sidebar/Navbar, atau logo
  brand di header. Perlu klarifikasi user: logo mana, dan "logo yang baik" itu
  custom SVG baru atau pakai library icon (sudah ada `lucide-react` &
  `react-icon` di dependency).
- **Cek dulu**: `src/components/Sidebar.jsx`, `src/components/NavNavigate.jsx`,
  `src/components/Layout.jsx`, `index.html` (link favicon).

### 3.4 Update `SUPABASE_SETUP.md`
- **Status**: BELUM diupdate. Tambah section "Setup Storage Bucket":
  - Cara 1 (otomatis): run ulang `supabase-setup.sql` di SQL Editor Supabase
    (section STORAGE sudah ada).
  - Cara 2 (manual): Dashboard Supabase → Storage → New bucket → nama
    `portfolio-assets` → centang "Public bucket".
  - Catat bahwa upload butuh login admin, lihat gambar publik.

### 3.5 Build verify
- **Status**: BELUM. Setelah semua selesai, jalankan `npm run build` untuk
  pastikan tidak ada error import/syntax.

---

## 4. LANGKAH MENGGUNAKAN (UNTUK USER)

Setelah kode selesai, user harus lakukan **SEKALI** di Supabase:

1. Buka Supabase Dashboard → **SQL Editor**.
2. Run ulang file `supabase-setup.sql` (atau minimal section STORAGE di akhirnya).
   Ini bikin bucket `portfolio-assets` + policies-nya.
   - ATAU buat manual: Dashboard → **Storage** → **New bucket** →
     nama: `portfolio-assets`, centang **Public bucket**. Lalu add policies
     (atau run SQL-nya).
3. Pastikan akun admin sudah dibuat: Authentication → Users → Add user.
4. Login di `/login` → buka `/dashboard` → upload gambar via halaman manage.

---

## 5. CATATAN TEKNIS PENTING

- **Bucket WAJIB public** supaya gambar tampil tanpa login. Policy SELECT → `public`.
- **Upload WAJIB login** (policy authenticated) — wajar, cuma admin yang upload.
- **Gambar lama Cloudinary TETAP TAMPIL** (URL lama masih valid), hanya upload
  baru yang pakai Supabase. Tidak perlu migrasi data lama.
- **Progress bar di Storage**: Supabase JS SDK tidak punya native progress event,
  jadi `uploadAsset` pakai progres simulasi (0→10→90→100). Cukup untuk UX.
- Path file di Storage: `portfolio-assets/{folder}/{timestamp}-{sanitized-name}`.
- `pathFromPublicUrl` cuma cocok untuk URL dari bucket ini; URL Cloudinary lama
  akan return string kosong (aman, `deleteAsset` di-skip).

## 6. STRUKTUR FILE RELEVAN

```
src/
├── supabase.js                      # client + fallback noop (TIDAK diubah)
├── lib/
│   └── supabaseStorage.js           # BARU: helper upload/delete
├── components/common/ProtectedRoute.jsx  # proteksi rute admin (TIDAK diubah)
├── pages/admin/
│   ├── Login.jsx                    # login admin (TIDAK diubah)
│   ├── Dashboard.jsx                # dashboard admin (TIDAK diubah)
│   ├── ManageCertificate.jsx        # ✅ dimigrasi Cloudinary→Supabase
│   ├── ManageProject.jsx            # ✅ dimigrasi Cloudinary→Supabase
│   ├── ManageBlogs.jsx              # ❌ BELUM: tambah upload file
│   ├── ManageAnime.jsx              # (tidak tersentuh)
│   ├── ManageReelsAnime.jsx         # (tidak tersentuh, pakai URL video)
│   ├── ManageQuotes.jsx             # (tidak tersentuh)
│   └── ManageAudio.jsx              # (tidak tersentuh)
└── App.jsx                          # routing admin baris 54-64 (TIDAK diubah)

supabase-setup.sql                   # ✅ ditambah section STORAGE
SUPABASE_SETUP.md                    # ❌ BELUM diupdate (section storage)
```

## 7. REGEX / POIN CARI CEPAT

- Cari sisa Cloudinary: `grep -rn "cloudinary\|CLOUDINARY\|upload_preset" src/`
  (harusnya 0 hasil di file yang sudah dimigrasi).
- Cari penggunaan helper: `grep -rn "uploadAsset\|supabaseStorage" src/`
- Tabel DB: `my_project`, `my_certificate`, `my_blogs` (lihat supabase-setup.sql).
