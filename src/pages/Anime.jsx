import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import NavNavigate from '../components/NavNavigate';
import Footer from '../components/Footer';
import { Star, Tv2, ImageOff } from 'lucide-react';

const STATUS_COLOR = {
  Completed: 'bg-green-100 text-green-700',
  Ongoing:   'bg-blue-100 text-blue-700',
  Upcoming:  'bg-yellow-100 text-yellow-700',
};

export default function AnimePage() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeGenre, setActiveGenre] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('animes')
        .select('*')
        .order('created_at', { ascending: false });
      setAnimes(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // semua genre unik dari data
  const allGenres = ['All', ...Array.from(new Set(animes.flatMap(a => a.genres || [])))];
  const statuses = ['All', 'Ongoing', 'Completed', 'Upcoming'];

  const filtered = animes.filter(a => {
    const matchStatus = activeStatus === 'All' || a.status === activeStatus;
    const matchGenre  = activeGenre === 'All' || (a.genres || []).includes(activeGenre);
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchGenre && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <NavNavigate />

      <section className="max-w-4xl mx-auto px-4 sm:px-5 pt-6 pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Tv2 size={20} className="text-gray-500" /> Anime Collection
          </h1>
          <p className="text-sm text-gray-500 mt-1">Koleksi anime yang pernah saya tonton</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col gap-3 mb-5">
          <input
            type="text"
            placeholder="Cari anime..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          {/* Status filter */}
          <div className="flex flex-wrap gap-1.5">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors
                  ${activeStatus === s ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Genre filter */}
          <div className="flex flex-wrap gap-1.5">
            {allGenres.map(g => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors
                  ${activeGenre === g ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: horizontal scroll | Desktop: grid */}
        {loading ? (
          <>
            {/* skeleton mobile */}
            <div className="flex gap-3 overflow-x-auto pb-2 sm:hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-xl flex-shrink-0 w-32 aspect-[2/3]" />
              ))}
            </div>
            {/* skeleton desktop */}
            <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-xl aspect-[2/3]" />
              ))}
            </div>
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Tv2 size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tidak ada anime ditemukan</p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-3 sm:hidden snap-x snap-mandatory scroll-smooth">
              {filtered.map(anime => (
                <button
                  key={anime.id}
                  onClick={() => setSelected(anime)}
                  className="text-left bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 w-32 snap-start"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                    {anime.cover_image ? (
                      <img src={anime.cover_image} alt={anime.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={20} /></div>
                    )}
                    {anime.status && (
                      <span className={`absolute bottom-1.5 left-1.5 text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${STATUS_COLOR[anime.status] || 'bg-gray-100 text-gray-600'}`}>
                        {anime.status}
                      </span>
                    )}
                  </div>
                  <div className="p-1.5">
                    <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight">{anime.title}</p>
                    {anime.rating > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star size={8} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-gray-500">{anime.rating}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map(anime => (
                <button
                  key={anime.id}
                  onClick={() => setSelected(anime)}
                  className="text-left bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                    {anime.cover_image ? (
                      <img src={anime.cover_image} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={22} /></div>
                    )}
                    {anime.status && (
                      <span className={`absolute bottom-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${STATUS_COLOR[anime.status] || 'bg-gray-100 text-gray-600'}`}>
                        {anime.status}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{anime.title}</p>
                    {anime.rating > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star size={9} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-gray-500">{anime.rating}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-gray-400 mt-4">{filtered.length} anime</p>
      </section>

      <Footer />

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex gap-4 p-5">
              {/* Cover */}
              <div className="w-28 flex-shrink-0">
                {selected.cover_image ? (
                  <img src={selected.cover_image} alt={selected.title} className="w-full rounded-xl object-cover aspect-[2/3]" />
                ) : (
                  <div className="w-full aspect-[2/3] rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
                    <ImageOff size={24} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-base leading-tight">{selected.title}</h2>
                {selected.studio && <p className="text-xs text-gray-500 mt-0.5">{selected.studio}</p>}

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selected.status && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[selected.status] || 'bg-gray-100 text-gray-600'}`}>
                      {selected.status}
                    </span>
                  )}
                  {selected.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                      <Star size={9} className="fill-yellow-400 text-yellow-400" /> {selected.rating}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-xs text-gray-600">
                  {selected.episodes > 0 && <p><span className="text-gray-400">Episode</span> {selected.episodes}</p>}
                  {selected.release_year && <p><span className="text-gray-400">Tahun</span> {selected.release_year}</p>}
                  {selected.season && <p><span className="text-gray-400">Season</span> {selected.season}</p>}
                </div>

                {/* Genre */}
                {selected.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {selected.genres.map((g, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{g}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Synopsis */}
            {selected.synopsis && (
              <div className="px-5 pb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sinopsis</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.synopsis}</p>
              </div>
            )}

            {/* Watch button */}
            {selected.embed_url && (
              <div className="px-5 pb-5">
                <a
                  href={selected.embed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <i className="ri-play-fill" /> Tonton
                </a>
              </div>
            )}

            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <i className="ri-close-line text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
