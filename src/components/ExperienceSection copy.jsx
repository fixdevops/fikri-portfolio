import { Link } from "react-router-dom";

export default function ExperienceSection() {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-briefcase-4-fill"></i> Experience
        </h2>
        <Link to="https://www.linkedin.com/in/mfikriasyamjauhary/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View more
        </Link>
      </div>

      {/* Content - Two column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

        {/* Column 1 */}
        <div className="space-y-2">

          {/* Frontend / React Dev */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                <i className="ri-reactjs-line"></i>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">Frontend Developer</h3>
                <p className="text-xs text-gray-600">React.js & Next.js Enthusiast</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Building modern, responsive web applications using React.js and Next.js. Focused on clean UI, performance optimization, and great user experience.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">React.js</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Next.js</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Tailwind CSS</span>
            </div>
          </div>

          {/* Cybersecurity */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl">
                <i className="ri-shield-keyhole-line"></i>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">Cybersecurity Engineer</h3>
                <p className="text-xs text-gray-600">Penetration Tester</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Passionate about cybersecurity with hands-on experience in penetration testing, vulnerability assessment, and ethical hacking techniques.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Pentesting</span>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Ethical Hacking</span>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">CTF</span>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-2">

          {/* Next.js / Fullstack */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl">
                <i className="ri-code-box-line"></i>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">Fullstack Web Developer</h3>
                <p className="text-xs text-gray-600">Next.js & Node.js</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Developing fullstack applications with Next.js, integrating REST APIs, Firebase, and databases to deliver end-to-end web solutions.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Next.js</span>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Node.js</span>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Firebase</span>
            </div>
          </div>

          {/* University */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                className="h-10 w-10 rounded-full object-contain border border-gray-200 p-1"
                src="https://tse1.mm.bing.net/th/id/OIP.8UfP6OWKexvzq3fPZBchqgHaHa?pid=Api&P=0&h=180"
                alt="UNUGIRI"
              />
              <div>
                <h3 className="text-base font-semibold text-gray-800">Informatics Student</h3>
                <p className="text-xs text-gray-600">Universitas Nahdlatul Ulama Sunan Giri</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Currently pursuing a degree in Informatics, deepening knowledge in software engineering, networking, and cybersecurity fundamentals.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Informatics</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Networking</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Present</span>
            </div>
          </div>
        </div>

        {/* Web Security Project - Full width */}
        <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
              <i className="ri-bug-line"></i>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">Web Security & Vulnerability Research</h3>
              <p className="text-xs text-gray-600">Personal Projects & CTF Challenges</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Actively participating in Capture The Flag (CTF) competitions and web security research. Experienced in identifying OWASP Top 10 vulnerabilities including SQL Injection, XSS, and CSRF. Combining development skills with security mindset to build more secure applications.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">OWASP Top 10</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">SQL Injection</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">XSS</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Burp Suite</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Kali Linux</span>
          </div>
        </div>

      </div>
    </div>
  );
}