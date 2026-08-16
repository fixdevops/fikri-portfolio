import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  Tv2,
  Film,
  FolderKanban,
  Award,
  BookOpen,
  Quote,
  Music2,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const dashboardSections = [
  {
    label: "Animes",
    path: "/dashboard/manage-animes",
    tableName: "animes",
    icon: Tv2,
    color: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
  },
  {
    label: "Anime Reels",
    path: "/dashboard/animes/manage-reels",
    tableName: "anime_story",
    icon: Film,
    color: "bg-pink-50 text-pink-600",
    border: "border-pink-100",
  },
  {
    label: "Projects",
    path: "/dashboard/frontdev/manage-projects",
    tableName: "my_project",
    icon: FolderKanban,
    color: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
  },
  {
    label: "Certificates",
    path: "/dashboard/frontdev/manage-certificates",
    tableName: "my_certificate",
    icon: Award,
    color: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
  },
  {
    label: "Blogs",
    path: "/dashboard/frontdev/manage-blogs",
    tableName: "my_blogs",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  {
    label: "Quotes",
    path: "/dashboard/creator/manage-quotes",
    tableName: "my_quotes",
    icon: Quote,
    color: "bg-orange-50 text-orange-600",
    border: "border-orange-100",
  },
  {
    label: "Audio",
    path: "/dashboard/creator/manage-audio",
    tableName: "my_audios",
    icon: Music2,
    color: "bg-cyan-50 text-cyan-600",
    border: "border-cyan-100",
  },
];

function StatCard({ item, count, loading }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={`group bg-white border ${item.border} rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide truncate">
          {item.label}
        </p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-100 rounded-md animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 leading-none mt-1">
            {count ?? "—"}
          </p>
        )}
      </div>
      <ArrowRight
        size={16}
        className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors"
      />
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const newStats = {};
    let hasError = false;

    await Promise.all(
      dashboardSections.map(async (item) => {
        try {
          const { count, error: countError } = await supabase
            .from(item.tableName)
            .select("*", { count: "exact", head: true });
          if (countError) throw countError;
          newStats[item.tableName] = count;
        } catch (err) {
          console.error(`Gagal mengambil data untuk ${item.tableName}:`, err);
          hasError = true;
          newStats[item.tableName] = null;
        }
      })
    );

    if (hasError) setError("Beberapa data gagal dimuat.");
    setStats(newStats);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalItems = Object.values(stats).reduce(
    (sum, v) => sum + (v || 0),
    0
  );

  return (
    <Layout>
      {/* Summary row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading
              ? "Memuat data..."
              : `Total ${totalItems} item di semua konten`}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {dashboardSections.map((item) => (
          <StatCard
            key={item.tableName}
            item={item}
            count={stats[item.tableName]}
            loading={loading}
          />
        ))}

        {/* Total card */}
        {!loading && (
          <div className="bg-gray-900 rounded-xl p-5 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Total Semua
              </p>
              <p className="text-2xl font-bold text-white leading-none mt-1">
                {totalItems}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick access */}
      <div className="border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Akses Cepat
        </h3>
        <div className="flex flex-wrap gap-2">
          {dashboardSections.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.tableName}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all hover:shadow-sm ${item.border} ${item.color} bg-opacity-50 hover:bg-opacity-100`}
              >
                <Icon size={13} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-[11px] text-gray-300 text-right mt-4">
          Terakhir diperbarui:{" "}
          {lastUpdated.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
      )}
    </Layout>
  );
}
