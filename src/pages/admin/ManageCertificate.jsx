import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import Modal from 'react-modal';
import Layout from "../../components/Layout";

const CLOUDINARY_CLOUD_NAME = "dimscumz2";
const CLOUDINARY_UPLOAD_PRESET = "portfolio_certs";

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
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan (JPG, PNG, WebP, dll)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImageToCloudinary = async (file) => {
    setIsUploading(true);
    setUploadProgress(10);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formDataUpload.append("folder", "certificates");
    try {
      setUploadProgress(30);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formDataUpload }
      );
      setUploadProgress(80);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Upload gagal");
      }
      const data = await response.json();
      setUploadProgress(100);
      setIsUploading(false);
      return data.secure_url;
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
      if (selectedFile) {
        image_url = await uploadImageToCloudinary(selectedFile);
      }
      if (!image_url) {
        alert("Harap upload gambar sertifikat terlebih dahulu.");
        setIsSubmitting(false);
        return;
      }

      const certificateData = {
        title: formData.title,
        image_url,
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
    if (certificateToDelete) {
      try {
        const { error } = await supabase
          .from("my_certificate")
          .delete()
          .eq("id", certificateToDelete);
        if (error) throw error;
        fetchCertificates();
      } catch (error) {
        console.error("Error deleting certificate: ", error);
      } finally {
        closeDeleteModal();
      }
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button onClick={openModal} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Add New Certificate</button>
          </div>

          {loading ? (
            <div className="p-6 text-center"><p>Loading certificates...</p></div>
          ) : certificates.length === 0 ? (
            <div className="p-6 text-center"><p>No certificates found. Add your first certificate!</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certificates.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img className="h-16 w-16 object-contain rounded-md" src={certificate.image_url} alt={certificate.title} onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{certificate.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{certificate.category || "certificate"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(certificate)} className="text-gray-600 hover:text-gray-900 mr-4">Edit</button>
                        <button onClick={() => openDeleteModal(certificate.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal isOpen={isModalOpen} onRequestClose={closeModal} contentLabel={editId ? "Edit Certificate" : "Add Certificate"} className="modal" overlayClassName="modal-overlay">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editId ? "Edit Certificate" : "Add New Certificate"}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-md" placeholder="Earned..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar Sertifikat*</label>
                  <div onClick={() => fileInputRef.current.click()} className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors" style={{ minHeight: "130px" }}>
                    {previewUrl ? (<img src={previewUrl} alt="Preview" className="max-h-28 object-contain rounded-md" />) : (
                      <>
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm text-gray-500 font-medium">Klik untuk pilih gambar</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Maks 5MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {isUploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gray-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course URL</label>
                  <input type="url" name="course_url" value={formData.course_url} onChange={handleInputChange} className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-md" placeholder="https://example.com/course" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-md">
                    <option value="certificate">Certificate</option>
                    <option value="badge">Badge</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 border bg-white text-gray-800 border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting || isUploading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50">
                  {isUploading ? `Uploading... ${uploadProgress}%` : isSubmitting ? "Menyimpan..." : editId ? "Update Certificate" : "Add Certificate"}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={deleteModalOpen} onRequestClose={closeDeleteModal} contentLabel="Delete Confirmation" className="modal" overlayClassName="modal-overlay">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Delete Certificate</h2>
            <p className="mb-6 text-gray-800">Are you sure you want to delete this certificate? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeDeleteModal} className="px-4 py-2 border bg-white text-gray-800 border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete</button>
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