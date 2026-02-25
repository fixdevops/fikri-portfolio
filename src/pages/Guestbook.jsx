import React from "react";
import NavNavigate from "../components/NavNavigate";
import Footer from "../components/Footer";
import Giscus from '@giscus/react';
import ChatRoomComponents from "../components/ChatRoom";

export default function Page() {
    return (
        <div className="bg-white min-h-screen text-gray-300 transition-colors duration-300">
            <NavNavigate />
            <ChatRoomComponents />
            <section className="max-w-4xl mx-auto px-6 pt-4">

                <div className="flex justify-between items-center w-full">
                    <h2 className="text-[20px] text-gray-800 font-bold">💬 Discussionn</h2>
                    <a href="/guestbook" className="text-xs text-gray-800">
                        Join the conversation below!
                    </a>
                </div>
                {/* Komentar Giscus langsung tanpa box */}
                {/* 
                  ⚠️ PENTING: Giscus perlu dikonfigurasi dengan repo GitHub kamu sendiri!
                  Langkah-langkah:
                  1. Buat repo public di GitHub dengan nama username kamu (misal: fixdevops/fixdevops)
                  2. Aktifkan GitHub Discussions di repo tersebut
                  3. Kunjungi https://giscus.app/ dan masukkan nama repo kamu
                  4. Copy konfigurasi yang diberikan dan ganti nilai di bawah ini
                */}
                <Giscus
                    id="comments"
                    repo="fixdevops/FixzComment"
                    repoId="R_kgDORTQ_Ww"
                    category="Announcements"
                    categoryId="DIC_kwDORTQ_W84C2uOU"
                    mapping="pathname"
                    reactionsEnabled="1"
                    emitMetadata="0"
                    inputPosition="top"
                    theme="light"
                    lang="en"
                    loading="lazy"
                />
            </section>
            <Footer />
        </div>
    );
}
