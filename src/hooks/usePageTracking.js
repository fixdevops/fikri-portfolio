import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabase";

// Halaman admin tidak perlu ditrack
const EXCLUDED_PREFIXES = ["/dashboard", "/login"];

/**
 * Hook ini dipasang sekali di App.jsx.
 * Setiap kali route berubah, kirim satu record ke tabel page_views.
 * Pakai sessionStorage agar satu session tidak spam insert per page.
 */
export function usePageTracking() {
  const location = useLocation();
  const lastTracked = useRef(null);

  useEffect(() => {
    const path = location.pathname;

    // Skip halaman admin
    if (EXCLUDED_PREFIXES.some((p) => path.startsWith(p))) return;

    // Skip kalau path sama persis (hindari double-insert StrictMode)
    if (lastTracked.current === path) return;
    lastTracked.current = path;

    const track = async () => {
      try {
        await supabase.from("page_views").insert({
          page: path,
          user_agent: navigator.userAgent?.slice(0, 200) || null,
          referrer: document.referrer?.slice(0, 200) || null,
        });
      } catch (err) {
        // Tracking gagal tidak boleh crash app
        console.warn("Page tracking error:", err);
      }
    };

    track();
  }, [location.pathname]);
}
