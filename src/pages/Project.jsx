import React, { useState, useEffect } from "react";
import NavNavigate from "../components/NavNavigate";
import Footer from "../components/Footer";
import { supabase } from "../supabase";
import ChatRoomComponents from "../components/ChatRoom";

const ProjectsContent = React.memo(({
  loading, sortedProjects, activeCategory, setActiveCategory,
  searchTerm, setSearchTerm, isMobile, categories
}) => {
  return (
    <section className="max-w-4xl mx-auto px-5 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md" />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
        {isMobile ? (
          <div className="w-full sm:w-auto">
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="w-full bg-white text-[15px] px-4 py-2 border border-gray-300 rounded-md">
              {categories.map(category => (<option key={category} value={category} className="capitalize">{category}</option>))}
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-2 rounded-md capitalize text-sm font-medium transition-all duration-200 border ${activeCategory === category ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"}`}>
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>
      ) : sortedProjects.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500">No projects found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col">
              <div className="relative">
                {project.thumbnail && (<img src={project.thumbnail} alt={project.title} className="w-full h-40 object-cover" />)}
                <span className="absolute top-2 right-2 bg-indigo-100 text-black text-xs px-2 py-0.5 rounded-[5px] capitalize">{project.category}</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-md font-bold truncate">{project.title}</h3>
                {project.description && (
                  <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2 leading-relaxed">{project.description}</p>
                )}
                <div className="flex gap-2 mt-auto pt-2">
                  {project.link_preview && (
                    <a href={project.link_preview} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded-md transition-colors text-sm flex items-center justify-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Visit
                    </a>
                  )}
                  {project.code_url && (
                    <a href={project.code_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 font-medium py-1.5 px-3 rounded-md transition-colors text-sm flex items-center justify-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

const categories = ["project", "template", "components", "design"];

export default function Projects() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("project");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder] = useState("newest");
  const [isMobile, setIsMobile] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("my_project")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchProjects();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  const filteredProjects = projects.filter(project => {
    const matchesCategory = project.category === activeCategory;
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <NavNavigate />
      <ChatRoomComponents />
      <ProjectsContent loading={loading} sortedProjects={sortedProjects} activeCategory={activeCategory} setActiveCategory={setActiveCategory} searchTerm={searchTerm} setSearchTerm={setSearchTerm} isMobile={isMobile} categories={categories} />
      <Footer />
    </div>
  );
}