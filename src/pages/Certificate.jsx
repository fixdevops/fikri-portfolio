import React, { useState, useEffect } from "react";
import NavNavigate from "../components/NavNavigate";
import Footer from "../components/Footer";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import ChatRoomComponents from "../components/ChatRoom";

export default function Certificate() {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("certificate");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data, error } = await supabase
          .from("my_certificate")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const certificatesData = data || [];
        setCertificates(certificatesData);
        setFilteredCertificates(certificatesData.filter(c => c.category === "certificate"));
      } catch (error) {
        console.error("Error fetching certificates: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  useEffect(() => {
    const filtered = certificates.filter(cert => {
      const matchesCategory = cert.category === activeCategory;
      const matchesSearch = cert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.description && cert.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
    setFilteredCertificates(filtered);
  }, [searchTerm, activeCategory, certificates]);

  const openModal = (certificate) => {
    setSelectedImage(certificate);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <NavNavigate />
      <ChatRoomComponents />
      <section className="max-w-4xl mx-auto px-5 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-6">
          <div className="w-full sm:w-72">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input type="text" placeholder="Search certificates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border text-gray-700 bg-white border-gray-300 rounded-md" />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <div className="hidden sm:flex gap-2">
              <button onClick={() => setActiveCategory("certificate")} className={`px-4 py-2 text-sm rounded-md font-medium transition-colors border ${activeCategory === "certificate" ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Certificates</button>
              <button onClick={() => setActiveCategory("badge")} className={`px-4 py-2 text-sm rounded-md font-medium transition-colors border ${activeCategory === "badge" ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Badges</button>
            </div>
            <div className="sm:hidden w-full">
              <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="w-full bg-white px-4 py-2 text-gray-800 border border-gray-300 rounded-md text-sm appearance-none">
                <option value="certificate">Certificates</option>
                <option value="badge">Badges</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-800">No {activeCategory === "certificate" ? "certificates" : "badges"} found{searchTerm && ` for "${searchTerm}"`}</p>
          </div>
        ) : (
          <div className="grid gap-3 text-gray-800 dark:text-gray-200">
            {activeCategory === "badge" && (
              <div>
                <a href="https://www.cloudskillsboost.google/public_profiles/a0413875-4f2d-4c72-b551-524e6cffb45d" target="_blank" rel="noopener noreferrer">
                  <img src="https://i.ibb.co.com/PZsQdbPZ/Screenshot-2025-02-08-013127.png" alt="Badge" className="w-full object-cover border border-gray-200 shadow-md rounded-[10px]" />
                </a>
              </div>
            )}
            <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredCertificates.map((certificate) => (
                <div key={certificate.id} className={`w-full bg-white rounded-lg overflow-hidden border border-gray-200 ${certificate.category === "badge" ? "border-2 border-gray-200" : ""}`}>
                  <div className="sertif-image h-48 overflow-hidden relative cursor-pointer" onClick={() => openModal(certificate)}>
                    <img src={certificate.image_url} alt={certificate.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Certificate+Image'; }} />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 text-left truncate">{certificate.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />

      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button onClick={closeModal} className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="bg-white rounded-lg overflow-hidden">
              <img src={selectedImage.image_url} alt={selectedImage.title} className="w-full h-auto max-h-[80vh] object-contain" />
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-800">
                  {selectedImage.title}{' '}
                  <a href={selectedImage.course_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">[view details]</a>
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}