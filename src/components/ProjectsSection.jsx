import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("my_project")
          .select("*")
          .eq("is_pinned", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-tools-fill"></i> Featured Projects
        </h2>
        <Link to="/projects" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View more
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-lg text-gray-500 text-sm">
          No pinned projects. Pin projects from the admin panel.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => {
            const imgHeight = project.image_height || 130;
            const imgFit = project.image_fit || "cover";

            return (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Thumbnail — full width di atas */}
                <div
                  className="w-full overflow-hidden bg-gray-100"
                  style={{ height: `${imgHeight}px` }}
                >
                  <img
                    src={project.thumbnail || "https://via.placeholder.com/300x200?text=No+Image"}
                    alt={project.title}
                    style={{ width: "100%", height: "100%", objectFit: imgFit }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col p-3 gap-1">
                  {/* Title + Visit */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 flex-1">
                      {project.title}
                    </h3>
                    {project.link_preview && (
                      <a
                        href={project.link_preview}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 flex items-center gap-1 text-xs border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-2 py-1 rounded-lg transition-colors"
                      >
                        <i className="ri-share-box-line text-xs"></i>
                        <span>Visit</span>
                      </a>
                    )}
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Tech stacks */}
                  {project.tech_stacks && Array.isArray(project.tech_stacks) && project.tech_stacks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.tech_stacks.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 font-mono"
                        >
                          #{tech}
                        </span>
                      ))}
                      {project.tech_stacks.length > 4 && (
                        <span className="text-[10px] text-gray-400 self-center">
                          +{project.tech_stacks.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
