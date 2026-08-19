import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const TAG_CLS = {
  gray:   "bg-gray-100 text-gray-700",
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-green-100 text-green-700",
  red:    "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  amber:  "bg-amber-100 text-amber-700",
  cyan:   "bg-cyan-100 text-cyan-700",
};

function ExpIcon({ type, value, bg, color, size = 40, fit = "contain" }) {
  const style = { backgroundColor: bg, color };
  if (type === "image") {
    return (
      <div
        className="rounded-full border border-gray-200 overflow-hidden flex-shrink-0"
        style={{ width: size, height: size, minWidth: size, background: bg || "white" }}
      >
        <img
          src={value}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: fit }}
          onError={(e) => (e.target.style.display = "none")}
        />
      </div>
    );
  }
  if (type === "emoji") {
    return (
      <div
        className="rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ ...style, width: size, height: size, minWidth: size }}
      >
        {value}
      </div>
    );
  }
  // remix icon
  return (
    <div
      className="rounded-full flex items-center justify-center text-xl flex-shrink-0"
      style={{ ...style, width: size, height: size, minWidth: size }}
    >
      <i className={value}></i>
    </div>
  );
}

export default function ExperienceSection() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("experience")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
            <i className="ri-briefcase-4-fill"></i> Experience
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded w-32" />
                  <div className="h-2.5 bg-gray-100 rounded w-20" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 bg-gray-100 rounded w-full" />
                <div className="h-2.5 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-briefcase-4-fill"></i> Experience
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border border-gray-200 bg-white p-4 ${
              item.is_wide ? "md:col-span-2" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <ExpIcon
                type={item.icon_type}
                value={item.icon_value}
                bg={item.icon_bg}
                color={item.icon_color}
                size={item.logo_size || 40}
                fit={item.logo_fit || "contain"}
              />
              <div>
                <h3 className="text-base font-semibold text-gray-800">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-xs text-gray-600">{item.subtitle}</p>
                )}
              </div>
            </div>

            {item.description && (
              <p className="text-sm text-gray-700 mb-3">{item.description}</p>
            )}

            {item.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      TAG_CLS[item.tag_color] || TAG_CLS.gray
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
