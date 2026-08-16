import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import {
  Tv2, Film, FolderKanban, Award, BookOpen,
  Quote, Music2, ArrowRight, RefreshCw,
  Eye, TrendingUp, BarChart2,
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// ── helpers ──────────────────────────────────────────────────
function buildDateRange(days) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

function fmtShort(iso) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
function fmtFull(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── content sections config ────────────────────────────────
const SECTIONS = [
  { label: "Animes",       path: "/dashboard/manage-animes",                table: "animes",         icon: Tv2 },
  { label: "Reels",        path: "/dashboard/animes/manage-reels",          table: "anime_story",    icon: Film },
  { label: "Projects",     path: "/dashboard/frontdev/manage-projects",     table: "my_project",     icon: FolderKanban },
  { label: "Certificates", path: "/dashboard/frontdev/manage-certificates", table: "my_certificate", icon: Award },
  { label: "Blogs",        path: "/dashboard/frontdev/manage-blogs",        table: "my_blogs",       icon: BookOpen },
  { label: "Quotes",       path: "/dashboard/creator/manage-quotes",        table: "my_quotes",      icon: Quote },
  { label: "Audio",        path: "/dashboard/creator/manage-audio",         table: "my_audios",      icon: Music2 },
];

const RANGES = [
  { label: "7d",  value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
];

// ── main ──────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]           = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [viewsData, setViewsData]   = useState([]);
  const [viewsLoading, setViewsLoading] = useState(true);
  const [range, setRange]           = useState(14);
  const [topPages, setTopPages]     = useState([]);

  // ── fetch content counts ──
  const fetchStats = async () => {
    setStatsLoading(true);
    const next = {};
    await Promise.all(
      SECTIONS.map(async (s) => {
        try {
          const { count } = await supabase
            .from(s.table)
            .select("*", { count: "exact", head: true });
          next[s.table] = count ?? 0;
        } catch { next[s.table] = null; }
      })
    );
    setStats(next);
    setStatsLoading(false);
  };

  // ── fetch page_views ──
  const fetchViews = async () => {
    setViewsLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - (range - 1));
      since.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("page_views")
        .select("page, visited_at")
        .gte("visited_at", since.toISOString())
        .order("visited_at", { ascending: true });

      setViewsData(data || []);

      const pc = {};
      (data || []).forEach((r) => { pc[r.page] = (pc[r.page] || 0) + 1; });
      setTopPages(Object.entries(pc).sort((a, b) => b[1] - a[1]).slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setViewsLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchViews(); }, [range]);

  // ── derived chart data ──
  const chart = useMemo(() => {
    const dates = buildDateRange(range);
    const byDate = Object.fromEntries(dates.map((d) => [d, 0]));
    viewsData.forEach((r) => {
      const day = r.visited_at?.split("T")[0];
      if (day !== undefined && byDate[day] !== undefined) byDate[day]++;
    });

    const values  = dates.map((d) => byDate[d]);
    const total   = values.reduce((a, b) => a + b, 0);
    const today   = byDate[new Date().toISOString().split("T")[0]] ?? 0;
    const avg     = Math.round(total / range);
    const peakIdx = values.indexOf(Math.max(...values));
    const peak    = { date: dates[peakIdx], count: values[peakIdx] };

    return { dates, labels: dates.map((d) => fmtShort(d)), values, total, today, avg, peak };
  }, [viewsData, range]);

  const totalContent = Object.values(stats).reduce((s, v) => s + (v || 0), 0);

  // ── chart config ──
  const chartData = {
    labels: chart.labels,
    datasets: [{
      data: chart.values,
      fill: true,
      tension: 0.45,
      borderColor: "#18181b",
      borderWidth: 1.5,
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
        g.addColorStop(0, "rgba(24,24,27,0.08)");
        g.addColorStop(1, "rgba(24,24,27,0)");
        return g;
      },
      pointBackgroundColor: "#18181b",
      pointBorderColor: "#fff",
      pointBorderWidth: 1.5,
      pointRadius: 3,
      pointHoverRadius: 5,
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#18181b",
        titleColor: "#e4e4e7",
        bodyColor: "#a1a1aa",
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (items) => fmtFull(chart.dates[items[0].dataIndex]),
          label: (item) => `  ${item.raw} kunjungan`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#a1a1aa",
          font: { size: 10 },
          maxTicksLimit: range <= 7 ? 7 : range <= 14 ? 7 : 10,
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f4f4f5" },
        border: { display: false },
        ticks: { color: "#a1a1aa", font: { size: 10 }, precision: 0 },
      },
    },
  };

  return (
    <Layout>

      {/* ── header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-zinc-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {statsLoading ? "memuat…" : `${totalContent} total konten`}
          </p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchViews(); }}
          disabled={statsLoading || viewsLoading}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 border border-zinc-200 bg-white px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={(statsLoading || viewsLoading) ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── content stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.table}
              to={s.path}
              className="group flex flex-col gap-2 bg-white border border-zinc-100 rounded-xl p-3.5 hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
                  <Icon size={14} className="text-zinc-500" />
                </div>
                <ArrowRight size={11} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
              </div>
              {statsLoading ? (
                <div className="h-5 w-8 bg-zinc-100 rounded animate-pulse" />
              ) : (
                <span className="text-lg font-bold text-zinc-900 leading-none">
                  {stats[s.table] ?? "—"}
                </span>
              )}
              <span className="text-[10px] text-zinc-400 leading-none truncate">{s.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── visitor section ── */}
      <div className="bg-white border border-zinc-100 rounded-xl">

        {/* top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={14} className="text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-800">Pengunjung</span>
            {!viewsLoading && (
              <span className="text-[11px] text-zinc-400">
                — {chart.total.toLocaleString()} kunjungan
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  range === r.value
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 stat pills */}
        <div className="flex gap-4 px-5 pb-4 border-b border-zinc-50">
          {[
            { label: "Hari ini",    value: viewsLoading ? "—" : chart.today.toLocaleString() },
            { label: "Rata-rata",   value: viewsLoading ? "—" : chart.avg.toLocaleString() + "/hari" },
            {
              label: "Hari tersibuk",
              value: viewsLoading || !chart.peak.date
                ? "—"
                : `${fmtShort(chart.peak.date)} · ${chart.peak.count}×`,
            },
          ].map((p) => (
            <div key={p.label} className="flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wide">{p.label}</span>
              <span className="text-sm font-semibold text-zinc-800">{p.value}</span>
            </div>
          ))}
        </div>

        {/* chart */}
        <div className="px-5 pt-5 pb-4">
          {viewsLoading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
            </div>
          ) : chart.total === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center gap-2 text-zinc-300">
              <TrendingUp size={24} strokeWidth={1.5} />
              <p className="text-xs">Belum ada data. Buka halaman web kamu dulu.</p>
            </div>
          ) : (
            <div className="h-52 sm:h-60">
              <Line data={chartData} options={chartOpts} />
            </div>
          )}
        </div>

        {/* top pages */}
        {!viewsLoading && topPages.length > 0 && (
          <div className="px-5 pb-5 pt-1 border-t border-zinc-50">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={12} className="text-zinc-400" />
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                Halaman terpopuler
              </span>
            </div>
            <div className="space-y-2.5">
              {topPages.map(([page, count], i) => {
                const pct = chart.total > 0 ? Math.round((count / chart.total) * 100) : 0;
                return (
                  <div key={page} className="grid grid-cols-[16px_1fr_28px] items-center gap-2">
                    <span className="text-[10px] text-zinc-300 font-mono">{i + 1}</span>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-600 truncate font-mono">{page}</span>
                        <span className="text-[10px] text-zinc-400 ml-2 flex-shrink-0">{count}×</span>
                      </div>
                      <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-700 rounded-full"
                          style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </Layout>
  );
}
