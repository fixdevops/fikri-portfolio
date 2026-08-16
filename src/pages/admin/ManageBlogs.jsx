import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { uploadAsset, pathFromPublicUrl, deleteAsset } from "../../lib/supabaseStorage";
import Layout from "../../components/Layout";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Clock,
  Upload,
  Save,
  FileText,
  Bold,
  Italic,
  Heading2,
  Link2,
  Code,
  AlertTriangle,
} from "lucide-react";

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [currentBlog, setCurrentBlog] = useState({
    title: '', slug: '', content: '', thumbnail: '', reading_time: 2,
    published_at: null, status: 'draft', excerpt: '', tags: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const thumbInputRef = useRef(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from("my_blogs")
          .select("*")
          .order("published_at", { ascending: false });
        if (error) throw error;
        setBlogs(data || []);
      } catch (error) {
        console.error("Error fetching blogs: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').trim();
  };

  // Upload thumbnail blog ke Supabase Storage (bucket public "portfolio-assets").
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan (JPG, PNG, WebP).");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      e.target.value = "";
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const { publicUrl } = await uploadAsset(file, "blogs", (p) => setUploadProgress(p));
      setCurrentBlog((prev) => ({ ...prev, thumbnail: publicUrl }));
      setUploadProgress(100);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert("Upload gagal: " + (error.message || "Terjadi kesalahan."));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  };

  const handleDeleteClick = (blog) => { setBlogToDelete(blog); setShowDeleteModal(true); };

  const handleEditClick = (blog) => {
    setCurrentBlog({
      ...blog,
      published_at: blog.published_at || new Date().toISOString()
    });
    setModalMode('edit');
    setShowBlogModal(true);
  };

  const handleCreateClick = () => {
    setCurrentBlog({
      title: '', slug: '', content: '', thumbnail: '', reading_time: 2,
      published_at: new Date().toISOString(), status: 'published', excerpt: '', tags: []
    });
    setModalMode('create');
    setShowBlogModal(true);
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase.from("my_blogs").delete().eq("id", blogToDelete.id);
      if (error) throw error;
      // Hapus juga thumbnail lama dari Supabase Storage (opsional, biar rapi).
      if (blogToDelete?.thumbnail) {
        await deleteAsset(pathFromPublicUrl(blogToDelete.thumbnail));
      }
      setBlogs(blogs.filter(blog => blog.id !== blogToDelete.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting blog: ", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' && modalMode === 'create') {
      setCurrentBlog(prev => ({ ...prev, title: value, slug: generateSlug(value) }));
    } else {
      setCurrentBlog(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (e) => {
    setCurrentBlog(prev => ({ ...prev, content: e.target.value }));
  };

  const applyFormat = (format) => {
    const textarea = document.querySelector('textarea[name="content"]');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentBlog.content.substring(start, end);
    let newText = currentBlog.content;
    switch (format) {
      case 'bold': newText = currentBlog.content.substring(0, start) + `**${selectedText}**` + currentBlog.content.substring(end); break;
      case 'italic': newText = currentBlog.content.substring(0, start) + `_${selectedText}_` + currentBlog.content.substring(end); break;
      case 'heading': newText = currentBlog.content.substring(0, start) + `\n## ${selectedText}\n` + currentBlog.content.substring(end); break;
      case 'link': newText = currentBlog.content.substring(0, start) + `[${selectedText}](url)` + currentBlog.content.substring(end); break;
      case 'code': newText = currentBlog.content.substring(0, start) + "```\n" + selectedText + "\n```\n" + currentBlog.content.substring(end); break;
      default: break;
    }
    setCurrentBlog(prev => ({ ...prev, content: newText }));
  };

  const handleDateChange = (e) => {
    setCurrentBlog(prev => ({ ...prev, published_at: new Date(e.target.value).toISOString() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const blogData = {
        title: currentBlog.title,
        slug: currentBlog.slug,
        content: currentBlog.content,
        thumbnail: currentBlog.thumbnail,
        reading_time: parseInt(currentBlog.reading_time) || 2,
        published_at: currentBlog.published_at || new Date().toISOString(),
        status: currentBlog.status,
        excerpt: currentBlog.excerpt,
        tags: Array.isArray(currentBlog.tags) ? currentBlog.tags : (currentBlog.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        updated_at: new Date().toISOString()
      };

      if (modalMode === 'create') {
        blogData.created_at = new Date().toISOString();
        const { data, error } = await supabase.from("my_blogs").insert([blogData]).select();
        if (error) throw error;
        setBlogs([data[0], ...blogs]);
      } else {
        const { error } = await supabase.from("my_blogs").update(blogData).eq("id", currentBlog.id);
        if (error) throw error;
        setBlogs(blogs.map(blog => blog.id === currentBlog.id ? { ...blog, ...blogData } : blog));
      }
      setShowBlogModal(false);
    } catch (error) {
      console.error("Error saving blog: ", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = num => num.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all";

  const formatBtns = [
    { key: "bold", label: "Bold", icon: Bold },
    { key: "italic", label: "Italic", icon: Italic },
    { key: "heading", label: "Heading", icon: Heading2 },
    { key: "link", label: "Link", icon: Link2 },
    { key: "code", label: "Code", icon: Code },
  ];

  return (
    <Layout>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {loading ? "Memuat..." : `${blogs.length} blog post`}
          </span>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Create New
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-700">Belum ada blog</h3>
          <p className="text-sm text-gray-400 mt-1">Buat tulisan pertamamu sekarang</p>
          <button
            onClick={handleCreateClick}
            className="mt-4 inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus size={14} />
            Create Blog
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Blog Post
                </th>
                <th className="hidden sm:table-cell px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden md:table-cell px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Published
                </th>
                <th className="hidden md:table-cell px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Read
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {blog.thumbnail ? (
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            className="h-full w-full object-cover"
                            src={blog.thumbnail}
                            alt={blog.title}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FileText size={14} className="text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate text-sm max-w-[180px] sm:max-w-xs">
                          {blog.title}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          /{blog.slug}
                        </div>
                        <span
                          className={`sm:hidden inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-1 ${
                            blog.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {blog.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        blog.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(blog.published_at)}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={11} />
                      {blog.reading_time} min
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEditClick(blog)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(blog)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Hapus Blog</h3>
                <p className="text-xs text-gray-400">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Yakin ingin menghapus{" "}
              <strong className="text-gray-900">"{blogToDelete?.title}"</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Create/Edit Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                {modalMode === "create" ? (
                  <Plus size={17} className="text-gray-500" />
                ) : (
                  <Pencil size={17} className="text-gray-500" />
                )}
                <h3 className="text-base font-semibold text-gray-900">
                  {modalMode === "create" ? "Create New Blog" : "Edit Blog"}
                </h3>
              </div>
              <button
                onClick={() => setShowBlogModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="blog-form" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={currentBlog.title}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="Judul blog post"
                    />
                  </div>

                  {/* Slug */}
                  {currentBlog.slug && (
                    <p className="text-xs text-gray-400">
                      Slug:{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        /{currentBlog.slug}
                      </code>
                    </p>
                  )}

                  {/* Thumbnail */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Thumbnail
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        name="thumbnail"
                        value={currentBlog.thumbnail}
                        onChange={handleInputChange}
                        className={`${inputCls} flex-1`}
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => thumbInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap flex-shrink-0 transition-colors"
                      >
                        <Upload size={13} />
                        {isUploading ? `${uploadProgress}%` : "Upload"}
                      </button>
                      <input
                        ref={thumbInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </div>
                    {isUploading && (
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
                        <div
                          className="bg-gray-700 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                    {currentBlog.thumbnail && (
                      <div className="mt-2">
                        <img
                          src={currentBlog.thumbnail}
                          alt="Thumbnail preview"
                          className="h-24 object-contain rounded-lg border border-gray-200"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </div>
                    )}
                  </div>

                  {/* Meta fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Reading Time (min)
                      </label>
                      <input
                        type="number"
                        name="reading_time"
                        value={currentBlog.reading_time}
                        onChange={handleInputChange}
                        className={inputCls}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Status
                      </label>
                      <select
                        name="status"
                        value={currentBlog.status}
                        onChange={handleInputChange}
                        className={inputCls}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Publish Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formatDateForInput(currentBlog.published_at)}
                        onChange={handleDateChange}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Content *
                    </label>
                    {/* Format toolbar */}
                    <div className="flex gap-1 mb-2 flex-wrap p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      {formatBtns.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applyFormat(key)}
                          title={label}
                          className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-white hover:shadow-sm transition-all"
                        >
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      name="content"
                      value={currentBlog.content}
                      onChange={handleContentChange}
                      rows={12}
                      className={`${inputCls} font-mono text-xs resize-none`}
                      placeholder="Tulis konten blog dalam Markdown..."
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowBlogModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="blog-form"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-1.5"
              >
                <Save size={14} />
                {modalMode === "create" ? "Buat Blog" : "Update Blog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}