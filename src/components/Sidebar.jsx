import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Tv2,
  Film,
  FolderKanban,
  Award,
  BookOpen,
  Quote,
  Music2,
  MessageSquare,
  X,
  Zap,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Manage Animes",
    path: "/dashboard/manage-animes",
    icon: Tv2,
  },
  {
    label: "Manage Reels",
    path: "/dashboard/animes/manage-reels",
    icon: Film,
  },
  {
    label: "Manage Projects",
    path: "/dashboard/frontdev/manage-projects",
    icon: FolderKanban,
  },
  {
    label: "Certificates",
    path: "/dashboard/frontdev/manage-certificates",
    icon: Award,
  },
  {
    label: "Manage Blogs",
    path: "/dashboard/frontdev/manage-blogs",
    icon: BookOpen,
  },
  {
    label: "Manage Quotes",
    path: "/dashboard/creator/manage-quotes",
    icon: Quote,
  },
  {
    label: "Manage Audio",
    path: "/dashboard/creator/manage-audio",
    icon: Music2,
  },
  {
    label: "Manage Chat",
    path: "/dashboard/manage-chat",
    icon: MessageSquare,
  },
];

export default function Sidebar({ onClose }) {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col z-50 shadow-lg">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Admin Panel</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Fikri Asyam</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Tutup sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
          Menu
        </p>
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                    isActive
                      ? "bg-gray-900 text-white font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-700"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70 flex-shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center">
          © {new Date().getFullYear()} Fikri Asyam
        </p>
      </div>
    </div>
  );
}
