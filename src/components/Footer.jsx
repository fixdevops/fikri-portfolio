import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-t-gray-200 py-3 mt-4">
      <div className="px-4 sm:mx-auto text-gray-800 max-w-4xl flex justify-between items-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Fikri Asyam, All right reserved.
        </p>
        {/* Container untuk icon */}
        <div className="flex space-x-3 sm:space-x-4 ml-auto text-gray-800 items-center justify-center sm:justify-start">
        <Link
            to="https://github.com/fixdevops"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl"
          >
            <i className="ri-github-fill"></i>
          </Link>
          <Link
            to="https://www.tiktok.com/@fikriasyam3.01"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl"
          >
            <i className="ri-tiktok-fill"></i>
          </Link>
          <Link
            to="https://www.instagram.com/fikriasyam.0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl"
          >
            <i className="ri-instagram-line"></i>
          </Link>
        </div>
      </div>
    </footer>
  );
}
