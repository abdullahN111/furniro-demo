"use client";
import { useState } from "react";

const PolicyLayout = ({ sections, children }: { sections: { id: string; title: string }[]; children: React.ReactNode }) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 120, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-6">
      <div className="lg:w-64 lg:shrink-0">
        <div className="hidden lg:block sticky top-24 bg-white shadow-lg rounded-lg p-4">
          <h3 className="font-bold text-lg mb-4 text-[#B88E2F]">Quick Navigation</h3>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleScroll(section.id)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    activeSection === section.id
                      ? "bg-[#F9F1E7] text-[#B88E2F] font-medium"
                      : "text-gray-600 hover:text-[#B88E2F]"
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:hidden mb-6">
          <div className="relative">
            <select
              onChange={(e) => handleScroll(e.target.value)}
              value={activeSection}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88E2F] appearance-none bg-white text-gray-700 font-medium"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 flex-1">{children}</div>
    </div>
  );
};

export default PolicyLayout;
