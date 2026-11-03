"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import OurMission from "@/app/public/assets/images/featured/our-mission.webp";
import OurTeam from "@/app/public/assets/images/featured/our-team.png";
import ExploreImage2 from "@/app/public/assets/images/products/ExploreImage2.png";
import {
  FiAward,
  FiFeather,
  FiHeart,
  FiCpu,
  FiCheck,
  FiArrowRight,
  FiCompass,
} from "react-icons/fi";

const About = () => {
  const [activeValue, setActiveValue] = useState(0);

  const values = [
    {
      title: "Quality Craftsmanship",
      description:
        "Every joint, seam, and finish is hand-inspected by master artisans for heirloom durability.",
      icon: FiAward,
    },
    {
      title: "Sustainable Materials",
      description:
        "Responsibly harvested timber, low-VOC finishes, and eco-conscious packaging in every shipment.",
      icon: FiFeather,
    },
    {
      title: "Customer-First Design",
      description:
        "Ergonomic comfort, modular flexibility, and attentive support from showroom to living room.",
      icon: FiHeart,
    },
    {
      title: "Timeless Innovation",
      description:
        "Blending Scandinavian-inspired minimalism with modern durability for everyday living.",
      icon: FiCpu,
    },
  ];

  const stats = [
    { number: "10K+", label: "Homes Furnished" },
    { number: "15+", label: "Years of Craft" },
    { number: "50+", label: "Design Awards" },
    { number: "100%", label: "Quality Guarantee" },
  ];

  return (
    <section className="bg-white max-w-[1440px] mx-auto">
      <SecondaryHeader routeName="About" />

      {/* Editorial Intro Banner */}
      <div className="bg-[#FCF8F3] border-b border-[#f0e4d3] py-16 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#B88E2F] bg-[#F9F1E7] px-4 py-1.5 rounded-full mb-4">
            Est. 2008 &bull; Design Studio
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-5">
            Crafting Spaces, Creating Stories
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            At Furniro, we don&apos;t just build furniture&mdash;we help you
            shape warm, inviting environments that comfort, inspire, and reflect
            how you live.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 space-y-24">
        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 bg-[#F9F1E7] text-[#B88E2F] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <FiCompass /> Our Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              From a Small Workshop to Modern Homes Everywhere
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Born from a passion for architectural lines and tactile warmth,
              Furniro began as an independent woodworking studio in 2008. Today,
              we partner with sustainable ateliers to bring thoughtfully
              proportioned pieces into thousands of homes.
            </p>
            <p className="text-base text-gray-600 leading-relaxed">
              Our philosophy remains simple: great furniture should feel
              effortless, age gracefully, and elevate daily rituals—from morning
              coffee to family dinners.
            </p>
          </div>
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xl border border-[#f0e4d3]">
            <Image
              src={ExploreImage2}
              alt="Furniro signature living space"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Brand Stats Banner */}
        <div className="bg-[#F9F1E7] border border-[#f0e4d3] rounded-2xl p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#e5d6c0]">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center ${index > 0 ? "pt-6 sm:pt-0 sm:pl-6" : ""}`}
              >
                <div className="text-3xl sm:text-4xl font-bold text-[#B88E2F] mb-1.5">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-700 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xl border border-[#f0e4d3] order-2 lg:order-1">
            <Image
              src={OurMission}
              alt="Furniro craftsmanship and materials"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-5 order-1 lg:order-2">
            <span className="inline-block bg-[#F9F1E7] text-[#B88E2F] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Our Purpose
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Designed for Longevity, Built with Integrity
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              To transform houses into sanctuaries by uniting timeless
              proportions with responsible production. Every collection is
              engineered for real life—easy to maintain, endlessly versatile,
              and backed by our craftsmanship guarantee.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "Ethically sourced solid hardwoods",
                "2-year craftsmanship warranty",
                "Carbon-conscious delivery",
                "Complimentary styling advice",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm font-medium text-gray-700"
                >
                  <span className="w-5 h-5 rounded-full bg-[#F9F1E7] text-[#B88E2F] flex items-center justify-center shrink-0">
                    <FiCheck className="text-xs" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block bg-[#F9F1E7] text-[#B88E2F] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              What Drives Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Our Core Values
            </h2>
            <p className="text-base text-gray-600">
              The principles that guide every sketch, material choice, and
              customer delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              const isSelected = activeValue === index;
              return (
                <div
                  key={value.title}
                  onMouseEnter={() => setActiveValue(index)}
                  onClick={() => setActiveValue(index)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-[#B88E2F] bg-[#FCF8F3] shadow-lg -translate-y-1"
                      : "border-gray-200 bg-white hover:border-[#B88E2F]/60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      isSelected
                        ? "bg-[#B88E2F] text-white"
                        : "bg-[#F9F1E7] text-[#B88E2F]"
                    }`}
                  >
                    <Icon className="text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meet Our Team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="inline-block bg-[#F9F1E7] text-[#B88E2F] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              The People Behind Furniro
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Meet Our Artisans & Designers
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Behind every Furniro collection is a collaborative team of
              industrial designers, cabinetmakers, textile specialists, and
              client advisors dedicated to making your home feel extraordinary.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                "Master Woodworkers",
                "Interior Stylists",
                "Sustainability Specialists",
                "Client Concierge Team",
              ].map((role) => (
                <div
                  key={role}
                  className="flex items-center gap-2.5 text-sm font-medium text-gray-700 bg-[#FCF8F3] p-3 rounded-xl border border-[#f0e4d3]"
                >
                  <span className="w-2 h-2 bg-[#B88E2F] rounded-full shrink-0" />
                  <span>{role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xl border border-[#f0e4d3]">
            <Image
              src={OurTeam}
              alt="The Furniro design and craftsmanship team"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
              <div className="p-6 text-white">
                <p className="text-sm font-semibold">
                  50+ designers, craftspeople & interior specialists
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-8 sm:p-14 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">
            Ready to Transform Your Space?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Explore our latest living, dining, and bedroom collections or speak
            with our interior specialists for personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-[#B88E2F] text-white px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-[#9f7924] transition-colors shadow-sm"
            >
              <span>Explore Our Collections</span>
              <FiArrowRight />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#B88E2F] text-[#B88E2F] px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-[#B88E2F] hover:text-white transition-colors"
            >
              <span>Book a Consultation</span>
            </Link>
          </div>
        </div>
      </div>

      <ServiceBar />
    </section>
  );
};

export default About;
