import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { uploadAudio, uploadAsset, deleteAsset, pathFromPublicUrl } from '../../lib/supabaseStorage';
import Layout from '../../components/Layout';
import { Pencil, Trash2, ExternalLink, Music2, Save, X, Upload, Link as LinkIcon, Image } from 'lucide-react';

const emptyForm = { title: '', audio_url: '', cover_url: '' };

export default function ManageAudio() {
  const [audios, setAudios]       = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]       = useState(false);

  const [uploadMode, setUploadMode]     = useState('url'); // 'url' | 'file'
  const [audioFile, setAudioFile]       = useState(null);
  const [coverFile, setCoverFile]       = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [progress, setProgress]         = useState(0);
  const [uploadError, setUploadError]   = useState('');

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const fetchAudios = async () => {
    const { data } = await supabase
      .from('my_audios')
      .select('id, title, audio_url, cover_url, created_at')
      .order('created_at', { ascending: false });
    setAudios(data || []);
  };

  useEffect(() => { fetchAudios(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview('');
    setProgress(0);
    setUploadError('');
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setSaving(true);

    try {
      let audioUrl = form.audio_url;
      let coverUrl = form.cover_url;

      // Upload audio file jika mode file
      if (uploadMode === 'file' && audioFile) {
        setProgress(0);
        const result = await uploadAudio(audioFile, (p) => setProgress(Math.round(p * 0.7)));
        audioUrl = result.publicUrl;
      }

      // Upload cover image jika ada
      if (coverFile) {
        const result = await uploadAsset(coverFile, 'audio-covers', (p) => setProgress(70 + Math.round(p * 0.3)));
        coverUrl = result.publicUrl;
      }

      if (!audioUrl.trim()) {
        setUploadError('URL atau file audio tidak boleh kosong.');
        return;
      }

      if (editingId) {
        const old = audios.find(a => a.id === editingId);
        // Hapus file lama dari storage jika diganti
        if (uploadMode === 'file' && audioFile && old?.audio_url) {
          const oldPath = pathFromPublicUrl(old.audio_url);
          if (oldPath) await deleteAsset(oldPath);
        }
        if (coverFile && old?.cover_url) {
          const oldPath = pathFromPublicUrl(old.cover_url);
          if (oldPath) await deleteAsset(oldPath);
        }
        await supabase.from('my_audios')
          .update({ title: form.title, audio_url: audioUrl, cover_url: coverUrl, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        setEditingId(null);
      } else {
        await supabase.from('my_audios')
          .insert([{ title: form.title, audio_url: audioUrl, cover_url: coverUrl, created_at: new Date().toISOString() }]);
      }

      resetForm();
      await fetchAudios();
    } catch (err) {
      setUploadError(err.message || 'Gagal menyimpan audio.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (audio) => {
    setForm({ title: audio.title, audio_url: audio.audio_url, cover_url: audio.cover_url || '' });
    setCoverPreview(audio.cover_url || '');
    setEditingId(audio.id);
    setUploadMode('url');
    setAudioFile(null);
    setCoverFile(null);
    setUploadError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => { resetForm(); setEditingId(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus audio ini?')) return;
    const target = audios.find(a => a.id === id);
    if (target?.audio_url) {
      const p = pathFromPublicUrl(target.audio_url);
      if (p) await deleteAsset(p);
    }
    if (target?.cover_url) {
      const p = pathFromPublicUrl(target.cover_url);
      if (p) await deleteAsset(p);
    }
    await supabase.from('my_audios').delete().eq('id', id);
    setAudios(a => a.filter(x => x.id !== id));
  };

  const handleAudioFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAudioFile(f);
    setUploadError('');
    if (!form.title.trim()) {
      const name = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setForm(prev => ({ ...prev, title: name }));
    }
  };

  const handleCoverFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview('');
    setForm(f => ({ ...f, cover_url: '' }));
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID') : '-';
  const formatSize = (b) => b ? `${(b / 1024 / 1024).toFixed(1)} MB` : '';

  return (
    <Layout>
      <div className="min-h-screen">

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">

          {/* Toggle mode */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
            <button type="button" onClick={() => { setUploadMode('file'); setAudioFile(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${uploadMode === 'file' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Upload size={12} /> Upload File
            </button>
            <button type="button" onClick={() => { setUploadMode('url'); setAudioFile(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${uploadMode === 'url' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <LinkIcon size={12} /> Pakai URL
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">

            {/* Judul */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Judul <span className="text-red-400">*</span>
              </label>
              <input type="text" placeholder="Nama audio..." value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                required />
            </div>

            {/* Audio input */}
            <div>
              {uploadMode === 'file' ? (
                <>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    File Audio <span className="text-red-400">*</span>
                  </label>
                  <label className="flex items-center gap-2 w-full px-3 py-2.5 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-white hover:border-gray-400 cursor-pointer transition-all">
                    <Upload size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-500 truncate">
                      {audioFile ? `${audioFile.name} (${formatSize(audioFile.size)})` : 'Pilih MP3, WAV...'}
                    </span>
                    <input ref={audioInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a"
                      onChange={handleAudioFileChange} className="hidden" />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1">Max 50MB</p>
                </>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Audio URL <span className="text-red-400">*</span>
                  </label>
                  <input type="text" placeholder="https://... atau /assets/nama.mp3"
                    value={form.audio_url}
                    onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    required={uploadMode === 'url'} />
                </>
              )}
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Cover <span className="text-gray-300 font-normal normal-case">(opsional)</span>
              </label>
              {coverPreview ? (
                <div className="relative w-full h-[42px] flex items-center gap-2">
                  <img src={coverPreview} alt="cover" className="w-8 h-8 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate flex-1">
                    {coverFile ? coverFile.name : 'Cover terpasang'}
                  </span>
                  <button type="button" onClick={removeCover}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 w-full px-3 py-2.5 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-white hover:border-gray-400 cursor-pointer transition-all">
                  <Image size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500">Pilih gambar cover...</span>
                  <input ref={coverInputRef} type="file" accept="image/*"
                    onChange={handleCoverFileChange} className="hidden" />
                </label>
              )}
              <p className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP</p>
            </div>

            {/* Tombol */}
            <div className="flex items-end gap-2">
              {editingId && (
                <button type="button" onClick={handleCancel}
                  className="flex-1 h-[42px] bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm flex items-center justify-center gap-1.5 transition-colors">
                  <X size={13} /> Batal
                </button>
              )}
              <button type="submit"
                disabled={saving || (uploadMode === 'file' && !audioFile && !editingId)}
                className="flex-1 h-[42px] bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 transition-colors">
                {saving
                  ? (progress > 0 && progress < 100 ? `${progress}%` : 'Menyimpan...')
                  : <><Save size={13} /> {editingId ? 'Update' : 'Tambah'}</>
                }
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {saving && progress > 0 && (
            <div className="mt-3">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-800 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{progress}% terupload</p>
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <X size={11} /> {uploadError}
            </p>
          )}
        </form>

        {/* List */}
        <div className="flex items-center gap-2 mb-3">
          <Music2 size={14} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-600">Daftar Audio ({audios.length})</h2>
        </div>

        {audios.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <Music2 size={30} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada audio. Tambahkan menggunakan form di atas.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Audio</th>
                  <th className="hidden md:table-cell px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {audios.map(audio => (
                  <tr key={audio.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Cover thumbnail */}
                        {audio.cover_url ? (
                          <img src={audio.cover_url} alt={audio.title}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Music2 size={14} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate max-w-[180px] sm:max-w-xs">{audio.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px] sm:max-w-xs mt-0.5">{audio.audio_url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(audio.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        <a href={audio.audio_url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Preview">
                          <ExternalLink size={13} />
                        </a>
                        <button onClick={() => handleEdit(audio)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(audio.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
                          <Trash2 size={13} />
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
    </Layout>
  );
}
