import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function BlogSection() {
  const [latestBlog, setLatestBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlog = async () => {
      try {
        const { data, error } = await supabase
          .from("my_blogs")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        setLatestBlog(data || null);
      } catch (error) {
        console.error("Error fetching latest blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBlog();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center w-full">
        <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-article-fill"></i> Latest Articles
        </h2>
        <Link
          to="/blogs"
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          View more
        </Link>
      </div>

      <div className="w-full mt-5">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
          </div>
        ) : latestBlog ? (
          <div className="border border-gray-200 bg-white p-5 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between gap-5">
              <div className="flex gap-3">
                <div className="mt-1">
                  <Link
                    to={`/blogs/${latestBlog.slug}`}
                    className="text-lg text-gray-800 font-black flex gap-2 hover:text-indigo-600 transition-colors"
                  >
                    {latestBlog.title}
                  </Link>
                  <ul className="text-zinc-400 flex items-center gap-2 text-sm">
                    <li>{latestBlog.reading_time || 2} min read</li>
                    <div className="bg-zinc-400 rounded-full h-[3px] w-[3px] aspect-square"></div>
                    <li>{formatDate(latestBlog.published_at)}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-white border border-gray-200 rounded-lg text-gray-500">
            No articles published yet.
          </div>
        )}
      </div>
    </div>
  );
}