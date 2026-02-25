import React from 'react'
import NavNavigate from '../components/NavNavigate'
import Footer from '../components/Footer'

export default function ShortcutPage() {
    return (
        <div className="bg-gray-50 min-h-screen text-gray-800 transition-colors duration-300">
            <NavNavigate />

            <section className="max-w-4xl mx-auto px-4 sm:px-5 pt-4 pb-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Halaman Pintasan</h1>
                    <p className="text-gray-600">Akses cepat ke berbagai layanan</p>
                </div>

                {/* Social Media Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="ri-share-circle-line mr-2"></i> Media Sosial
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                        <DanaStyleCard
                            icon="ri-instagram-line"
                            title="Instagram"
                            color="bg-gradient-to-br from-pink-500 to-purple-600"
                            href="https://www.instagram.com/fikriasyam.0"
                        />
                        <DanaStyleCard
                            icon="ri-tiktok-line"
                            title="TikTok"
                            color="bg-gray-900"
                            href="https://www.tiktok.com/@fikriasyam3.01"
                        />
                        <DanaStyleCard
                            icon="ri-youtube-line"
                            title="YouTube"
                            color="bg-red-500"
                            href="https://youtube.com/@fikriasyam3.01"
                        />
                        <DanaStyleCard
                            icon="ri-linkedin-line"
                            title="LinkedIn"
                            color="bg-blue-600"
                            href="https://www.linkedin.com/in/mfikriasyamjauhary"
                        />
                        <DanaStyleCard
                            icon="ri-github-line"
                            title="GitHub"
                            color="bg-gray-800"
                            href="https://github.com/fixdevops"
                        />
                        <DanaStyleCard
                            icon="ri-mail-line"
                            title="Email"
                            color="bg-red-400"
                            href="mailto:fixzdeveloper@gmail.com"
                        />
                        <DanaStyleCard
                            icon="ri-whatsapp-line"
                            title="WhatsApp"
                            color="bg-green-500"
                            href="https://wa.me/6282285512813"
                        />
                        <DanaStyleCard
                            icon="ri-twitter-x-line"
                            title="Twitter/X"
                            color="bg-black"
                            href="#"
                        />
                    </div>
                </section>

                {/* Security Tools Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="ri-shield-keyhole-line mr-2"></i> Security Tools
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                        <DanaStyleCard
                            icon="ri-bug-line"
                            title="HackTheBox"
                            color="bg-green-600"
                            href="https://www.hackthebox.com"
                        />
                        <DanaStyleCard
                            icon="ri-terminal-box-line"
                            title="TryHackMe"
                            color="bg-red-600"
                            href="https://tryhackme.com"
                        />
                        <DanaStyleCard
                            icon="ri-shield-check-line"
                            title="PortSwigger"
                            color="bg-orange-500"
                            href="https://portswigger.net/web-security"
                        />
                        <DanaStyleCard
                            icon="ri-search-eye-line"
                            title="Shodan"
                            color="bg-red-800"
                            href="https://www.shodan.io"
                        />
                    </div>
                </section>

                {/* Dev Tools Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="ri-tools-line mr-2"></i> Dev Tools
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                        <DanaStyleCard
                            icon="ri-code-box-line"
                            title="GitHub"
                            color="bg-gray-800"
                            href="https://github.com/fixdevops"
                        />
                        <DanaStyleCard
                            icon="ri-brain-line"
                            title="ChatGPT"
                            color="bg-emerald-500"
                            href="https://chat.openai.com"
                        />
                        <DanaStyleCard
                            icon="ri-palette-line"
                            title="Canva"
                            color="bg-sky-500"
                            href="https://www.canva.com"
                        />
                        <DanaStyleCard
                            icon="ri-cloud-line"
                            title="Google Drive"
                            color="bg-yellow-500"
                            href="https://drive.google.com"
                        />
                        <DanaStyleCard
                            icon="ri-file-word-line"
                            title="Notion"
                            color="bg-gray-700"
                            href="https://notion.so"
                        />
                        <DanaStyleCard
                            icon="ri-global-line"
                            title="Vercel"
                            color="bg-black"
                            href="https://vercel.com"
                        />
                        <DanaStyleCard
                            icon="ri-firebase-line"
                            title="Firebase"
                            color="bg-orange-500"
                            href="https://firebase.google.com"
                        />
                        <DanaStyleCard
                            icon="ri-translate-2"
                            title="DeepL"
                            color="bg-blue-500"
                            href="https://www.deepl.com/translator"
                        />
                    </div>
                </section>

                {/* Contact Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="ri-contacts-line mr-2"></i> Kontak
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                        <DanaStyleCard
                            icon="ri-whatsapp-line"
                            title="WhatsApp"
                            color="bg-green-500"
                            href="https://wa.me/6282285512813"
                        />
                        <DanaStyleCard
                            icon="ri-mail-send-line"
                            title="Email"
                            color="bg-red-400"
                            href="mailto:fixzdeveloper@gmail.com"
                        />
                        <DanaStyleCard
                            icon="ri-linkedin-line"
                            title="LinkedIn"
                            color="bg-blue-600"
                            href="https://www.linkedin.com/in/mfikriasyamjauhary"
                        />
                        <DanaStyleCard
                            icon="ri-github-line"
                            title="GitHub"
                            color="bg-gray-800"
                            href="https://github.com/fixdevops"
                        />
                    </div>
                </section>
            </section>
            <Footer />
        </div>
    )
}

// Komponen Kartu
function DanaStyleCard({ icon, title, href, color }) {
    return (
        <a
            href={href}
            target={href !== '#' ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center rounded-2xl p-4 min-w-[80px] h-[110px] shadow-sm hover:shadow-md transition-all duration-300 bg-white hover:-translate-y-1"
        >
            <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white mb-2`}>
                <i className={`${icon} text-2xl`}></i>
            </div>
            <h3 className="font-medium text-gray-800 text-xs text-center">{title}</h3>
        </a>
    )
}