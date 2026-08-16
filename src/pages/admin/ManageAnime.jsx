import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import Layout from '../../components/Layout';
import {
  Plus,
  X,
  Search,
  Pencil,
  Trash2,
  Tv2,
  Star,
  ImageOff,
  Save,
} from 'lucide-react';

export default function ManageAnime() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '', genres: [], episodes: '', status: 'Ongoing',
    synopsis: '', cover_image: '', embed_url: '', rating: '',
    studio: '', release_year: '', season: ''
  });

  const genreOptions = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller', 'Mecha', 'Music',
    'Psychological', 'School', 'Isekai', 'Ecchi', 'Harem'
  ];

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('animes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnimes(data || []);
    } catch (error) {
      console.error('Error fetching animes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const animeData = {
        ...formData,
        episodes: parseInt(formData.episodes) || 0,
        rating: parseFloat(formData.rating) || 0,
        release_year: parseInt(formData.release_year) || new Date().getFullYear(),
        updated_at: new Date().toISOString()
      };

      if (editMode) {
        const { error } = await supabase
          .from('animes')
          .update(animeData)
          .eq('id', currentId);
        if (error) throw error;
      } else {
        animeData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('animes')
          .insert([animeData]);
        if (error) throw error;
      }

      resetForm();
      fetchAnimes();
    } catch (error) {
      console.error('Error saving anime:', error);
      alert('Error saving anime: ' + error.message);
    }
  };

  const handleEdit = (anime) => {
    setFormData({
      title: anime.title || '',
      genres: anime.genres || [],
      episodes: anime.episodes?.toString() || '',
      status: anime.status || 'Ongoing',
      synopsis: anime.synopsis || '',
      cover_image: anime.cover_image || '',
      embed_url: anime.embed_url || '',
      rating: anime.rating?.toString() || '',
      studio: anime.studio || '',
      release_year: anime.release_year?.toString() || '',
      season: anime.season || ''
    });
    setEditMode(true);
    setCurrentId(anime.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus anime ini?')) {
      try {
        const { error } = await supabase.from('animes').delete().eq('id', id);
        if (error) throw error;
        fetchAnimes();
      } catch (error) {
        console.error('Error deleting anime:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', genres: [], episodes: '', status: 'Ongoing',
      synopsis: '', cover_image: '', embed_url: '', rating: '',
      studio: '', release_year: '', season: ''
    });
    setEditMode(false);
    setCurrentId(null);
    setShowForm(false);
  };

  const filteredAnimes = animes.filter(anime =>
    anime.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen text-gray-800">
        <div className="container mx-auto max-w-full">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search anime..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
            </div>
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0 w-full sm:w-auto justify-center">
              {showForm ? <><X size={14} /> Tutup Form</> : <><Plus size={14} /> Add Anime</>}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                {editMode ? <><Pencil size={15} className="text-gray-500" /> Edit Anime</> : <><Plus size={15} className="text-gray-500" /> Add New Anime</>}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="Anime title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Episodes</label>
                    <input type="number" name="episodes" value={formData.episodes} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800">
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="8.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Studio</label>
                    <input type="text" name="studio" value={formData.studio} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="Studio name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
                    <input type="number" name="release_year" value={formData.release_year} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="2024" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                    <input type="text" name="season" value={formData.season} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="Spring 2024" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                    <input type="url" name="cover_image" value={formData.cover_image} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Embed URL</label>
                    <input type="url" name="embed_url" value={formData.embed_url} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="https://..." />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {genreOptions.map(genre => (
                      <button key={genre} type="button" onClick={() => handleGenreToggle(genre)} className={`px-3 py-1 text-sm rounded-full border transition ${formData.genres.includes(genre) ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Synopsis</label>
                  <textarea name="synopsis" value={formData.synopsis} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800" placeholder="Anime synopsis..." />
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="submit" className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center gap-1.5 transition-colors">
                    <Save size={13} />
                    {editMode ? 'Update' : 'Save'}
                  </button>
                  {editMode && (
                    <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-1.5 transition-colors">
                      <X size={13} /> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Anime Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div>
                </div>
              ))}
            </div>
          ) : filteredAnimes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <Tv2 size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">{searchTerm ? 'Anime tidak ditemukan.' : 'Belum ada anime. Tambahkan yang pertama!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredAnimes.map(anime => (
                <div key={anime.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group">
                  <div className="h-48 overflow-hidden relative">
                    {anime.cover_image ? (
                      <img src={anime.cover_image} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><ImageOff size={24} /></div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <button onClick={() => handleEdit(anime)} className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors" title="Edit"><Pencil size={12} className="text-gray-700" /></button>
                      <button onClick={() => handleDelete(anime.id)} className="p-1.5 bg-white rounded-lg shadow hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={12} className="text-red-500" /></button>
                    </div>
                    {anime.status && (
                      <span className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${anime.status === 'Completed' ? 'bg-green-100 text-green-700' : anime.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{anime.status}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{anime.title}</h3>
                    {anime.genres && anime.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {anime.genres.slice(0, 2).map((g, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{g}</span>
                        ))}
                      </div>
                    )}
                    {anime.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1"><Star size={10} className="text-yellow-400 fill-yellow-400" /><span className="text-xs text-gray-500">{anime.rating}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}