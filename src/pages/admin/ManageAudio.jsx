import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import Layout from '../../components/Layout';
import {
  Pencil,
  Trash2,
  ExternalLink,
  Music2,
  Save,
  X,
} from 'lucide-react';

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
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title <span className="text-red-400">*</span></label>
                <input type="text" name="title" value={newAudio.title} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-gray-50 focus:bg-white text-gray-800 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all" required placeholder="Audio title" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category <span className="text-red-400">*</span></label>
                <select name="category" value={newAudio.category} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all" required>
                  <option value="sound_efect">Sound Effect</option>
                  <option value="quote_random">Quote Random</option>
                  <option value="arabic">Arabic</option>
                  <option value="islamic">Islamic</option>
                  <option value="jawa">Song Jawa</option>
                  <option value="india">India</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Audio URL <span className="text-red-400">*</span></label>
                <input type="url" name="audio_url" value={newAudio.audio_url} onChange={handleInputChange} placeholder="https://example.com/audio.mp3" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all" required />
              </div>
              <div className="flex gap-2 items-end">
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="flex-1 h-[42px] bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 text-sm flex items-center justify-center gap-1.5 transition-colors">
                    <X size={13} /> Batal
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} className="flex-1 h-[42px] text-white font-medium rounded-xl bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-sm flex items-center justify-center gap-1.5 transition-colors">
                  <Save size={13} />
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Music2 size={15} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Audio Library</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => applyFilter('all')} className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${activeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                All ({categoryCounts.all || 0})
              </button>
              {Object.entries(categoryCounts).filter(([key]) => key !== 'all').map(([category, count]) => (
                <button key={category} onClick={() => applyFilter(category)} className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${activeFilter === category ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {formatCategory(category)} ({count})
                </button>
              ))}
            </div>
          </div>

          {filteredAudios.length > 0 ? (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="hidden sm:table-cell px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="hidden md:table-cell px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAudios.map(audio => (
                    <tr key={audio.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[180px] sm:max-w-xs">{audio.title}</div>
                        <span className="sm:hidden text-xs text-gray-500">{formatCategory(audio.category)}</span>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap"><span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{formatCategory(audio.category)}</span></td>
                      <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDate(audio.created_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1">
                          <a href={audio.audio_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Preview">
                            <ExternalLink size={13} />
                          </a>
                          <button onClick={() => handleEdit(audio)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(audio.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Music2 size={32} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-700 mb-1">{activeFilter === 'all' ? 'No audios found' : `No audios in ${formatCategory(activeFilter)} category`}</h3>
              <p className="text-sm text-gray-400">Tambahkan audio menggunakan form di atas</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}