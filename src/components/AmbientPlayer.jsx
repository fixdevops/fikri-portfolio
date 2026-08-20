import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

export default function AmbientPlayer() {
  const [audios, setAudios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);   // 0–100
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQueue, setShowQueue] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    supabase
      .from('my_audios')
      .select('id, title, audio_url, cover_url')
      .order('created_at', { ascending: true })
      .then(({ data }) => { setAudios(data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current || audios.length === 0) return;
    audioRef.current.load();
    setProgress(0);
    setCurrentTime(0);
    if (isPlaying) audioRef.current.play().catch(() => {});
  }, [currentIndex, audios]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !audios.length) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try { await audioRef.current.play(); setIsPlaying(true); }
      catch { setIsPlaying(false); }
    }
  }, [isPlaying, audios.length]);

  const handleNext = useCallback(() => setCurrentIndex(i => (i + 1) % audios.length), [audios.length]);
  const handlePrev = () => {
    if (currentTime > 3) { audioRef.current.currentTime = 0; return; }
    setCurrentIndex(i => (i - 1 + audios.length) % audios.length);
  };
  const handleSelect = (idx) => { setCurrentIndex(idx); setIsPlaying(true); setShowQueue(false); };
  const handleEnded = () => { if (audios.length > 1) handleNext(); };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    const d = audioRef.current.duration || 0;
    setCurrentTime(t);
    setDuration(d);
    setProgress(d ? (t / d) * 100 : 0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const trimTitle = (t, max = 26) => t?.length > max ? t.slice(0, max) + '…' : t;

  if (loading || audios.length === 0) return null;
  const current = audios[currentIndex];

  return (
    <>
      <audio
        ref={audioRef}
        loop={audios.length === 1}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        preload="auto"
      >
        <source src={current?.audio_url} />
      </audio>

      <div className="fixed bottom-[70px] md:bottom-6 left-4 z-50 flex flex-col items-start gap-2">

        {/* ── Main Player Card ── */}
        {isExpanded && (
          <div
            className="w-64 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Album Art */}
            <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
              {current?.cover_url ? (
                <img
                  src={current.cover_url}
                  alt={current.title}
                  className="w-full h-full object-cover"
                  style={{ filter: isPlaying ? 'brightness(1)' : 'brightness(0.5)', transition: 'filter 0.6s ease' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1db954 0%, #121212 100%)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
                    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                  </svg>
                </div>
              )}

              {/* Gradient overlay bawah */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, #121212 0%, transparent 55%)' }} />

              {/* Close button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Queue toggle */}
              {audios.length > 1 && (
                <button
                  onClick={() => setShowQueue(q => !q)}
                  className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: showQueue ? 'rgba(29,185,84,0.8)' : 'rgba(0,0,0,0.5)' }}
                  title="Queue"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="15" y2="18"/>
                  </svg>
                </button>
              )}

              {/* Now playing info di atas gradient */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#1db954' }}>
                  Now Playing
                </p>
                <p className="text-white font-bold text-sm leading-tight truncate mt-0.5">
                  {current?.title}
                </p>
              </div>
            </div>

            {/* Queue panel */}
            {showQueue && audios.length > 1 && (
              <div className="max-h-40 overflow-y-auto" style={{ background: '#1a1a1a' }}>
                {audios.map((a, idx) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect(idx)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left"
                    style={{ background: idx === currentIndex ? 'rgba(29,185,84,0.12)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = idx === currentIndex ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = idx === currentIndex ? 'rgba(29,185,84,0.12)' : 'transparent'}
                  >
                    {a.cover_url ? (
                      <img src={a.cover_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center"
                        style={{ background: '#282828' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
                          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                        </svg>
                      </div>
                    )}
                    <span className="text-xs truncate flex-1"
                      style={{ color: idx === currentIndex ? '#1db954' : 'rgba(255,255,255,0.7)' }}>
                      {a.title}
                    </span>
                    {idx === currentIndex && isPlaying && (
                      <span className="flex items-end gap-[2px] flex-shrink-0">
                        {[8, 13, 9, 11].map((h, j) => (
                          <span key={j} className="w-[2px] rounded-full"
                            style={{ height: `${h}px`, background: '#1db954',
                              animation: `eq${j + 1} ${0.4 + j * 0.12}s ease-in-out infinite alternate` }} />
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="px-4 pt-3 pb-4" style={{ background: '#121212' }}>
              {/* Progress bar */}
              <div
                className="relative h-1 rounded-full cursor-pointer group mb-1"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onClick={handleSeek}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: '#1db954' }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>

              {/* Time */}
              <div className="flex justify-between mb-3">
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{fmt(currentTime)}</span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{fmt(duration)}</span>
              </div>

              {/* Playback buttons */}
              <div className="flex items-center justify-between">
                {/* Prev */}
                <button onClick={handlePrev}
                  className="transition-colors p-1"
                  style={{ color: audios.length > 1 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}
                  disabled={audios.length === 1}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                  </svg>
                </button>

                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ background: '#1db954' }}
                >
                  {isPlaying
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>

                {/* Next */}
                <button onClick={handleNext}
                  className="transition-colors p-1"
                  style={{ color: audios.length > 1 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}
                  disabled={audios.length === 1}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z"/>
                  </svg>
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2 mt-3">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                  <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                </svg>
                <div
                  className="relative flex-1 h-1 rounded-full cursor-pointer group"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                  }}
                >
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${volume * 100}%`, background: '#1db954' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    style={{ left: `calc(${volume * 100}% - 6px)` }} />
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.5v9A4.5 4.5 0 0 0 16.5 12z"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ── Floating mini button ── */}
        <button
          onClick={() => { if (!isExpanded) setIsExpanded(true); else togglePlay(); }}
          title={isExpanded ? (isPlaying ? 'Pause' : 'Play') : 'Open Player'}
          className="relative w-12 h-12 rounded-full overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ border: isPlaying ? '2px solid #1db954' : '2px solid rgba(255,255,255,0.15)' }}
        >
          {/* Album art sebagai background */}
          {current?.cover_url
            ? <img src={current.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            : <div className="absolute inset-0" style={{ background: '#1db954' }} />
          }
          {/* Dark overlay */}
          <span className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} />

          {/* Pulse ring */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full animate-ping"
              style={{ border: '2px solid #1db954', animationDuration: '1.5s' }} />
          )}

          {/* Icon */}
          <span className="relative z-10 flex items-center justify-center w-full h-full">
            {isPlaying ? (
              <span className="flex items-end gap-[2px] h-4">
                {[8, 14, 10, 13, 7].map((h, i) => (
                  <span key={i} className="w-[2.5px] rounded-full bg-white"
                    style={{ height: `${h}px`, animation: `eq${(i % 4) + 1} ${0.4 + i * 0.1}s ease-in-out infinite alternate` }} />
                ))}
              </span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes eq1 { from { height: 3px } to { height: 13px } }
        @keyframes eq2 { from { height: 7px } to { height: 17px } }
        @keyframes eq3 { from { height: 5px } to { height: 11px } }
        @keyframes eq4 { from { height: 9px } to { height: 15px } }
      `}</style>
    </>
  );
}
