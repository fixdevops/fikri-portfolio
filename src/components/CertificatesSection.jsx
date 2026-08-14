import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function CertificatesSection() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data, error } = await supabase
          .from("my_certificate")
          .select("*")
          .eq("is_pinned", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setCertificates(data || []);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center w-full">
        <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-award-fill"></i> Certifications
        </h2>
        <Link to="/certificates" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View more
        </Link>
      </div> <br />
      
      {loading ? (
         <div className="flex justify-center p-4">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
         </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-lg text-gray-500">
           No pinned certificates. Pin certificates from the admin panel.
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="sertif-image overflow-hidden bg-gray-50 flex items-center justify-center h-40 relative">
                  {cert.image_url?.endsWith(".pdf") ? (
                    <>
                      <iframe
                        src={`${cert.image_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        className="w-full h-full border-0 pointer-events-none"
                        title={cert.title}
                      />
                      {/* overlay transparan supaya klik card tidak masuk ke iframe */}
                      <div className="absolute inset-0" />
                    </>
                  ) : cert.image_url?.endsWith(".html") || cert.image_url?.endsWith(".htm") ? (
                    <>
                      <iframe
                        src={cert.image_url}
                        className="w-full h-full border-0 pointer-events-none scale-[0.5] origin-top-left"
                        style={{ width: "200%", height: "200%" }}
                        title={cert.title}
                        sandbox="allow-same-origin"
                      />
                      <div className="absolute inset-0" />
                    </>
                  ) : (
                    <img
                      src={cert.image_url || "https://via.placeholder.com/400x300?text=No+Image"}
                      alt={cert.title}
                      className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-600 text-left line-clamp-1">
                    {cert.title}
                  </h3>
                   <div className="mt-2">
                    <Link
                      to="/certificates"
                      className="inline-block w-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-md transition duration-200 text-center text-xs"
                    >
                      View Details
                    </Link>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}