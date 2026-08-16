import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { Menu, LogOut, ChevronRight, Home } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/manage-animes": "Manage Animes",
  "/dashboard/animes/manage-reels": "Manage Reels",
  "/dashboard/frontdev/manage-projects": "Manage Projects",
  "/dashboard/frontdev/manage-certificates": "Manage Certificates",
  "/dashboard/frontdev/manage-blogs": "Manage Blogs",
  "/dashboard/creator/manage-quotes": "Manage Quotes",
  "/dashboard/creator/manage-audio": "Manage Audio",
  "/dashboard/manage-chat": "Manage Chat",
  "/dashboard/manage-education": "Manage Education",
  "/dashboard/manage-experience": "Manage Experience",
};

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      alert("Logout gagal: " + error.message);
    }
  };

  const currentTitle = pageTitles[location.pathname] || "Dashboard";
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 relative">
      {/* Sidebar Desktop - FIXED */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen z-40 w-64">
        <Sidebar />
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-50 h-full w-64">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col w-full md:ml-64 min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-6 h-14 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka sidebar"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 min-w-0 text-sm">
              <span className="text-gray-400 hidden sm:inline-flex items-center gap-1.5">
                <Home size={12} className="flex-shrink-0" />
                <ChevronRight size={12} className="flex-shrink-0" />
              </span>
              {!isDashboard && (
                <span className="text-gray-400 hidden sm:inline">
                  Admin
                  <ChevronRight size={12} className="inline mx-1" />
                </span>
              )}
              <h1 className="text-sm font-semibold text-gray-800 truncate">
                {currentTitle}
              </h1>
            </div>
          </div>

          {/* Right: logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline font-medium">Logout</span>
          </button>
        </header>

        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
