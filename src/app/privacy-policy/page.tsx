"use client";

import { useState } from "react";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information-collection", title: "Information We Collect" },
    { id: "how-we-use", title: "How We Use Your Information" },
    { id: "data-sharing", title: "Data Sharing" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "data-security", title: "Data Security" },
    { id: "your-rights", title: "Your Rights" },
    { id: "changes", title: "Policy Changes" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <section className="bg-[#FFFFFF] max-w-[1440px] mx-auto mb-12">
      <SecondaryHeader routeName="Privacy Policy" />

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4 mt-6">
          <div className="lg:w-64 lg:shrink-0">
            <div className="hidden lg:block sticky top-24 bg-white shadow-lg rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4 text-[#B88E2F]">
                Quick Navigation
              </h3>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        const element = document.getElementById(section.id);
                        if (element) {
                          window.scrollTo({
                            top: element.offsetTop - 120,
                            behavior: "smooth",
                          });
                          setActiveSection(section.id);
                        }
                      }}
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
                  onChange={(e) => {
                    const element = document.getElementById(e.target.value);
                    if (element) {
                      window.scrollTo({
                        top: element.offsetTop - 120,
                        behavior: "smooth",
                      });
                      setActiveSection(e.target.value);
                    }
                  }}
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
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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

          <div className="space-y-8">
            <div
              id="introduction"
              className="bg-gradient-to-r from-[#FFE0B2] to-[#FFC1C1] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                At Furniro, we are committed to protecting your privacy and
                ensuring the security of your personal information. This Privacy
                Policy explains how we collect, use, disclose, and safeguard
                your information when you visit our website or make a purchase
                from us.
              </p>
            </div>

            <div
              id="information-collection"
              className="bg-gradient-to-r from-[#CDE7FE] to-[#A5D6FF] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    Personal Information
                  </h3>
                  <p className="text-gray-700">
                    When you create an account, make a purchase, or contact us,
                    we may collect:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Shipping and billing addresses</li>
                    <li>
                      Payment information (processed securely through our
                      payment partners)
                    </li>
                    <li>Order history and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    Automatically Collected Information
                  </h3>
                  <p className="text-gray-700">
                    We automatically collect certain information when you visit
                    our website:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                    <li>IP address and browser type</li>
                    <li>Device information and operating system</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Referring website or search terms</li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              id="how-we-use"
              className="bg-gradient-to-r from-[#FDE2E4] to-[#FAD1D1] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                How We Use Your Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-md shadow-md">
                  <h3 className="font-semibold text-lg text-[#B88E2F] mb-2">
                    Order Processing
                  </h3>
                  <p className="text-gray-700">
                    To process and fulfill your orders, send order
                    confirmations, and provide customer support.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-md">
                  <h3 className="font-semibold text-lg text-[#B88E2F] mb-2">
                    Personalization
                  </h3>
                  <p className="text-gray-700">
                    To personalize your shopping experience and recommend
                    products you might like.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-md">
                  <h3 className="font-semibold text-lg text-[#B88E2F] mb-2">
                    Communication
                  </h3>
                  <p className="text-gray-700">
                    To send you important updates, promotional offers, and
                    newsletters (with your consent).
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-md">
                  <h3 className="font-semibold text-lg text-[#B88E2F] mb-2">
                    Improvements
                  </h3>
                  <p className="text-gray-700">
                    To analyze website usage and improve our products, services,
                    and user experience.
                  </p>
                </div>
              </div>
            </div>

            <div
              id="data-sharing"
              className="bg-gradient-to-r from-[#FFF1D0] to-[#FFD59E] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Data Sharing
              </h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information to third parties. We
                may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Service Providers:</strong> Payment processors,
                  shipping carriers, and IT service providers who assist in our
                  operations.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights, property, or safety.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a
                  merger, acquisition, or sale of all or part of our business.
                </li>
              </ul>
            </div>

            <div
              id="cookies"
              className="bg-gradient-to-r from-[#D4EDDA] to-[#C3E6CB] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Cookies & Tracking Technologies
              </h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your browsing
                experience, analyze site traffic, and personalize content.
              </p>
              <div className="bg-white p-4 rounded-md shadow-md mt-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  Managing Cookies
                </h3>
                <p className="text-gray-700">
                  You can control cookie settings through your browser. However,
                  disabling cookies may affect some website functionality.
                </p>
              </div>
            </div>

            <div
              id="data-security"
              className="bg-gradient-to-r from-[#E2E3E5] to-[#D6D8DB] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Data Security
              </h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your
                personal information from unauthorized access, alteration,
                disclosure, or destruction. These include encryption, secure
                servers, and regular security assessments.
              </p>
            </div>

            <div
              id="your-rights"
              className="bg-gradient-to-r from-[#F8D7DA] to-[#F1B0B7] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Your Rights
              </h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us using the
                information below.
              </p>
            </div>

            <div
              id="changes"
              className="bg-gradient-to-r from-[#D1ECF1] to-[#B6E3EA] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the &quot;Last updated&quot; date. We encourage you
                to review this policy periodically.
              </p>
            </div>

            <div
              id="contact"
              className="bg-gradient-to-r from-[#FFE0B2] to-[#FFC1C1] p-4 lg:p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-white p-4 rounded-md shadow-md">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@furniro.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> 1-800-FURNIRO (1-800-387-6476)
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> 123 Furniture Lane, Design District,
                  FD 12345
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
