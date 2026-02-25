import { Link } from "react-router-dom";

export default function ProfileSection() {
  return (
    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
      {/* Foto */}
      <div className="flex items-center space-x-4 md:block">
        <img
          src={`${import.meta.env.BASE_URL}fotoprofile fixz.png`}
          alt="profile pic"
          className="rounded-full duration-150 w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 border-2 border-white shadow-md object-cover"
        />
        {/* Nama & Role (Mobile) */}
        <div className="md:hidden">
          <h1 className="text-xl sm:text-[18px] font-bold text-gray-800">Fikri Asyam</h1>
          <p className="text-xs sm:text-sm font-mono text-gray-600">
            Cysec Engineer || Software Engineer
          </p>
        </div>
      </div>

      {/* Deskripsi Profil */}
      <div className="text-left md:flex-1">
        <div className="hidden md:block">
          <h1 className="text-[18px] font-bold text-gray-800">Fikri Asyam</h1>
          <p className="text-sm font-mono text-gray-600">
            Cysec Engineer || Software Engineer
          </p>
        </div>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-700 text-left">
          I am Fikri, a passionate and creative student. I have a deep interest in programming, which motivates me to keep learning and growing. With an educational background at Universitas Nahdlatul Ulama Sunan Giri, I believe that self-development is the key to achieving goals, and I am always looking for opportunities to sharpen my skills and knowledge.
          <br />
          I believe that every day is an opportunity to learn something new and create valuable moments. In my life, I strive to be a dedicated and persistent individual. I hope to contribute positively to the world around me and continue to grow as a person.
          {/* I'm an Information Systems student with a strong passion for Front-End Development. I specialize in crafting responsive, user-friendly websites using React, Tailwind CSS, and modern tech stacks—combining functionality with clean design.
          <br />
          Beyond tech, I’m also a content creator with 80K+ followers across Instagram. I share motivational quotes and personal stories to inspire and engage audiences—shaping how I communicate, empathize, and build user-focused digital experiences.
          <Link to="https://creator-fatkhurrhn.vercel.app/">
            <span className="font-bold ml-1 text-blue-600 hover:underline">
              → Check out my creator side
            </span>
          </Link> */}
        </p>

        {/* Social Links */}
        <div className="hidden md:flex gap-4 mt-4 justify-center md:justify-start text-xl text-gray-600">
          <a href="https://github.com/fixdevops" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
            <i className="ri-github-fill"></i>
          </a>
          <a href="https://www.linkedin.com/in/mfikriasyamjauhary" target="_blank" rel="noopener noreferrer" className="hover:text-[#0077B5] transition-colors">
            <i className="ri-linkedin-fill"></i>
          </a>
          <a href="mailto:fixzdeveloper@gmail.com" className="hover:text-red-500 transition-colors">
            <i className="ri-mail-fill"></i>
          </a>
          <a href="https://www.instagram.com/fikriasyam.0?igsh=aTJwa296bzQ5bGMy" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">
            <i className="ri-instagram-line"></i>
          </a>
          <a href="https://www.tiktok.com/@fikriasyam3.01?_r=1&_t=ZS-940DYQulidg" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
            <i className="ri-tiktok-fill"></i>
          </a>
        </div>
      </div>
    </div>
  );
}
