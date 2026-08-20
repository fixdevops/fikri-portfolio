import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import NavNavigate from '../components/NavNavigate';
import Footer from '../components/Footer';
import { Film, X, Play } from 'lucide-react';

const CATEGORIES = [
  { id: 'all',     label: 'Semua' },
  { id: 'anime',   label: 'Anime' },
  { id: 'donghua', label: 'Donghua' },
  { id: 'quote',   label: 'Quotes' },
];

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [playing, setPlaying] = useState(null); // { url, title }
  const videoRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('anime_story')
        .select('*')
        .order('upload_date', { ascending: false });
      setReels(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = reels.filter(r =>
    activeCategory === 'all' || r.category === activeCategory
  );

  const openVideo = (reel) => setPlaying(reel);
  const closeVideo = () => { setPlaying(null); };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <NavNavigate />

      <section className="max-w-4xl mx-auto px-4 sm:px-5 pt-6 pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Film size={20} className="text-gray-500" /> Anime Reels
          </h1>
          <p className="text-sm text-gray-500 mt-1">Koleksi reels & video anime</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors
                ${activeCategory === c.id ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Mobile: horizontal scroll | Desktop: grid */}
        {loading ? (
          <>
            <div className="flex gap-3 overflow-x-auto pb-2 sm:hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-xl flex-shrink-0 w-36 aspect-[9/16]" />
              ))}
            </div>
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-xl aspect-[9/16]" />
              ))}
            </div>
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Film size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada reels</p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-3 sm:hidden snap-x snap-mandatory scroll-smooth">
              {filtered.map(reel => (
                <button
                  key={reel.id}
                  onClick={() => openVideo(reel)}
                  className="text-left group bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 w-36 snap-start"
                >
                  <div className="relative aspect-[9/16] bg-gray-100 overflow-hidden">
                    {reel.thumbnail ? (
                      <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Film size={24} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/0 active:bg-black/20 flex items-center justify-center transition-all">
                      <div className="w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow">
                        <Play size={14} className="text-gray-900 fill-gray-900 ml-0.5" />
                      </div>
                    </div>
                    {reel.category && (
                      <span className="absolute bottom-2 left-2 text-[8px] px-1.5 py-0.5 rounded-full font-semibold bg-black/60 text-white">
                        {reel.category}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{reel.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(reel.upload_date)}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(reel => (
                <button
                  key={reel.id}
                  onClick={() => openVideo(reel)}
                  className="text-left group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[9/16] bg-gray-100 overflow-hidden">
                    {reel.thumbnail ? (
                      <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Film size={28} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="w-11 h-11 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play size={18} className="text-gray-900 fill-gray-900 ml-0.5" />
                      </div>
                    </div>
                    {reel.category && (
                      <span className="absolute bottom-2 left-2 text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-black/60 text-white backdrop-blur-sm">
                        {reel.category}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 truncate">{reel.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(reel.upload_date)}</p>
                    {reel.hastag?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {reel.hastag.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-[9px] text-gray-400">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-gray-400 mt-4">{filtered.length} reels</p>
      </section>

      <Footer />

      {/* Video Player Modal */}
      {playing && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeVideo}
              className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1 text-sm"
            >
              <X size={16} /> Tutup
            </button>

            {/* Video */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-[9/16]">
              <video
                ref={videoRef}
                src={playing.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
                playsInline
              />
            </div>

            {/* Title & hashtags */}
            <div className="mt-3 text-white">
              <p className="font-semibold text-sm">{playing.title}</p>
              <p className="text-xs text-white/50 mt-0.5">{formatDate(playing.upload_date)}</p>
              {playing.hastag?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {playing.hastag.map((t, i) => (
                    <span key={i} className="text-xs text-white/60">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
