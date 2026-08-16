import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';
import Modal from 'react-modal';
import Layout from '../../components/Layout';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Film,
  Play,
  Hash,
} from 'lucide-react';

Modal.setAppElement('#root');

export default function DashboardStoryAnime() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    hastag: [],
    category: '',
    upload_date: new Date().toISOString().split('T')[0],
    video_url: '',
    thumbnail: ''
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm] = useState('');

  const allHastags = [
    { id: 'alya', name: 'Alya' }, { id: 'yuki', name: 'Yuki' },
    { id: 'mahiru', name: 'Mahiru' }, { id: 'sikhimori', name: 'Sikhimori' },
    { id: 'kuze', name: 'Kuze' }, { id: 'elaina', name: 'Elaina' },
    { id: 'wagiru', name: 'Wagiru' }, { id: 'kuro', name: 'Kuro' },
    { id: 'quotes', name: 'Quotes' }, { id: 'donghua', name: 'Donghua' },
    { id: 'anime', name: 'Anime' }, { id: 'other', name: 'Other' },
    { id: 'foryoupage', name: 'FYP' }
  ];

  const categories = [
    { id: 'anime', name: 'Anime' },
    { id: 'donghua', name: 'Donghua' },
    { id: 'quote', name: 'Quotes' }
  ];

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('anime_story')
        .select('*')
        .order('upload_date', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleHastag = (hastagId) => {
    setFormData({
      ...formData,
      hastag: formData.hastag.includes(hastagId)
        ? formData.hastag.filter(id => id !== hastagId)
        : [...formData.hastag, hastagId]
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => { setIsModalOpen(false); resetForm(); };
  const openVideoModal = (videoUrl) => { setCurrentVideoUrl(videoUrl); setIsVideoModalOpen(true); };
  const closeVideoModal = () => { setIsVideoModalOpen(false); setCurrentVideoUrl(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const storyData = {
        title: formData.title.trim(),
        hastag: formData.hastag,
        category: formData.category,
        upload_date: formData.upload_date,
        video_url: formData.video_url.trim(),
        thumbnail: formData.thumbnail.trim(),
        updated_at: new Date().toISOString()
      };

      if (editId) {
        const { error } = await supabase.from('anime_story').update(storyData).eq('id', editId);
        if (error) throw error;
      } else {
        storyData.created_at = new Date().toISOString();
        const { error } = await supabase.from('anime_story').insert([storyData]);
        if (error) throw error;
      }

      closeModal();
      fetchStories();
    } catch (error) {
      console.error('Error saving story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story) => {
    setFormData({
      title: story.title,
      hastag: story.hastag || [],
      category: story.category,
      upload_date: story.upload_date ? story.upload_date.split('T')[0] : '',
      video_url: story.video_url,
      thumbnail: story.thumbnail || ''
    });
    setEditId(story.id);
    openModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus reels ini?')) {
      try {
        setLoading(true);
        const { error } = await supabase.from('anime_story').delete().eq('id', id);
        if (error) throw error;
        setStories(stories.filter(story => story.id !== id));
      } catch (error) {
        console.error('Error deleting story:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', hastag: [], category: '',
      upload_date: new Date().toISOString().split('T')[0],
      video_url: '', thumbnail: ''
    });
    setEditId(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all";

  return (
    <Layout>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Film size={17} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {loading ? 'Memuat...' : `${stories.length} reels`}
          </span>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus size={14} /> Add Reels
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl overflow-hidden aspect-[9/16]" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <Film size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">Belum ada reels. Tambahkan yang pertama!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer border border-gray-100"
              onClick={() => openVideoModal(story.video_url)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[9/16] bg-gray-100 overflow-hidden">
                {story.thumbnail ? (
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film size={24} className="text-gray-300" />
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play size={16} className="text-gray-900 fill-gray-900 ml-0.5" />
                  </div>
                </div>
                {/* Action buttons */}
                <div
                  className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEdit(story)}
                    className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={12} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
                {/* Category badge */}
                {story.category && (
                  <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-black/60 text-white backdrop-blur-sm">
                    {story.category}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs font-medium text-gray-900 truncate">{story.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(story.upload_date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Story Form"
        className="modal-reels"
        overlayClassName="modal-overlay-reels"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              {editId ? <Pencil size={16} className="text-gray-500" /> : <Plus size={16} className="text-gray-500" />}
              <h2 className="text-base font-semibold text-gray-900">
                {editId ? 'Edit Reels' : 'Add New Reels'}
              </h2>
            </div>
            <button
              onClick={closeModal}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <form id="reels-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputCls} required placeholder="Judul reels..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Upload Date *</label>
                  <input type="date" name="upload_date" value={formData.upload_date} onChange={handleInputChange} className={inputCls} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={inputCls} required>
                    <option value="">Pilih kategori...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Video URL (.mp4) *</label>
                  <input type="url" name="video_url" value={formData.video_url} onChange={handleInputChange} className={inputCls} required placeholder="https://example.com/video.mp4" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Thumbnail URL *</label>
                  <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleInputChange} className={inputCls} required placeholder="https://example.com/image.jpg" />
                  {formData.thumbnail && (
                    <div className="mt-2">
                      <img
                        src={formData.thumbnail}
                        alt="Thumbnail preview"
                        className="h-24 w-auto rounded-lg border border-gray-200 object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                  <Hash size={11} /> Hashtag *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allHastags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleHastag(tag.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                        formData.hastag.includes(tag.id)
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
                {formData.hastag.length === 0 && (
                  <p className="text-[11px] text-amber-500 mt-1.5">Pilih minimal satu hashtag</p>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
              Batal
            </button>
            <button
              type="submit"
              form="reels-form"
              disabled={loading || formData.hastag.length === 0}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <Save size={13} />
              {loading ? 'Menyimpan...' : editId ? 'Update' : 'Tambah'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Video Modal */}
      <Modal
        isOpen={isVideoModalOpen}
        onRequestClose={closeVideoModal}
        contentLabel="Video Player"
        className="modal-video"
        overlayClassName="modal-overlay-reels"
      >
        <div className="relative bg-black rounded-2xl overflow-hidden w-full max-w-2xl mx-auto shadow-2xl">
          <div className="relative pt-[56.25%]">
            <video
              src={currentVideoUrl}
              controls
              autoPlay
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
          <button
            onClick={closeVideoModal}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </Modal>

      <style>{`
        .modal-reels {
          position: fixed; top: 50%; left: 50%; right: auto; bottom: auto;
          margin-right: -50%; transform: translate(-50%, -50%);
          width: 95%; max-width: 540px; outline: none;
        }
        .modal-video {
          position: fixed; top: 50%; left: 50%; right: auto; bottom: auto;
          margin-right: -50%; transform: translate(-50%, -50%);
          width: 95%; max-width: 700px; outline: none;
        }
        .modal-overlay-reels {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0,0,0,0.6); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </Layout>
  );
}
