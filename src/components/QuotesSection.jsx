import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const INTERVAL_MS = 5000; // ganti quote tiap 5 detik

const categoryLabel = {
  motivation: 'Motivasi',
  life: 'Sindiran',
  love: 'Cinta',
  wisdom: 'Kebijaksanaan',
  funny: 'Lucu',
  other: 'Lainnya',
};

export default function QuotesSection() {
  const [quotes, setQuotes] = useState([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('my_quotes')
        .select('id, text, author, category')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        // acak urutan agar tidak monoton
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setQuotes(shuffled);
      }
    };
    fetch();
  }, []);

  const next = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex(i => (i + 1) % quotes.length);
      setVisible(true);
    }, 300);
  }, [quotes.length]);

  const prev = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex(i => (i - 1 + quotes.length) % quotes.length);
      setVisible(true);
    }, 300);
  }, [quotes.length]);

  // auto-rotate
  useEffect(() => {
    if (quotes.length <= 1) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [quotes.length, next]);

  if (quotes.length === 0) return null;

  const q = quotes[index];

  return (
    <div className="w-full">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Quotes
      </h2>

      <div className="relative bg-white border border-gray-100 rounded-xl px-4 sm:px-5 py-3 sm:py-4 shadow-sm overflow-hidden">
        {/* Decorative quote mark */}
        <span className="absolute top-2 left-3 text-5xl leading-none text-gray-100 select-none font-serif pointer-events-none">
          "
        </span>

        {/* Quote content */}
        <div
          className="relative z-10 transition-all duration-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(6px)' }}
        >
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic pl-4">
            {q.text}
          </p>
          <div className="flex items-center justify-between mt-2 sm:mt-3 pl-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-medium text-gray-500">— {q.author}</span>
              {q.category && q.category !== 'other' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">
                  {categoryLabel[q.category] || q.category}
                </span>
              )}
            </div>

            {/* Nav dots + arrows */}
            {quotes.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prev}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs"
                >
                  ‹
                </button>
                <span className="text-[10px] text-gray-300">
                  {index + 1}/{quotes.length}
                </span>
                <button
                  onClick={next}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
