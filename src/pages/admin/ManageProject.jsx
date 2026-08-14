import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { uploadAsset, pathFromPublicUrl, deleteAsset } from "../../lib/supabaseStorage";
import Layout from "../../components/Layout";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    linkPreview: "",
    codeUrl: "",
    category: "project",
    techStacks: "",
    featured: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("my_project")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Upload thumbnail project ke Supabase Storage (bucket public).
  const uploadImage = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const { publicUrl } = await uploadAsset(file, "projects", (p) =>
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

  // Convert comma-separated string to array for storage
  const parseTechStacks = (str) => {
    if (!str) return [];
    return str.split(",").map(s => s.trim()).filter(Boolean);
  };

  // Convert techStacks array to comma-separated string for form
  const techStacksToString = (arr) => {
    if (!arr) return "";
    if (typeof arr === "string") return arr;
    if (Array.isArray(arr)) return arr.join(", ");
    // Handle old object format
    if (typeof arr === "object") return Object.values(arr).join(", ");
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let thumbnail = formData.thumbnail;
      if (selectedFile) {
        thumbnail = await uploadImage(selectedFile);
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        thumbnail,
        link_preview: formData.linkPreview,
        code_url: formData.codeUrl,
        category: formData.category,
        tech_stacks: parseTechStacks(formData.techStacks),
        featured: formData.featured,
        updated_at: new Date().toISOString()
      };

      if (editId) {
        const { error } = await supabase
          .from("my_project")
          .update(projectData)
          .eq("id", editId);
        if (error) throw error;
      } else {
        projectData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from("my_project")
          .insert([projectData]);
        if (error) throw error;
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project: ", error);
      alert("Terjadi error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title || "",
      description: project.description || "",
      thumbnail: project.thumbnail || "",
      linkPreview: project.link_preview || "",
      codeUrl: project.code_url || "",
      category: project.category || "project",
      techStacks: techStacksToString(project.tech_stacks),
      featured: project.featured || false,
    });
    setPreviewUrl(project.thumbnail || "");
    setSelectedFile(null);
    setEditId(project.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus project ini?")) {
      const target = projects.find((p) => p.id === id);
      try {
        const { error } = await supabase
          .from("my_project")
          .delete()
          .eq("id", id);
        if (error) throw error;
        // Hapus juga thumbnail lama dari Supabase Storage (opsional, biar rapi).
        if (target?.thumbnail) {
          await deleteAsset(pathFromPublicUrl(target.thumbnail));
        }
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project: ", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      thumbnail: "",
      linkPreview: "",
      codeUrl: "",
      category: "project",
      techStacks: "",
      featured: false
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditId(null);
  };

  const handlePin = async (project) => {
    try {
      const { error } = await supabase
        .from("my_project")
        .update({ is_pinned: !project.is_pinned })
        .eq("id", project.id);
      if (error) throw error;
      setProjects(projects.map(p =>
        p.id === project.id ? { ...p, is_pinned: !p.is_pinned } : p
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              {editId ? "✏️ Edit Project" : "➕ Add New Project"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Nama project..." className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm">
                  <option value="project">Project</option>
                  <option value="template">Template</option>
                  <option value="components">Components</option>
                  <option value="design">Design</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stacks</label>
                <input type="text" name="techStacks" value={formData.techStacks} onChange={handleInputChange} placeholder="ReactJS, TailwindCSS, Supabase" className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm" />
                <p className="text-xs text-gray-400 mt-0.5">Pisahkan dengan koma</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview URL</label>
                <input type="url" name="linkPreview" value={formData.linkPreview} onChange={handleInputChange} placeholder="https://..." className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Github URL</label>
                <input type="url" name="codeUrl" value={formData.codeUrl} onChange={handleInputChange} placeholder="https://github.com/..." className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                <div onClick={() => fileInputRef.current.click()} className="w-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors overflow-hidden" style={{ height: "42px" }}>
                  {previewUrl ? (
                    <div className="flex items-center gap-2 px-2 w-full">
                      <img src={previewUrl} alt="preview" className="h-7 w-10 object-cover rounded" />
                      <span className="text-xs text-gray-500 truncate flex-1">{selectedFile ? selectedFile.name : "Gambar saat ini"}</span>
                      <span className="text-xs text-blue-500 shrink-0">Ganti</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 px-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs">Klik untuk upload thumbnail</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {isUploading && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-gray-600 h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Uploading {uploadProgress}%</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} placeholder="Deskripsi singkat project..." className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm resize-none" />
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              {editId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              )}
              <button type="submit" disabled={isSubmitting || isUploading} className="px-5 py-2 rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50">
                {isUploading ? `Uploading ${uploadProgress}%` : isSubmitting ? "Saving..." : editId ? "Update Project" : "Add Project"}
              </button>
            </div>
          </form>

          {/* Projects List */}
          <div className="py-3 border-b border-gray-200 mb-3">
            <h2 className="text-base font-semibold text-gray-800">All Projects</h2>
          </div>

          {loading ? (
            <div className="text-center py-8"><p className="text-gray-500">Loading projects...</p></div>
          ) : projects.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-400 text-sm">No projects found. Add your first project!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} className="w-full h-36 object-cover" onError={(e) => { e.target.src = "https://via.placeholder.com/300"; }} />
                  ) : (
                    <div className="h-36 w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{project.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${project.category === "project" ? "bg-green-100 text-green-700" : project.category === "template" ? "bg-gray-100 text-gray-700" : project.category === "components" ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {project.category}
                      </span>
                    </div>
                    {project.tech_stacks && Array.isArray(project.tech_stacks) && project.tech_stacks.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.tech_stacks.slice(0, 3).map((tech, i) => (
                          <span key={i} className="text-xs bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 font-mono"># {tech}</span>
                        ))}
                      </div>
                    )}
                    {project.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{project.description}</p>
                    )}
                    <div className="mt-auto pt-2 flex justify-end gap-2">
                      <button onClick={() => handlePin(project)} className={`p-1 rounded transition text-lg ${project.is_pinned ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-400'}`} title={project.is_pinned ? "Unpin dari homepage" : "Pin ke homepage"}>
                        <i className="ri-pushpin-fill"></i>
                      </button>
                      <button onClick={() => handleEdit(project)} className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition" title="Edit">
                        <i className="ri-edit-line text-base"></i>
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition" title="Delete">
                        <i className="ri-delete-bin-line text-base"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}