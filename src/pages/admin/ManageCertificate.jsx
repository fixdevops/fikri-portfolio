import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { uploadAsset, pathFromPublicUrl, deleteAsset } from "../../lib/supabaseStorage";
import Modal from 'react-modal';
import Layout from "../../components/Layout";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  Award,
  X,
  Save,
  Upload,
  FileText,
  Globe,
  AlertTriangle,
} from "lucide-react";

Modal.setAppElement('#root');

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    image_url: "",
    title: "",
    course_url: "",
    category: "certificate"
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("my_certificate")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching certificates: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
      "text/html"
    ];
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".html", ".htm"];
    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      alert("Format yang diizinkan: JPG, PNG, WebP, PDF, HTML");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB");
      return;
    }
    setSelectedFile(file);
    // Preview hanya untuk gambar
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(""); // PDF/HTML tidak bisa preview langsung
    }
  };

  // Upload gambar ke Supabase Storage (bucket public "portfolio-assets").
  // Hasilnya adalah URL publik yang langsung dipakai untuk menampilkan gambar.
  const uploadImage = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const { publicUrl } = await uploadAsset(file, "certificates", (p) =>
        setUploadProgress(p)
      );
      setUploadProgress(100);
      setIsUploading(false);
      return publicUrl;
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let image_url = formData.image_url;
      let thumbnail_url = formData.thumbnail_url || null;

      if (selectedFile) {
        image_url = await uploadImage(selectedFile);

        // Auto-generate thumbnail kalau file PDF
        if (selectedFile.name.toLowerCase().endsWith(".pdf")) {
          try {
            setIsUploading(true);
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;
            const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pdf-thumbnail`;
            const res = await fetch(fnUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ pdf_url: image_url }),
            });
            const result = await res.json();
            if (result.thumbnail_url) thumbnail_url = result.thumbnail_url;
          } catch (thumbErr) {
            console.warn("Thumbnail generation failed:", thumbErr);
          } finally {
            setIsUploading(false);
          }
        }
      }

      if (!image_url) {
        alert("Harap upload sertifikat terlebih dahulu.");
        setIsSubmitting(false);
        return;
      }

      const certificateData = {
        title: formData.title,
        image_url,
        thumbnail_url,
        course_url: formData.course_url,
        category: formData.category,
        updated_at: new Date().toISOString()
      };

      if (editId) {
        const { error } = await supabase
          .from("my_certificate")
          .update(certificateData)
          .eq("id", editId);
        if (error) throw error;
      } else {
        certificateData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from("my_certificate")
          .insert([certificateData]);
        if (error) throw error;
      }

      resetForm();
      fetchCertificates();
      closeModal();
    } catch (error) {
      console.error("Error saving certificate: ", error);
      alert("Terjadi error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (certificate) => {
    setFormData({
      image_url: certificate.image_url,
      title: certificate.title,
      course_url: certificate.course_url || "",
      category: certificate.category || "certificate",
    });
    setPreviewUrl(certificate.image_url);
    setSelectedFile(null);
    setEditId(certificate.id);
    openModal();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => { setIsModalOpen(false); resetForm(); };

  const openDeleteModal = (id) => { setCertificateToDelete(id); setDeleteModalOpen(true); };
  const closeDeleteModal = () => { setDeleteModalOpen(false); setCertificateToDelete(null); };

  const handleDelete = async () => {
    if (!certificateToDelete) return;
    const target = certificates.find((c) => c.id === certificateToDelete);
    try {
      const { error } = await supabase
        .from("my_certificate")
        .delete()
        .eq("id", certificateToDelete);
      if (error) throw error;
      // Hapus juga gambar lama dari Supabase Storage supaya rapi (opsional).
      if (target?.image_url) {
        await deleteAsset(pathFromPublicUrl(target.image_url));
      }
      fetchCertificates();
    } catch (error) {
      console.error("Error deleting certificate: ", error);
    } finally {
      closeDeleteModal();
    }
  };

  const resetForm = () => {
    setFormData({ image_url: "", title: "", course_url: "", category: "certificate" });
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditId(null);
  };

  const handlePin = async (certificate) => {
    try {
      const { error } = await supabase
        .from("my_certificate")
        .update({ is_pinned: !certificate.is_pinned })
        .eq("id", certificate.id);
      if (error) throw error;
      setCertificates(certificates.map(c =>
        c.id === certificate.id ? { ...c, is_pinned: !c.is_pinned } : c
      ));
    } catch (error) {
      console.error("Error updating pin:", error);
      alert("Gagal update pin: " + error.message);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Award size={17} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">
                {loading ? "Memuat..." : `${certificates.length} sertifikat`}
              </span>
            </div>
            <button onClick={openModal} className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
              <Plus size={14} /> Add Certificate
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <Award size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Belum ada sertifikat.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Preview</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Earned</th>
                    <th className="hidden sm:table-cell px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Category</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {certificates.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {certificate.image_url?.endsWith(".pdf") ? (
                            <FileText size={20} className="text-red-400" />
                          ) : certificate.image_url?.endsWith(".html") || certificate.image_url?.endsWith(".htm") ? (
                            <Globe size={20} className="text-orange-400" />
                          ) : (
                            <img className="h-full w-full object-contain" src={certificate.image_url} alt={certificate.title} onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-xs">{certificate.title}</div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{certificate.category || "certificate"}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handlePin(certificate)}
                            className={`p-1.5 rounded-lg transition-colors ${certificate.is_pinned ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-100'}`}
                            title={certificate.is_pinned ? "Unpin" : "Pin ke homepage"}
                          >
                            <Pin size={14} className={certificate.is_pinned ? "fill-current" : ""} />
                          </button>
                          <button onClick={() => handleEdit(certificate)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => openDeleteModal(certificate.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel={editId ? "Edit Certificate" : "Add Certificate"}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                {editId ? <Pencil size={16} className="text-gray-500" /> : <Plus size={16} className="text-gray-500" />}
                <h2 className="text-base font-semibold text-gray-900">
                  {editId ? "Edit Certificate" : "Add New Certificate"}
                </h2>
              </div>
              <button onClick={closeModal} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="cert-form" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Nama sertifikat..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Upload File <span className="text-gray-400 normal-case font-normal">(JPG, PNG, WebP, PDF, HTML)</span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="w-full border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                      style={{ minHeight: "120px" }}
                    >
                      {selectedFile && selectedFile.type === "application/pdf" ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><FileText size={20} className="text-red-500" /></div>
                          <p className="text-sm font-medium text-gray-700 mt-1">{selectedFile.name}</p>
                          <p className="text-xs text-gray-400">PDF · {(selectedFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                      ) : selectedFile && (selectedFile.name.endsWith(".html") || selectedFile.name.endsWith(".htm")) ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Globe size={20} className="text-orange-500" /></div>
                          <p className="text-sm font-medium text-gray-700 mt-1">{selectedFile.name}</p>
                          <p className="text-xs text-gray-400">HTML · {(selectedFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                      ) : previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="max-h-24 object-contain rounded-lg" />
                      ) : formData.image_url ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <Award size={20} className="text-green-500" />
                          </div>
                          <p className="text-xs text-gray-500">File sudah ada. Klik untuk ganti.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400">
                          <Upload size={24} />
                          <p className="text-sm font-medium text-gray-600 mt-1">Klik untuk pilih file</p>
                          <p className="text-xs">JPG, PNG, WebP, PDF, HTML · Maks 10MB</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf,.html,.htm" onChange={handleFileChange} className="hidden" />
                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-100 rounded-full h-1">
                          <div className="bg-gray-700 h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Uploading {uploadProgress}%</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Course URL</label>
                    <input
                      type="url"
                      name="course_url"
                      value={formData.course_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/course"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    >
                      <option value="certificate">Certificate</option>
                      <option value="badge">Badge</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
                Batal
              </button>
              <button
                type="submit"
                form="cert-form"
                disabled={isSubmitting || isUploading}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <Save size={13} />
                {isUploading ? `Uploading ${uploadProgress}%` : isSubmitting ? "Menyimpan..." : editId ? "Update" : "Tambah"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onRequestClose={closeDeleteModal}
          contentLabel="Delete Confirmation"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Hapus Sertifikat</h2>
                <p className="text-xs text-gray-400">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">Apakah Anda yakin ingin menghapus sertifikat ini?</p>
            <div className="flex justify-end gap-2">
              <button onClick={closeDeleteModal} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-1.5 transition-colors">
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          </div>
        </Modal>

        <style>{`
          .modal { position: fixed; top: 50%; left: 50%; right: auto; bottom: auto; margin-right: -50%; transform: translate(-50%, -50%); width: 90%; max-width: 500px; outline: none; }
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 1000; }
        `}</style>
      </div>
    </Layout>
  );
}