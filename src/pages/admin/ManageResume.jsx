import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Layout from "../../components/Layout";
import {
  Plus, Pencil, Trash2, Save, X,
  FileText, ExternalLink, ToggleLeft, ToggleRight,
} from "lucide-react";

const COLOR_THEMES = [
  { value: "blue",   label: "Blue",   bg: "bg-blue-100",   text: "text-blue-600",   border: "border-blue-200" },
  { value: "purple", label: "Purple", bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
  { value: "green",  label: "Green",  bg: "bg-green-100",  text: "text-green-600",  border: "border-green-200" },
  { value: "red",    label: "Red",    bg: "bg-red-100",    text: "text-red-600",    border: "border-red-200" },
  { value: "orange", label: "Orange", bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
  { value: "gray",   label: "Gray",   bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200" },
];

const ICON_TYPES = [
  { value: "code",       label: "Code / Frontend" },
  { value: "video",      label: "Video / Creative" },
  { value: "pen",        label: "Pen / Writing" },
  { value: "briefcase",  label: "Briefcase / Business" },
  { value: "star",       label: "Star / General" },
  { value: "shield",     label: "Shield / Cyber Security" },
  { value: "bug",        label: "Bug / Ethical Hacker" },
  { value: "terminal",   label: "Terminal / Red Team" },
  { value: "lock",       label: "Lock / Penetration Testing" },
  { value: "radar",      label: "Radar / Threat Intel" },
  { value: "research",   label: "Flask / Security Research" },
];

function ResumeIcon({ type, colorClass }) {
  const cls = `w-5 h-5 ${colorClass}`;
  switch (type) {
    case "video":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case "pen":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "star":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "bug":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4M4 12H2m20 0h-2M6.34 6.34 4.93 4.93m12.73 12.73 1.41 1.41M6.34 17.66l-1.41 1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case "terminal":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "lock":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case "radar":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12l4.5-4.5" />
        </svg>
      );
    case "research":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l2 2" />
        </svg>
      );
    default: // code
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
  }
}

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  description: "",
  pdf_url: "",
  icon_type: "code",
  color_theme: "blue",
  sort_order: 0,
  is_active: true,
};

export default function ManageResume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("my_resume")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setResumes(data || []);
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0,
        updated_at: new Date().toISOString(),
      };
      if (editId) {
        const { error } = await supabase.from("my_resume").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        payload.created_at = new Date().toISOString();
        const { error } = await supabase.from("my_resume").insert([payload]);
        if (error) throw error;
      }
      resetForm();
      fetchResumes();
    } catch (err) {
      console.error("Error saving resume:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      pdf_url: item.pdf_url || "",
      icon_type: item.icon_type || "code",
      color_theme: item.color_theme || "blue",
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active ?? true,
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus resume ini?")) return;
    try {
      const { error } = await supabase.from("my_resume").delete().eq("id", id);
      if (error) throw error;
      fetchResumes();
    } catch (err) {
      console.error("Error deleting resume:", err);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from("my_resume")
        .update({ is_active: !item.is_active })
        .eq("id", item.id);
      if (error) throw error;
      setResumes((prev) =>
        prev.map((r) => r.id === item.id ? { ...r, is_active: !r.is_active } : r)
      );
    } catch (err) {
      console.error("Error toggling active:", err);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditId(null);
  };

  const selectedTheme = COLOR_THEMES.find((t) => t.value === formData.color_theme) || COLOR_THEMES[0];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="w-full bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              {editId
                ? <><Pencil size={15} className="text-gray-500" /> Edit Resume</>
                : <><Plus size={15} className="text-gray-500" /> Add Resume Card</>}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input
                  type="text" name="title" value={formData.title}
                  onChange={handleChange} required
                  placeholder="e.g. Frontend Focus"
                  className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text" name="subtitle" value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="e.g. Technical skills"
                  className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* PDF URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF URL</label>
                <div className="relative">
                  <ExternalLink size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" name="pdf_url" value={formData.pdf_url}
                    onChange={handleChange}
                    placeholder="/cv/frontdev.pdf atau https://..."
                    className="w-full pl-8 pr-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Path relatif atau URL lengkap ke file PDF</p>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan Tampil</label>
                <input
                  type="number" name="sort_order" value={formData.sort_order}
                  onChange={handleChange} min="0"
                  className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Icon Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select
                  name="icon_type" value={formData.icon_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  {ICON_TYPES.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warna Tema</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.value} type="button"
                      onClick={() => setFormData((p) => ({ ...p, color_theme: theme.value }))}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${theme.bg} ${
                        formData.color_theme === theme.value
                          ? "border-gray-700 scale-110 shadow"
                          : "border-transparent hover:border-gray-400"
                      }`}
                      title={theme.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description" value={formData.description}
                onChange={handleChange} rows={2}
                placeholder="Deskripsi singkat..."
                className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox" id="is_active" name="is_active"
                checked={formData.is_active} onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-gray-700"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Tampilkan di halaman Resume</label>
            </div>

            {/* Preview card */}
            <div className="mt-4 border border-dashed border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2">Preview</p>
              <div className={`bg-white p-4 rounded-lg border ${selectedTheme.border} max-w-xs`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${selectedTheme.bg} p-2 rounded-full`}>
                    <ResumeIcon type={formData.icon_type} colorClass={selectedTheme.text} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{formData.title || "Title"}</h3>
                    <p className="text-xs text-gray-500">{formData.subtitle || "Subtitle"}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-xs mb-3">{formData.description || "Description..."}</p>
                <span className={`text-xs font-medium ${selectedTheme.text}`}>View PDF →</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-4 justify-end">
              {editId && (
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                  <X size={13} /> Cancel
                </button>
              )}
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2 rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5">
                <Save size={13} />
                {isSubmitting ? "Saving..." : editId ? "Update Resume" : "Add Resume"}
              </button>
            </div>
          </form>

          {/* ── List ── */}
          <div className="py-3 border-b border-gray-200 mb-3 flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            <h2 className="text-base font-semibold text-gray-800">All Resume Cards</h2>
          </div>

          {loading ? (
            <div className="text-center py-8"><p className="text-gray-500 text-sm">Loading...</p></div>
          ) : resumes.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-400 text-sm">Belum ada resume. Tambah yang pertama!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((item) => {
                const theme = COLOR_THEMES.find((t) => t.value === item.color_theme) || COLOR_THEMES[0];
                return (
                  <div key={item.id}
                    className={`bg-white border rounded-xl p-4 flex flex-col gap-3 transition ${
                      item.is_active ? "border-gray-200 shadow-sm" : "border-dashed border-gray-200 opacity-60"
                    }`}>
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className={`${theme.bg} p-2 rounded-full flex-shrink-0`}>
                        <ResumeIcon type={item.icon_type} colorClass={theme.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    )}

                    {/* PDF link preview */}
                    {item.pdf_url && (
                      <a href={item.pdf_url} target="_blank" rel="noreferrer"
                        className={`text-xs font-medium ${theme.text} hover:underline flex items-center gap-1`}>
                        <ExternalLink size={11} /> {item.pdf_url}
                      </a>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400">Urutan: {item.sort_order}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleToggleActive(item)}
                          title={item.is_active ? "Sembunyikan" : "Tampilkan"}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                          {item.is_active
                            ? <ToggleRight size={15} className="text-green-500" />
                            : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
