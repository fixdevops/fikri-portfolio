import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, limit, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt with orderBy first
    const q = query(
      collection(db, "my-project"),
      orderBy("createdAt", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      // Fallback if index missing
      const simpleQ = query(collection(db, "my-project"), limit(3));
      onSnapshot(simpleQ, (snap) => {
          const simpleData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProjects(simpleData);
          setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center w-full">
        <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-tools-fill"></i> Featured Projects
        </h2>
        <Link to="/projects" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View more
        </Link>
      </div> <br />
      
      {loading ? (
         <div className="flex justify-center p-4">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
         </div>
      ) : projects.length === 0 ? (
         <div className="text-center py-8 bg-white border border-gray-200 rounded-lg text-gray-500">
           No projects added yet.
        </div>
      ) : (
        <div className="grid gap-2">
          {projects.map((project) => (
            <div key={project.id} className="border border-gray-200 bg-white rounded-xl sm:flex items-center transition-all hover:shadow-md mb-2">
              <div className="p-2 sm:w-1/3">
                <img
                  src={project.thumbnail || "https://via.placeholder.com/300x200?text=No+Thumbnail"}
                  alt={project.title}
                  className="w-full h-32 object-cover border border-gray-200 rounded-lg"
                />
              </div>
              <div className="p-3 w-full sm:w-2/3">
                <div className="flex justify-between items-center">
                  <h1 className="text-[18px] text-gray-800 font-black truncate">{project.title}</h1>
                  {project.linkPreview && (
                      <a
                        target="_blank"
                        href={project.linkPreview || "#"}
                        rel="noreferrer"
                        className="border border-gray-200 bg-white hover:bg-gray-100 duration-200 px-3 py-1 flex items-center rounded-lg text-gray-800 gap-2 text-sm"
                      >
                        <i className="ri-share-box-line" /> Visit
                      </a>
                  )}
                </div>
                <hr className="border-1 border-gray-200 border-dashed my-3" />
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {project.techStacks && Object.values(project.techStacks).map((tech, idx) => (
                    <span key={idx} className="text-xs bg-white border border-gray-200 rounded px-1 py-0.5 text-zinc-500 font-mono whitespace-nowrap">
                       # {tech}
                    </span>
                  ))}
                </div>
                 <hr className="border-1 border-gray-200 border-dashed my-3" />
                <p className="text-gray-800 text-sm line-clamp-2">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}