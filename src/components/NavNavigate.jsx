import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavCreator = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', icon: 'ri-home-4-line', activeIcon: 'ri-home-4-fill', label: 'Home' },
    { path: '/projects', icon: 'ri-code-s-slash-line', activeIcon: 'ri-code-s-slash-fill', label: 'Projects' },
    { path: '/certificates', icon: 'ri-folders-line', activeIcon: 'ri-folders-fill', label: 'Certificates' },
    { path: '/blogs', icon: 'ri-news-line', activeIcon: 'ri-news-fill', label: 'Blogs' },
    { path: '/others', icon: 'ri-apps-line', activeIcon: 'ri-apps-fill', label: 'Others', hideOnDesktop: true },
  ];

  // item tambahan yang hanya muncul di sidebar mobile (tidak di bottom nav)
  const sidebarOnlyItems = [
    { path: '/anime', icon: 'ri-tv-2-line', activeIcon: 'ri-tv-2-fill', label: 'Anime' },
    { path: '/reels', icon: 'ri-film-line', activeIcon: 'ri-film-fill', label: 'Reels' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto max-w-4xl px-3 py-2">
          <div className="flex items-center justify-between">
            {/* Desktop Logo - Hidden di Mobile */}
            <Link to="/" className="hidden md:flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-800">Fikri Asyam</span>
            </Link>

            {/* Mobile Menu Icon - Kiri */}
            <button
              className="md:hidden text-gray-800 p-2 rounded-lg hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              <i className="ri-menu-2-line text-xl"></i>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                if (item.hideOnDesktop) return null;
                return (
                  <div key={item.path} className="relative">
                    <Link
                      to={item.path}
                      className={`text-black hover:text-gray-600 transition-colors font-medium ${location.pathname === item.path ? 'text-gray-600 font-semibold' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              })}
              <Link to="/anime" className={`text-black hover:text-gray-600 transition-colors font-medium ${location.pathname === '/anime' ? 'text-gray-600 font-semibold' : ''}`}>Anime</Link>
              <Link to="/reels" className={`text-black hover:text-gray-600 transition-colors font-medium ${location.pathname === '/reels' ? 'text-gray-600 font-semibold' : ''}`}>Reels</Link>
            </div>

            {/* Resumes Button - Kanan (Mobile & Desktop) */}
            <Link
              to="/resume"
              className="text-gray-800 font-medium rounded-lg text-sm px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100"
            >
              Resumes
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={closeSidebar}
        ></div>

        {/* Sidebar Content */}
        <div className={`absolute left-0 top-0 h-full w-[230px] max-w-xs bg-white shadow-xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link to="/" className="flex items-center space-x-2" onClick={closeSidebar}>
                <span className="text-xl font-bold text-gray-800">FIXz</span>
              </Link>
              <button
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={closeSidebar}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-1 px-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                          ? 'bg-gray-100 text-gray-800'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                      onClick={closeSidebar}
                    >
                      <i className={`${isActive ? item.activeIcon : item.icon} mr-3 text-xl`}></i>
                      {item.label}
                    </Link>
                  );
                })}

                {/* Anime & Reels — hanya di sidebar */}
                {sidebarOnlyItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                          ? 'bg-gray-100 text-gray-800'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                      onClick={closeSidebar}
                    >
                      <i className={`${isActive ? item.activeIcon : item.icon} mr-3 text-xl`}></i>
                      {item.label}
                    </Link>
                  );
                })}

                {/* Resumes Link in Sidebar */}
                <Link
                  to="/resume"
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${location.pathname === '/resume'
                      ? 'bg-gray-100 text-gray-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  onClick={closeSidebar}
                >
                  <i className={`ri-file-list-line mr-3 text-xl ${location.pathname === '/resume' ? 'ri-file-list-fill' : ''}`}></i>
                  Resumes
                </Link>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <i className="ri-github-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <i className="ri-twitter-x-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <i className="ri-linkedin-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <i className="ri-instagram-line text-xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-white shadow-lg border-t border-gray-100">
        <div className="grid grid-cols-5 h-[55px]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center text-[11px] transition-colors"
              >
                <i className={`${isActive ? item.activeIcon : item.icon} text-[22px] ${isActive ? 'text-gray-700' : 'text-gray-500'}`} />
                <span className={isActive ? 'text-gray-700 font-medium' : 'text-gray-500'}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Konten halaman dengan padding biar ga ketiban */}
      <main className="pb-[64px]">{children}</main>
    </>
  );
};

export default NavCreator;