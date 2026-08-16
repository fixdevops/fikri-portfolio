import React, { useState, useEffect } from 'react';
import NavNavigate from '../components/NavNavigate';
import Footer from '../components/Footer';
import ChatRoomComponents from '../components/ChatRoom';
import { supabase } from '../supabase';

const COLOR_MAP = {
  blue:   { bg: "bg-blue-100",   text: "text-blue-600",   border: "border-blue-200",   hover: "hover:border-blue-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200", hover: "hover:border-purple-200" },
  green:  { bg: "bg-green-100",  text: "text-green-600",  border: "border-green-200",  hover: "hover:border-green-200" },
  red:    { bg: "bg-red-100",    text: "text-red-600",    border: "border-red-200",    hover: "hover:border-red-200" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200", hover: "hover:border-orange-200" },
  gray:   { bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200",   hover: "hover:border-gray-200" },
};

function ResumeIcon({ type, colorClass }) {
  const cls = `w-5 h-5 ${colorClass}`;
  switch (type) {
    case "video":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case "pen":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "star":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "bug":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4M4 12H2m20 0h-2M6.34 6.34 4.93 4.93m12.73 12.73 1.41 1.41M6.34 17.66l-1.41 1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case "terminal":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "lock":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case "radar":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12l4.5-4.5" />
        </svg>
      );
    case "research":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l2 2" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
  }
}

export default function Resume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data, error } = await supabase
          .from("my_resume")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        if (error) throw error;
        setResumes(data || []);
      } catch (err) {
        console.error("Error fetching resumes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <NavNavigate />
      <ChatRoomComponents />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No resume available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {resumes.map((item) => {
              const theme = COLOR_MAP[item.color_theme] || COLOR_MAP.blue;
              return (
                <div
                  key={item.id}
                  className={`bg-white p-5 rounded-lg border border-gray-200 ${theme.hover} transition-colors`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${theme.bg} p-2 rounded-full`}>
                      <ResumeIcon type={item.icon_type} colorClass={theme.text} />
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-900">{item.title}</h2>
                      {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-5">{item.description}</p>
                  )}
                  {item.pdf_url ? (
                    <a
                      href={item.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium ${theme.text} hover:opacity-80 inline-flex items-center`}
                    >
                      View PDF <span className="ml-1">→</span>
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 italic">PDF not available</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}