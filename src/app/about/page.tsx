"use client";

import { useState } from "react";
import Image from "next/image";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import OurMission from "@/app/public/assets/images/featured/our-mission.webp";
import OurTeam from "@/app/public/assets/images/featured/our-team.png";

const About = () => {
  const [activeValue, setActiveValue] = useState(0);

  const values = [
    {
      title: "Quality Craftsmanship",
      description:
        "Delivering the finest craftsmanship with attention to every detail",
      icon: "🎯",
    },
    {
      title: "Sustainability",
      description:
        "Caring for the planet with eco-conscious designs and materials",
      icon: "🌱",
    },
    {
      title: "Customer Focus",
      description: "Putting your needs first every step of the way",
      icon: "❤️",
    },
    {
      title: "Innovation",
      description: "Pushing boundaries in design and functionality",
      icon: "💡",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "15+", label: "Years Experience" },
    { number: "50+", label: "Award Wins" },
    { number: "100%", label: "Satisfaction Guarantee" },
  ];

  return (
    <section className="bg-[#FFFFFF] max-w-[1440px] mx-auto shadow-md">
      <SecondaryHeader routeName="About" />

      <div className="relative bg-gradient-to-br from-[#F9F1E7] to-[#FFE0B2] py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
            Crafting Spaces, Creating Stories
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            At Furniro, we don&apos;t just sell furniture we help you create
            environments that inspire, comfort, and reflect your unique
            personality.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-[#B88E2F] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              Our Journey
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800">
              Our Story
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Born from a passion for exceptional design and quality
              craftsmanship, Furniro began as a small workshop in 2008. Today,
              we&apos;ve grown into a trusted name in furniture design, serving
              thousands of customers worldwide while staying true to our core
              values.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our journey has been guided by a simple belief: great furniture
              should be beautiful, functional, and built to last. Every piece we
              create tells a story of dedication, innovation, and love for the
              craft.
            </p>
          </div>
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={OurMission}
              alt="Our Story"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#CDE7FE] to-[#A5D6FF] rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">
            <Image
              src={OurMission}
              alt="Our Mission"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-block bg-[#B88E2F] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              Our Purpose
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              To transform houses into homes by creating beautiful, functional
              furniture that resonates with your lifestyle. We combine timeless
              aesthetics with sustainable practices to bring you products that
              make life better—one piece at a time.
            </p>
            <ul className="space-y-3">
              {[
                "Ethically sourced materials",
                "Lifetime craftsmanship warranty",
                "Carbon-neutral shipping",
                "Custom design services",
              ].map((item, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-[#B88E2F] rounded-full mr-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block bg-[#B88E2F] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              What Drives Us
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600">
              These principles guide every decision we make and every piece we
              create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  activeValue === index
                    ? "border-[#B88E2F] bg-[#F9F1E7] transform scale-105"
                    : "border-gray-200 hover:border-[#B88E2F]"
                }`}
                onMouseEnter={() => setActiveValue(index)}
              >
                <div className="text-3xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-[#B88E2F] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              The People Behind
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Behind Furniro is a passionate team of designers, artisans, and
              innovators who share a common vision: to create furniture that
              inspires and endures. Our diverse backgrounds and expertise come
              together to push the boundaries of creativity and craftsmanship.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Master Craftspeople",
                "Interior Designers",
                "Sustainability Experts",
                "Customer Care Specialists",
              ].map((role, index) => (
                <div key={index} className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-[#B88E2F] rounded-full mr-3"></span>
                  {role}
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={OurTeam}
              alt="Our Team"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
              <div className="p-6 text-white">
                <p className="text-sm opacity-90">
                  Dedicated team of 50+ professionals
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#FFE0B2] to-[#FFC1C1] rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have made Furniro their
            trusted partner in creating beautiful, functional living spaces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#B88E2F] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#A07D2A] transition-colors">
              Explore Our Collections
            </button>
            <button className="border-2 border-[#B88E2F] text-[#B88E2F] px-8 py-3 rounded-lg font-medium hover:bg-[#B88E2F] hover:text-white transition-colors">
              Book a Consultation
            </button>
          </div>
        </div>
      </div>

      <ServiceBar />
    </section>
  );
};

export default About;
