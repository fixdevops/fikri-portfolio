import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { uploadAsset, pathFromPublicUrl, deleteAsset } from "../../lib/supabaseStorage";
import Layout from "../../components/Layout";
import {
  Plus, Pencil, Trash2, X, Save,
  Briefcase, ArrowUp, ArrowDown, AlertTriangle,
  Tag, Maximize2, Upload, ImageIcon,
} from "lucide-react";

const EMPTY = {
  title: "",
  subtitle: "",
  description: "",
  icon_type: "remix",
  icon_value: "ri-briefcase-4-line",
  icon_bg: "#f3f4f6",
  icon_color: "#374151",
  tags: "",
  tag_color: "gray",
  is_wide: false,
  sort_order: 0,
  logo_size: 40,
  logo_fit: "contain",
  logo_bg: "#f3f4f6",
};

const TAG_COLORS = [
  { value: "gray",   label: "Gray",   cls: "bg-gray-100 text-gray-700" },
  { value: "blue",   label: "Blue",   cls: "bg-blue-100 text-blue-700" },
  { value: "green",  label: "Green",  cls: "bg-green-100 text-green-700" },
  { value: "red",    label: "Red",    cls: "bg-red-100 text-red-700" },
  { value: "purple", label: "Purple", cls: "bg-purple-100 text-purple-700" },
  { value: "amber",  label: "Amber",  cls: "bg-amber-100 text-amber-700" },
  { value: "cyan",   label: "Cyan",   cls: "bg-cyan-100 text-cyan-700" },
];

const TAG_CLS = {
  gray:   "bg-gray-100 text-gray-700",
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-green-100 text-green-700",
  red:    "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  amber:  "bg-amber-100 text-amber-700",
  cyan:   "bg-cyan-100 text-cyan-700",
};

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all";

/* icon preview helper */
function IconPreview({ type, value, bg, color, size = 40, fit = "contain" }) {
  const style = { backgroundColor: bg, color };
  if (type === "image") {
    return (
      <div
        className="rounded-full border border-gray-200 overflow-hidden flex-shrink-0"
        style={{ width: size, height: size, minWidth: size, background: bg }}
      >
        <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: fit }}
          onError={(e) => (e.target.style.display = "none")} />
      </div>
    );
  }
  if (type === "emoji") {
    return (
      <div className="rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ ...style, width: size, height: size, minWidth: size }}>
        {value}
      </div>
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center text-xl flex-shrink-0"
      style={{ ...style, width: size, height: size, minWidth: size }}>
      <i className={value}></i>
    </div>
  );
}

export default function ManageExperience() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl]     = useState("");
  const [uploading, setUploading]       = useState(false);
  const [uploadPct, setUploadPct]       = useState(0);
  const fileInputRef = useRef(null);

  /* ── fetch ── */
  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("experience")
      .select("*")
      .order("sort_order", { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  /* ── open modal ── */
  const openCreate = () => {
    const next = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;
    setForm({ ...EMPTY, sort_order: next });
    setEditId(null);
    setSelectedFile(null);
    setPreviewUrl("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      title:       item.title,
      subtitle:    item.subtitle || "",
      description: item.description || "",
      icon_type:   item.icon_type,
      icon_value:  item.icon_value,
      icon_bg:     item.icon_bg,
      icon_color:  item.icon_color,
      tags:        Array.isArray(item.tags) ? item.tags.join(", ") : "",
      tag_color:   item.tag_color || "gray",
      is_wide:     item.is_wide || false,
      sort_order:  item.sort_order,
      logo_size:   item.logo_size || 40,
      logo_fit:    item.logo_fit  || "contain",
      logo_bg:     item.logo_bg   || item.icon_bg || "#f3f4f6",
    });
    setPreviewUrl(item.icon_type === "image" ? item.icon_value : "");
    setSelectedFile(null);
    setEditId(item.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(EMPTY);
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadPct(0);
  };

  /* ── save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let icon_value = form.icon_value;

      // upload jika tipe image dan ada file baru
      if (form.icon_type === "image" && selectedFile) {
        setUploading(true);
        // hapus gambar lama
        if (editId) {
          const old = items.find((i) => i.id === editId);
          if (old?.icon_type === "image" && old?.icon_value) {
            await deleteAsset(pathFromPublicUrl(old.icon_value));
          }
        }
        const { publicUrl } = await uploadAsset(selectedFile, "experience-icons", (p) => setUploadPct(p));
        icon_value = publicUrl;
        setUploading(false);
      }

      const payload = {
        ...form,
        icon_value,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      };
      if (editId) {
        const { error } = await supabase.from("experience").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        payload.created_at = new Date().toISOString();
        const { error } = await supabase.from("experience").insert([payload]);
        if (error) throw error;
      }
      await load();
      closeModal();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  /* ── delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    // hapus gambar dari storage jika tipe image
    if (deleteTarget.icon_type === "image" && deleteTarget.icon_value) {
      await deleteAsset(pathFromPublicUrl(deleteTarget.icon_value));
    }
    await supabase.from("experience").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    await load();
  };

  /* ── reorder ── */
  const reorder = async (id, dir) => {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx], b = items[swapIdx];
    await Promise.all([
      supabase.from("experience").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("experience").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    await load();
  };

  const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Layout>
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Briefcase size={17} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {loading ? "Memuat…" : `${items.length} entri experience`}
          </span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      {/* list */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <Briefcase size={30} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Belum ada data experience.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-start group hover:border-gray-300 transition-colors"
            >
              {/* icon */}
              <IconPreview
                type={item.icon_type}
                value={item.icon_value}
                bg={item.icon_bg}
                color={item.icon_color}
              />

              {/* content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  {item.is_wide && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                      <Maximize2 size={9} /> wide
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="text-xs text-gray-400 mb-1.5">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${TAG_CLS[item.tag_color] || TAG_CLS.gray}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => reorder(item.id, "up")} disabled={idx === 0}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-0 transition-colors" title="Naik">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => reorder(item.id, "down")} disabled={idx === items.length - 1}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-0 transition-colors" title="Turun">
                  <ArrowDown size={13} />
                </button>
                <button onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Edit">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setDeleteTarget(item)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                {editId ? <Pencil size={15} className="text-gray-500" /> : <Plus size={15} className="text-gray-500" />}
                <span className="text-sm font-semibold text-gray-900">
                  {editId ? "Edit Experience" : "Tambah Experience"}
                </span>
              </div>
              <button onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="exp-form" onSubmit={handleSave} className="space-y-4">

                {/* title & subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Title *</label>
                    <input type="text" required value={form.title}
                      onChange={(e) => f("title", e.target.value)}
                      className={inputCls} placeholder="Frontend Developer" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Subtitle</label>
                    <input type="text" value={form.subtitle}
                      onChange={(e) => f("subtitle", e.target.value)}
                      className={inputCls} placeholder="React.js Enthusiast" />
                  </div>
                </div>

                {/* description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Deskripsi</label>
                  <textarea rows={3} value={form.description}
                    onChange={(e) => f("description", e.target.value)}
                    className={`${inputCls} resize-none`}
                    placeholder="Deskripsi singkat experience ini…" />
                </div>

                {/* icon type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tipe Icon</label>
                  <div className="flex gap-2 mb-3">
                    {["remix","emoji","image"].map((t) => (
                      <button key={t} type="button"
                        onClick={() => f("icon_type", t)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          form.icon_type === t
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}>
                        {t === "remix" ? "Remix Icon" : t === "emoji" ? "Emoji" : "Gambar URL"}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {form.icon_type === "remix" ? "Class (ri-…)" : form.icon_type === "emoji" ? "Emoji" : "URL atau Upload Gambar"}
                      </label>
                      {form.icon_type === "image" ? (
                        <div className="space-y-2">
                          {/* label langsung bungkus input — fix iOS Safari */}
                          <label
                            htmlFor="exp-icon-input"
                            className="w-full border-2 border-dashed border-gray-200 rounded-xl flex items-center gap-2 px-3 py-2 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors active:bg-gray-100"
                          >
                            {previewUrl ? (
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                                style={{ background: form.icon_bg }}>
                                <img src={previewUrl} alt="" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ImageIcon size={14} className="text-gray-300" />
                              </div>
                            )}
                            <span className="text-xs text-gray-400 flex-1 truncate">
                              {selectedFile ? selectedFile.name : "Tap untuk upload gambar"}
                            </span>
                            <Upload size={13} className="text-gray-300 flex-shrink-0" />
                          </label>
                          <input
                            id="exp-icon-input"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              if (!file.type.startsWith("image/")) { alert("Hanya file gambar"); return; }
                              if (file.size > 5 * 1024 * 1024) { alert("Maks 5MB"); return; }
                              setSelectedFile(file);
                              const url = URL.createObjectURL(file);
                              setPreviewUrl(url);
                              f("icon_value", url);
                            }} />
                          {/* progress */}
                          {uploading && (
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="bg-gray-700 h-1.5 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
                            </div>
                          )}
                          {/* atau URL manual */}
                          <input type="url" value={selectedFile ? "" : form.icon_value}
                            onChange={(e) => { f("icon_value", e.target.value); setPreviewUrl(e.target.value); setSelectedFile(null); }}
                            placeholder="Atau paste URL gambar…"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none" />

                          {/* ── Pengaturan Tampilan Logo ── */}
                          {previewUrl && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-3 mt-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sesuaikan Gambar</p>

                              {/* object-fit */}
                              <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">Cara gambar mengisi lingkaran</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { val: "contain", label: "Contain", desc: "Gambar penuh, tidak terpotong" },
                                    { val: "cover",   label: "Cover",   desc: "Mengisi penuh, bisa terpotong" },
                                    { val: "fill",    label: "Fill",    desc: "Peregangan mengisi" },
                                  ].map(({ val, label, desc }) => (
                                    <button key={val} type="button"
                                      onClick={() => f("logo_fit", val)}
                                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                                        (form.logo_fit || "contain") === val
                                          ? "border-gray-900 bg-white shadow"
                                          : "border-gray-200 bg-white hover:border-gray-400"
                                      }`}>
                                      {/* mini preview */}
                                      <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden"
                                        style={{ background: form.logo_bg || "#f3f4f6" }}>
                                        <img src={previewUrl} alt=""
                                          style={{ width: "100%", height: "100%", objectFit: val }} />
                                      </div>
                                      <span className="text-[10px] font-semibold text-gray-700">{label}</span>
                                      <span className="text-[9px] text-gray-400 text-center leading-tight">{desc}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* background lingkaran */}
                              <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">Warna background lingkaran</label>
                                <div className="flex gap-2 flex-wrap items-center">
                                  {["#f3f4f6","white","transparent","#1f2937","#dbeafe","#fce7f3","#dcfce7","#fef9c3"].map((bg) => (
                                    <button key={bg} type="button"
                                      onClick={() => f("logo_bg", bg)}
                                      style={{ background: bg === "transparent" ? "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 10px 10px" : bg }}
                                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                                        (form.logo_bg || "#f3f4f6") === bg ? "border-gray-800 scale-110 shadow" : "border-gray-200 hover:border-gray-400"
                                      }`} title={bg} />
                                  ))}
                                  <input type="color"
                                    value={(form.logo_bg||"#f3f4f6").startsWith("#") ? form.logo_bg : "#f3f4f6"}
                                    onChange={(e) => f("logo_bg", e.target.value)}
                                    className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer p-0.5" title="Warna kustom" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input type="text"
                          value={form.icon_value}
                          onChange={(e) => f("icon_value", e.target.value)}
                          className={inputCls}
                          placeholder={
                            form.icon_type === "remix" ? "ri-reactjs-line" : "💼"
                          } />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">BG Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={form.icon_bg}
                            onChange={(e) => f("icon_bg", e.target.value)}
                            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                          <input type="text" value={form.icon_bg}
                            onChange={(e) => f("icon_bg", e.target.value)}
                            className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Icon Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={form.icon_color}
                            onChange={(e) => f("icon_color", e.target.value)}
                            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                          <input type="text" value={form.icon_color}
                            onChange={(e) => f("icon_color", e.target.value)}
                            className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* preview */}
                  <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <IconPreview
                      type={form.icon_type}
                      value={form.icon_value}
                      bg={form.icon_type === "image" ? (form.logo_bg || form.icon_bg) : form.icon_bg}
                      color={form.icon_color}
                      size={form.icon_type === "image" ? (form.logo_size || 40) : 40}
                      fit={form.logo_fit || "contain"}
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{form.title || "Preview Title"}</p>
                      <p className="text-[10px] text-gray-400">{form.subtitle || "Subtitle"}</p>
                    </div>
                  </div>
                </div>

                {/* tags */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                    <Tag size={10} /> Tags
                  </label>
                  <input type="text" value={form.tags}
                    onChange={(e) => f("tags", e.target.value)}
                    className={inputCls}
                    placeholder="React.js, Next.js, TypeScript" />
                  <p className="text-[10px] text-gray-400 mt-1">Pisahkan dengan koma</p>
                  {form.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                        <span key={t} className={`text-xs px-2 py-0.5 rounded font-medium ${TAG_CLS[form.tag_color] || TAG_CLS.gray}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* tag color */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Warna Tag</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((tc) => (
                      <button key={tc.value} type="button"
                        onClick={() => f("tag_color", tc.value)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                          form.tag_color === tc.value
                            ? "ring-2 ring-offset-1 ring-gray-400 " + tc.cls
                            : tc.cls + " opacity-70 hover:opacity-100"
                        }`}>
                        {tc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* wide + sort */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      Urutan
                    </label>
                    <input type="number" min={1} value={form.sort_order}
                      onChange={(e) => f("sort_order", parseInt(e.target.value) || 0)}
                      className={`${inputCls} w-full`} />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none pb-0.5">
                      <div
                        onClick={() => f("is_wide", !form.is_wide)}
                        className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                          form.is_wide ? "bg-gray-900" : "bg-gray-200"
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.is_wide ? "translate-x-5" : ""
                        }`} />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">Lebar penuh (wide)</span>
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">Kartu mengisi 2 kolom</p>
                  </div>
                </div>
              </form>
            </div>

            {/* footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button type="button" onClick={closeModal}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
                Batal
              </button>
              <button type="submit" form="exp-form" disabled={saving || uploading}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                <Save size={13} />
                {uploading ? `Uploading ${uploadPct}%` : saving ? "Menyimpan…" : editId ? "Update" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Hapus Experience</p>
                <p className="text-xs text-gray-400">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Yakin ingin menghapus <strong className="text-gray-900">"{deleteTarget.title}"</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-1.5 transition-colors">
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
