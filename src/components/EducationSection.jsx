import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function EducationSection() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-graduation-cap-fill"></i> Education
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-200 bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              {/* Logo */}
              {item.logo_url && (
                <div className="flex-shrink-0 hidden sm:block">
                  <img
                    src={item.logo_url}
                    alt={item.institution}
                    className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-1"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}

              {/* Info */}
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mb-2">
                  <h3 className="text-base font-bold text-gray-800 leading-snug">
                    {item.institution}
                  </h3>
                  <span className="text-sm text-gray-500 mt-1 sm:mt-0">{item.status}</span>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-zinc-500 font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 w-fit">
                    {item.role_icon} {item.role}
                  </p>
                </div>
                {item.description && (
                  <p className="text-[14px] text-gray-700 text-justify leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
