import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';
import Modal from 'react-modal';
import Layout from '../../components/Layout';

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
    { id: 'quotes', name: 'Quotes' }, { id: 'donghua', name: 'donghua' },
    { id: 'anime', name: 'Anime' }, { id: 'other', name: 'Other' },
    { id: 'foryoupage', name: 'foryoupage' }
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
        const { error } = await supabase
          .from('anime_story')
          .update(storyData)
          .eq('id', editId);
        if (error) throw error;
      } else {
        storyData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('anime_story')
          .insert([storyData]);
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
    if (window.confirm('Are you sure you want to delete this story?')) {
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

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen text-gray-800">
        <div className="container mx-auto max-w-full">
          <button onClick={openModal} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1">
            <i className="ri-add-line"></i> Add New Reels
          </button>

          <div className="flex justify-end mb-6"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-1">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                </div>
              ))
            ) : stories.length === 0 ? (
              <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
                <i className="ri-emotion-sad-line text-2xl text-gray-400"></i>
                <p className="mt-2 text-gray-600">{searchTerm ? 'No stories found matching your search.' : 'No stories found.'}</p>
              </div>
            ) : (
              stories.map((story) => (
                <div key={story.id} className="bg-white rounded-[5px] shadow overflow-hidden hover:shadow-md transition cursor-pointer" onClick={() => openVideoModal(story.video_url)}>
                  {story.thumbnail && (
                    <div className="h-40 overflow-hidden">
                      <img src={story.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1 line-clamp-1">{story.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">{formatDate(story.upload_date)}</span>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleEdit(story)} className="text-gray-600 hover:text-gray-600" title="Edit"><i className="ri-edit-line"></i></button>
                        <button onClick={() => handleDelete(story.id)} className="text-gray-600 hover:text-red-600" title="Delete"><i className="ri-delete-bin-line"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Modal */}
          <Modal isOpen={isModalOpen} onRequestClose={closeModal} contentLabel="Story Form" className="modal-content bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-auto my-8" overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              {editId ? (<><i className="ri-edit-line"></i> Edit Story</>) : (<><i className="ri-add-line"></i> Add New Story</>)}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Title*</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-800" required placeholder="Story title" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Upload Date*</label>
                  <input type="date" name="upload_date" value={formData.upload_date} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-800" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Category*</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-800" required>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-800">Video URL (.mp4)*</label>
                <input type="url" name="video_url" value={formData.video_url} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-800" required placeholder="https://example.com/video.mp4" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-800">Thumbnail URL*</label>
                <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-800" required placeholder="https://example.com/image.jpg" />
                {formData.thumbnail && (
                  <div className="mt-2">
                    <img src={formData.thumbnail} alt="Thumbnail preview" className="max-h-40 rounded border" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL'; }} />
                  </div>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-800">Hastag*</label>
                <div className="flex flex-wrap gap-2">
                  {allHastags.map((hastag) => (
                    <button key={hastag.id} type="button" onClick={() => toggleHastag(hastag.id)} className={`px-3 py-1 text-sm rounded-full border transition ${formData.hastag.includes(hastag.id) ? 'bg-gray-100 border-gray-500 text-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'}`}>
                      {hastag.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" disabled={loading || formData.hastag.length === 0}>
                  {loading ? 'Processing...' : editId ? 'Update Story' : 'Add Story'}
                </button>
              </div>
            </form>
          </Modal>

          {/* Video Modal */}
          <Modal isOpen={isVideoModalOpen} onRequestClose={closeVideoModal} contentLabel="Video Player" className="modal-content bg-black rounded-lg overflow-hidden max-w-4xl w-full mx-auto my-8 relative" overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <div className="relative pt-[56.25%]">
              <video src={currentVideoUrl} controls autoPlay className="absolute top-0 left-0 w-full h-full" />
            </div>
            <button onClick={closeVideoModal} className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">
              <i className="ri-close-line"></i>
            </button>
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
