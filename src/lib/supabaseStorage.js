import { supabase, isSupabaseConfigured } from "../supabase";

// Nama bucket publik untuk menyimpan semua aset gambar portfolio.
// Bucket dibuat lewat supabase-setup.sql (atau manual di Dashboard Supabase -> Storage).
export const STORAGE_BUCKET = "portfolio-assets";

// Ekstensi yang diizinkan
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
const ALLOWED_DOC_TYPES = ["application/pdf", "text/html"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Membersihkan nama file agar aman dipakai sebagai path di Storage.
const sanitizeFileName = (name) => {
  const base = (name || "file").replace(/[^\w.\-]/g, "_");
  return base.length > 60 ? base.slice(-60) : base;
};

/**
 * Validasi file sebelum di-upload.
 * Throw Error bila tidak valid (ditangkap pemanggil untuk menampilkan pesan).
 */
const validateFile = (file) => {
  if (!file) throw new Error("File tidak ditemukan.");
  const ext = (file.name || "").split(".").pop().toLowerCase();
  const isAllowed =
    ALLOWED_IMAGE_TYPES.includes(file.type) ||
    ALLOWED_DOC_TYPES.includes(file.type) ||
    ["html", "htm"].includes(ext);
  if (!isAllowed) {
    throw new Error("Tipe file tidak diizinkan. Gunakan JPG, PNG, WebP, GIF, PDF, atau HTML.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Ukuran file melebihi batas 10MB.");
  }
};

/**
 * Upload gambar ke Supabase Storage (bucket PUBLIC).
 *
 * @param {File} file - File gambar dari <input type="file">
 * @param {string} folder - Sub-folder, mis. "certificates", "projects", "blogs"
 * @param {(percent:number)=>void} [onProgress] - Callback progres (opsional, best-effort)
 * @returns {Promise<{publicUrl:string, path:string}>} URL publik & path di bucket
 */
export async function uploadAsset(file, folder = "misc", onProgress) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi. Cek VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.");
  }
  validateFile(file);

  const timestamp = Date.now();
  const safeName = sanitizeFileName(file.name);
  const filePath = `${folder}/${timestamp}-${safeName}`;

  // Progres simulasi (Supabase JS tidak menyediakan progress event native).
  onProgress?.(10);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  onProgress?.(90);

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  onProgress?.(100);

  return {
    publicUrl: publicData.publicUrl,
    path: filePath,
  };
}

/**
 * Hapus aset dari Storage berdasarkan path-nya.
 * Aman dipanggil dengan nilai kosong/URL lama (akan di-skip).
 *
 * @param {string} path - Path di dalam bucket (bukan full URL)
 */
export async function deleteAsset(path) {
  if (!path || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) {
      console.warn("Gagal menghapus aset lama:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("deleteAsset error:", err);
    return false;
  }
}

/**
 * Ambil path relatif di dalam bucket dari sebuah public URL Supabase.
 * Berguna saat ingin menghapus file lama berdasarkan URL yang tersimpan di tabel.
 * Return string kosong bila URL bukan dari bucket ini.
 */
export function pathFromPublicUrl(url) {
  if (!url || typeof url !== "string") return "";
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return "";
  return decodeURIComponent(url.slice(idx + marker.length));
}
