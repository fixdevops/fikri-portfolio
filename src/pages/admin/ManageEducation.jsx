import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Layout from "../../components/Layout";
import {
  Plus, Pencil, Trash2, X, Save,
  GraduationCap, ArrowUp, ArrowDown, ImageOff,
  AlertTriangle,
} from "lucide-react";

const EMPTY = {
  institution: "",
  logo_url: "",
  role: "",
  role_icon: "🎓",
  status: "Present",
  description: "",
  sort_order: 0,
};

const COMMON_ICONS = ["🎓", "🏬", "🏫", "📚", "🏛️", "🖥️", "🔬", "✏️"];

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all";

export default function ManageEducation() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ── fetch ── */
  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  /* ── open modal ── */
  const openCreate = () => {
    const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;
    setForm({ ...EMPTY, sort_order: nextOrder });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      institution: item.institution,
      logo_url:    item.logo_url || "",
      role:        item.role,
      role_icon:   item.role_icon,
      status:      item.status,
      description: item.description || "",
      sort_order:  item.sort_order,
    });
    setEditId(item.id);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY); };

  /* ── save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, updated_at: new Date().toISOString() };
      if (editId) {
        const { error } = await supabase.from("education").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        payload.created_at = new Date().toISOString();
        const { error } = await supabase.from("education").insert([payload]);
        if (error) throw error;
      }
      await fetch();
      closeModal();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("education").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    await fetch();
  };

  /* ── reorder ── */
  const reorder = async (id, direction) => {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const a = items[idx];
    const b = items[swapIdx];
    // swap sort_order
    await Promise.all([
      supabase.from("education").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("education").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    await fetch();
  };

  return (
    <Layout>
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <GraduationCap size={17} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {loading ? "Memuat…" : `${items.length} entri pendidikan`}
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
          <GraduationCap size={30} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Belum ada data pendidikan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-start group hover:border-gray-300 transition-colors"
            >
              {/* logo */}
              <div className="flex-shrink-0">
                {item.logo_url ? (
                  <img
                    src={item.logo_url}
                    alt={item.institution}
                    className="w-14 h-14 object-contain border border-gray-200 rounded-lg p-1 bg-white"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-14 h-14 border border-gray-200 rounded-lg bg-gray-50 items-center justify-center"
                  style={{ display: item.logo_url ? "none" : "flex" }}
                >
                  <ImageOff size={18} className="text-gray-300" />
                </div>
              </div>

              {/* content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                    {item.institution}
                  </h3>
                  <span className="text-xs text-gray-400 flex-shrink-0">{item.status}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono bg-gray-50 border border-gray-200 rounded px-2 py-0.5 mb-2">
                  {item.role_icon} {item.role}
                </span>
                {item.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* actions */}
              <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => reorder(item.id, "up")}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-0 transition-colors"
                  title="Naikkan"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  onClick={() => reorder(item.id, "down")}
                  disabled={idx === items.length - 1}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-0 transition-colors"
                  title="Turunkan"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus"
                >
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
                  {editId ? "Edit Pendidikan" : "Tambah Pendidikan"}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="edu-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Nama Institusi *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    className={inputCls}
                    placeholder="Nama universitas / sekolah…"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    URL Logo
                  </label>
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    className={inputCls}
                    placeholder="https://example.com/logo.png"
                  />
                  {form.logo_url && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={form.logo_url}
                        alt="preview"
                        className="w-12 h-12 object-contain border border-gray-200 rounded-lg p-1 bg-white"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <span className="text-xs text-gray-400">Preview logo</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      Role / Jabatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className={inputCls}
                      placeholder="student / alumni…"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      Status *
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={inputCls}
                    >
                      <option value="Present">Present</option>
                      <option value="Graduated">Graduated</option>
                      <option value="Dropped">Dropped</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Icon Role
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {COMMON_ICONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setForm({ ...form, role_icon: ic })}
                        className={`w-9 h-9 text-lg rounded-lg border transition-all ${
                          form.role_icon === ic
                            ? "border-gray-900 bg-gray-900 text-white shadow"
                            : "border-gray-200 hover:border-gray-400 bg-white"
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={form.role_icon}
                    onChange={(e) => setForm({ ...form, role_icon: e.target.value })}
                    className={`${inputCls} w-24`}
                    placeholder="🎓"
                    maxLength={4}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Pilih dari preset atau ketik emoji sendiri</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Deskripsi
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputCls} resize-none`}
                    placeholder="Deskripsi singkat tentang pendidikan ini…"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Urutan (sort order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className={`${inputCls} w-24`}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Angka lebih kecil tampil di atas</p>
                </div>
              </form>
            </div>

            {/* footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="edu-form"
                disabled={saving}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <Save size={13} />
                {saving ? "Menyimpan…" : editId ? "Update" : "Tambah"}
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
                <p className="text-sm font-semibold text-gray-900">Hapus Pendidikan</p>
                <p className="text-xs text-gray-400">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Yakin ingin menghapus{" "}
              <strong className="text-gray-900">"{deleteTarget.institution}"</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
