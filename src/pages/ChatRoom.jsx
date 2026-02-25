import React from "react";
import NavNavigate from "../components/NavNavigate";
import Footer from "../components/Footer";
import ChatRoomComponents from "../components/ChatRoom";

export default function ChatRoom() {
  return (
    <div className="bg-white min-h-screen text-gray-900">
      <NavNavigate />
      <ChatRoomComponents />
      <section className="max-w-4xl mx-auto px-5 pt-4 pb-16">
        <div className="text-center py-20">
          <i className="ri-message-2-line text-5xl text-gray-300 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Chat Room</h1>
          <p className="text-gray-500">
            Klik ikon chat di kanan bawah untuk mulai percakapan!
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
