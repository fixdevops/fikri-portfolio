export default function SkillsSection() {
  const webSkills = [
    'HTML', 'CSS', 'JavaScript', 'React.js', 'Next.js',
    'Node.js', 'Tailwind CSS', 'Bootstrap', 'Git/Github',
    'Firebase', 'Figma', 'Canva',
  ];

  const securitySkills = [
    'Kali Linux', 'Linux', 'Burp Suite', 'Pentesting',
    'CTF', 'OWASP Top 10', 'Nmap',
  ];

  return (
    <div>
      <h2 className="text-[18px] font-bold text-gray-800 mb-3 flex items-center gap-2">
        <i className="ri-code-s-slash-line"></i> Skills & Technologies
      </h2>

      {/* Web Dev Skills */}
      <div className="mb-3">
        <p className="text-xs text-gray-400 font-mono mb-2 flex items-center gap-1">
          <i className="ri-global-line"></i> Web Development
        </p>
        <ul className="flex flex-wrap gap-2 list-none p-0">
          {webSkills.map(skill => (
            <li
              key={skill}
              className="bg-white text-gray-700 border border-gray-200 rounded-lg py-1 px-3 text-sm hover:bg-gray-50 transition-colors shadow-sm"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      {/* Cybersecurity Skills */}
      <div>
        <p className="text-xs text-gray-400 font-mono mb-2 flex items-center gap-1">
          <i className="ri-shield-keyhole-line"></i> Cybersecurity
        </p>
        <ul className="flex flex-wrap gap-2 list-none p-0">
          {securitySkills.map(skill => (
            <li
              key={skill}
              className="bg-white text-red-700 border border-red-100 rounded-lg py-1 px-3 text-sm hover:bg-red-50 transition-colors shadow-sm"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}