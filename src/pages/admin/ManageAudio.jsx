import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import Layout from '../../components/Layout';

export default function ManageAudio() {
  const [audios, setAudios] = useState([]);
  const [filteredAudios, setFilteredAudios] = useState([]);
  const [newAudio, setNewAudio] = useState({
    title: '',
    audio_url: '',
    category: 'quote_random'
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchAudios();
  }, []);

  const fetchAudios = async () => {
    try {
      const { data, error } = await supabase
        .from('my_audios')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const audioList = data || [];
      setAudios(audioList);
      setFilteredAudios(audioList);

      const counts = { all: audioList.length };
      audioList.forEach(audio => {
        counts[audio.category] = (counts[audio.category] || 0) + 1;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching audios:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAudio(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!newAudio.title || !newAudio.audio_url) {
      alert('Please fill all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('my_audios')
          .update({ ...newAudio, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('my_audios')
          .insert([{ ...newAudio, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }

      await fetchAudios();
      setNewAudio({ title: '', audio_url: '', category: 'quote_random' });
    } catch (error) {
      console.error('Error saving audio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (audio) => {
    setNewAudio({
      title: audio.title,
      audio_url: audio.audio_url,
      category: audio.category
    });
    setEditingId(audio.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewAudio({ title: '', audio_url: '', category: 'quote_random' });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this audio?')) {
      try {
        const { error } = await supabase.from('my_audios').delete().eq('id', id);
        if (error) throw error;
        await fetchAudios();
      } catch (error) {
        console.error('Error deleting audio:', error);
      }
    }
  };

  const formatCategory = (category) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const applyFilter = (category) => {
    setActiveFilter(category);
    if (category === 'all') {
      setFilteredAudios(audios);
    } else {
      setFilteredAudios(audios.filter(audio => audio.category === category));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="max-w-full mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div className="w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={newAudio.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg" required placeholder="Title" />
              </div>
              <div className="w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select name="category" value={newAudio.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" required>
                  <option value="sound_efect">Sound Efect</option>
                  <option value="quote_random">Quote Random</option>
                  <option value="arabic">Arabic</option>
                  <option value="islamic">Islamic</option>
                  <option value="jawa">Song Jawa</option>
                  <option value="india">India</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL <span className="text-red-500">*</span></label>
                <input type="url" name="audio_url" value={newAudio.audio_url} onChange={handleInputChange} placeholder="https://example.com/audio.mp3" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" required />
              </div>
              <div className="flex gap-2 w-[260px]">
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="w-full h-[42px] bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300">Cancel</button>
                )}
                <button type="submit" disabled={isSubmitting} className="w-full h-[42px] text-white font-medium rounded-lg bg-gray-600 hover:bg-gray-700 disabled:opacity-70">
                  {isSubmitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Audio' : 'Add Audio')}
                </button>
              </div>
            </div>
          </form>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">List Audio Library</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => applyFilter('all')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${activeFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                All: {categoryCounts.all || 0}
              </button>
              {Object.entries(categoryCounts).filter(([key]) => key !== 'all').map(([category, count]) => (
                <button key={category} onClick={() => applyFilter(category)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${activeFilter === category ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                  {formatCategory(category)}: {count}
                </button>
              ))}
            </div>
          </div>

          {filteredAudios.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAudios.map(audio => (
                    <tr key={audio.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 truncate max-w-xs">{audio.title}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{formatCategory(audio.category)}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(audio.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-4">
                          <a href={audio.audio_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Preview"><i className="ri-external-link-line text-lg"></i></a>
                          <button onClick={() => handleEdit(audio)} className="text-gray-600 hover:text-gray-900" title="Edit"><i className="ri-pencil-line text-lg"></i></button>
                          <button onClick={() => handleDelete(audio.id)} className="text-red-600 hover:text-red-900" title="Delete"><i className="ri-delete-bin-line text-lg"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="ri-music-2-line text-4xl text-gray-400"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{activeFilter === 'all' ? 'No audios found' : `No audios in ${formatCategory(activeFilter)} category`}</h3>
              <p className="text-gray-500">Add your first audio using the form above</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}