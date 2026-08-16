import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import Layout from '../../components/Layout';
import { Search, Pencil, Trash2, X, Save, Quote } from 'lucide-react';

const ManageQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingQuote, setEditingQuote] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        let query = supabase
          .from('my_quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setQuotes(data || []);
      } catch (error) {
        console.error("Error fetching quotes: ", error);
      }
    };

    fetchQuotes();
  }, [statusFilter]);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchTerm === '' ||
      quote.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || quote.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      const { error } = await supabase
        .from('my_quotes')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', quoteId);
      if (error) throw error;
      setQuotes(quotes.map(quote =>
        quote.id === quoteId ? { ...quote, status: newStatus } : quote
      ));
    } catch (error) {
      console.error("Error updating quote status: ", error);
    }
  };

  const handleEdit = (quote) => setEditingQuote(quote);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('my_quotes')
        .update({
          text: editingQuote.text,
          author: editingQuote.author,
          category: editingQuote.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingQuote.id);
      if (error) throw error;
      setQuotes(quotes.map(quote =>
        quote.id === editingQuote.id ? editingQuote : quote
      ));
      setEditingQuote(null);
    } catch (error) {
      console.error("Error updating quote: ", error);
    }
  };

  const handleDelete = async (quoteId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus quote ini?")) {
      try {
        const { error } = await supabase.from('my_quotes').delete().eq('id', quoteId);
        if (error) throw error;
        setQuotes(quotes.filter(quote => quote.id !== quoteId));
      } catch (error) {
        console.error("Error deleting quote: ", error);
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari quote atau author..." className="w-full py-2.5 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">Semua Kategori</option>
              <option value="motivation">Motivasi</option>
              <option value="life">Sindiran</option>
              <option value="love">Cinta</option>
              <option value="wisdom">Kebijaksanaan</option>
              <option value="funny">Lucu</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          {editingQuote && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold flex items-center gap-2 text-gray-800"><Pencil size={15} className="text-gray-500" /> Edit Quote</h2>
                    <button onClick={() => setEditingQuote(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={15} /></button>
                  </div>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                      <textarea className="w-full px-4 py-3 border border-gray-300 rounded-lg" rows={4} value={editingQuote.text} onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg" value={editingQuote.author} onChange={(e) => setEditingQuote({ ...editingQuote, author: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" value={editingQuote.category} onChange={(e) => setEditingQuote({ ...editingQuote, category: e.target.value })}>
                        <option value="motivation">Motivasi</option>
                        <option value="life">Sindiran</option>
                        <option value="love">Cinta</option>
                        <option value="wisdom">Kebijaksanaan</option>
                        <option value="funny">Lucu</option>
                        <option value="other">Lainnya</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setEditingQuote(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"><X size={13} /> Batal</button>
                      <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-1.5 transition-colors"><Save size={13} /> Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium text-gray-700 text-xs">
              <div className="col-span-7 sm:col-span-5">Quote</div>
              <div className="col-span-5 sm:col-span-3">Author</div>
              <div className="hidden sm:block sm:col-span-2">Category</div>
              <div className="hidden sm:block sm:col-span-1">Status</div>
              <div className="hidden sm:block sm:col-span-1">Actions</div>
            </div>

            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => (
                <div key={quote.id} className="grid grid-cols-12 p-3 border-b border-gray-200 hover:bg-gray-50 items-center">
                  <div className="col-span-7 sm:col-span-5 text-sm text-gray-800 line-clamp-2 pr-2">"{quote.text}"</div>
                  <div className="col-span-3 sm:col-span-3 text-xs text-gray-600 truncate pr-2">{quote.author}</div>
                  <div className="col-span-2 sm:hidden flex flex-col gap-1 items-end">
                    <button onClick={() => handleEdit(quote)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(quote.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                  </div>
                  <div className="hidden sm:block sm:col-span-2">
                    <span className={`text-xs px-2 py-1 rounded-[4px] ${quote.category === 'motivation' ? 'bg-blue-100 text-blue-800' : quote.category === 'life' ? 'bg-green-100 text-green-800' : quote.category === 'love' ? 'bg-pink-100 text-pink-800' : quote.category === 'wisdom' ? 'bg-purple-100 text-purple-800' : quote.category === 'funny' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {quote.category === 'motivation' && 'Motivasi'}
                      {quote.category === 'life' && 'Sindiran'}
                      {quote.category === 'love' && 'Cinta'}
                      {quote.category === 'wisdom' && 'Kebijaksanaan'}
                      {quote.category === 'funny' && 'Lucu'}
                      {quote.category === 'other' && 'Lainnya'}
                    </span>
                  </div>
                  <div className="hidden sm:block sm:col-span-1">
                    <select className={`text-xs px-1 py-1 rounded border w-full ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : quote.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`} value={quote.status} onChange={(e) => handleStatusChange(quote.id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="hidden sm:flex sm:col-span-1 items-center gap-1.5">
                    <button onClick={() => handleEdit(quote)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(quote.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Quote size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Tidak ada quotes yang ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageQuotes;