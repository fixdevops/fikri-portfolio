import { Link } from "react-router-dom";

export default function EducationSection() {
  return (
    <div>
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
          <i className="ri-graduation-cap-fill"></i> Education
        </h2>
        <Link to="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View more
        </Link>
      </div>

      <div className="flex flex-col gap-3">

        {/* Universitas Nahdlatul Ulama Sunan Giri */}
        <div className="border border-gray-200 bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-shrink-0 hidden sm:block">
            <img
              src="https://tse1.mm.bing.net/th/id/OIP.8UfP6OWKexvzq3fPZBchqgHaHa?pid=Api&P=0&h=180"
              alt="UNUGIRI Logo"
              className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-1"
            />
          </div>
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mb-2">
              <h3 className="text-base font-bold text-gray-800 leading-snug">
                Universitas Nahdlatul Ulama Sunan Giri
              </h3>
              <span className="text-sm text-gray-500 mt-1 sm:mt-0">Present</span>
            </div>
            <div className="mb-2">
              <p className="text-sm text-zinc-500 font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 w-fit">
                🎓 student
              </p>
            </div>
            <p className="text-[14px] text-gray-700 text-justify leading-relaxed">
              Currently studying Informatics at Universitas Nahdlatul Ulama Sunan Giri (UNUGIRI). 
              Passionate about technology, cybersecurity, and web development.
            </p>
          </div>
        </div>

        {/* MA Sunan Drajat Geger Kedungadem */}
        <div className="border border-gray-200 bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-shrink-0 hidden sm:block">
             <img
              src="https://tse3.mm.bing.net/th/id/OIP.g_SnrGovQ3Z0lyxWWlUvnwHaHe?pid=Api&P=0&h=180"
              alt="UNUGIRI Logo"
              className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-1"
            />
          </div>
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mb-2">
              <h3 className="text-base font-bold text-gray-800 leading-snug">
                MTs/MA Sunan Drajat Geger Kedungadem
              </h3>
              <span className="text-sm text-gray-500 mt-1 sm:mt-0">Graduated</span>
            </div>
            <div className="mb-2">
              <p className="text-sm text-zinc-500 font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 w-fit">
                🏬 school alumni
              </p>
            </div>
            <p className="text-[14px] text-gray-700 text-justify leading-relaxed">
              I completed my secondary education at Sunan Drajat Geger Kedungadem Islamic Junior High School (MTS) and Islamic Senior High School (MA). During my studies, I focused on character and academic development, while fostering discipline and an early interest in technology..
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
