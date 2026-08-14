import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { uploadAsset, pathFromPublicUrl, deleteAsset } from "../../lib/supabaseStorage";
import Layout from "../../components/Layout";

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

  return (
    <Layout>
      <div className="bg-white min-h-screen text-gray-900">
        <section className="max-w-full mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <button onClick={handleCreateClick} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <i className="ri-add-line"></i> Create New
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div></div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">No blogs yet</h3>
              <p className="text-gray-500 mt-1">Get started by creating your first blog post</p>
              <button onClick={handleCreateClick} className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors">
                <i className="ri-add-line"></i> Create Blog
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Read Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {blog.thumbnail && (
                            <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                              <img className="h-full w-full object-cover" src={blog.thumbnail} alt={blog.title} onError={(e) => e.target.style.display = 'none'} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1">{blog.title}</div>
                            <div className="text-xs text-gray-600 mt-1 line-clamp-1">/{blog.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{blog.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(blog.published_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1"><i className="ri-time-line text-gray-400"></i><span className="text-sm text-gray-500">{blog.reading_time} min</span></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEditClick(blog)} className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50 transition-colors" title="Edit"><i className="ri-pencil-line text-lg"></i></button>
                          <button onClick={() => handleDeleteClick(blog)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors" title="Delete"><i className="ri-delete-bin-line text-lg"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete "<strong>{blogToDelete?.title}</strong>"? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Create/Edit Modal */}
        {showBlogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{modalMode === 'create' ? 'Create New Blog' : 'Edit Blog'}</h3>
                <button onClick={() => setShowBlogModal(false)} className="text-gray-400 hover:text-gray-500"><i className="ri-close-line text-xl"></i></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                    <input type="text" name="title" value={currentBlog.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="url" name="thumbnail" value={currentBlog.thumbnail} onChange={handleInputChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800" placeholder="https://example.com/image.jpg (atau upload di kanan)" />
                      <button type="button" onClick={() => thumbInputRef.current?.click()} disabled={isUploading} className="px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap">
                        {isUploading ? `Uploading ${uploadProgress}%` : 'Upload File'}
                      </button>
                      <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                    </div>
                    {isUploading && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gray-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                    {currentBlog.thumbnail && (
                      <div className="mt-2">
                        <img src={currentBlog.thumbnail} alt="Thumbnail preview" className="h-32 object-contain rounded border border-gray-200" onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Bisa upload file (disimpan ke Supabase) atau tempel URL gambar.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (minutes)*</label>
                      <input type="text" name="reading_time" value={currentBlog.reading_time} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                      <select name="status" value={currentBlog.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800">
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date & Time*</label>
                      <input type="datetime-local" value={formatDateForInput(currentBlog.published_at)} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content*</label>
                    <div className="mb-2 flex gap-2 flex-wrap">
                      {['bold', 'italic', 'heading', 'link', 'code'].map(fmt => (
                        <button key={fmt} type="button" onClick={() => applyFormat(fmt)} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200" title={fmt}>
                          <i className={`ri-${fmt === 'bold' ? 'bold' : fmt === 'italic' ? 'italic' : fmt === 'heading' ? 'heading' : fmt === 'link' ? 'link' : 'code-line'}`}></i>
                        </button>
                      ))}
                    </div>
                    <textarea name="content" value={currentBlog.content} onChange={handleContentChange} rows="12" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 font-mono" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowBlogModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2">
                    <i className={modalMode === 'create' ? 'ri-save-line' : 'ri-edit-line'}></i>
                    {modalMode === 'create' ? 'Create Blog' : 'Update Blog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}