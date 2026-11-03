"use client";

import Image from "next/image";
import Link from "next/link";
import ExploreImage1 from "@/app/public/assets/images/products/ExploreImage1.png";
import ExploreImage2 from "@/app/public/assets/images/products/ExploreImage2.png";
import ExploreImage3 from "@/app/public/assets/images/products/ExploreImage3.png";
import { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

const slides = [
  {
    src: ExploreImage1,
    title: "01 — Bed Room",
    subtitle: "Inner Peace",
    category: "Bedroom",
  },
  {
    src: ExploreImage2,
    title: "02 — Living Room",
    subtitle: "Relaxation",
    category: "Living",
  },
  {
    src: ExploreImage3,
    title: "03 — Dining Room",
    subtitle: "Cozy Vibes",
    category: "Dining",
  },
];

const Explore = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNext, 4500);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  const currentSlide = slides[currentIndex];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 my-16 py-12 sm:py-16 bg-[#FCF8F3] rounded-xl shadow-xs"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Copy & CTA */}
        <div className="flex flex-col items-center lg:items-start gap-4 lg:basis-[38%] text-center lg:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B88E2F]">
            Room Inspiration
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3A3A3A] leading-tight">
            50+ Beautiful rooms inspiration
          </h2>
          <p className="text-sm sm:text-base text-[#616161] leading-relaxed">
            Our designers have crafted inspiring room prototypes so you can
            effortlessly visualize your next living, dining, or bedroom
            makeover.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#B88E2F] hover:bg-[#9f7924] transition-colors duration-300 rounded-md py-3 px-8 text-white text-sm sm:text-base font-semibold mt-2 shadow-sm"
          >
            <span>Explore More</span>
            <FiArrowRight />
          </Link>
        </div>

        {/* Interactive Carousel */}
        <div className="relative flex flex-col items-center lg:basis-[62%] w-full">
          <div className="relative w-full h-[380px] sm:h-[440px] overflow-hidden rounded-xl shadow-md bg-gray-200">
            {slides.map((slide, index) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentIndex
                    ? "opacity-100 scale-100 z-1"
                    : "opacity-0 scale-105 pointer-events-none z-0"
                }`}
              >
                <Image
                  src={slide.src}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            ))}

            {/* Clickable Caption Card */}
            <Link
              href={`/shop?category=${encodeURIComponent(currentSlide.category)}`}
              className="absolute bottom-6 left-6 z-10 flex items-end group"
            >
              <div className="bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-l-md shadow-lg text-[#3A3A3A]">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {currentSlide.title}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 group-hover:text-[#B88E2F] transition-colors">
                  {currentSlide.subtitle}
                </p>
              </div>
              <span className="bg-[#B88E2F] group-hover:bg-[#9f7924] text-white p-3.5 sm:p-4 rounded-r-md shadow-lg transition-colors flex items-center justify-center">
                <FiArrowRight className="text-lg sm:text-xl" />
              </span>
            </Link>

            {/* Prev / Next Controls */}
            <button
              type="button"
              className="absolute top-1/2 left-4 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 text-[#B88E2F] rounded-full shadow-md flex items-center justify-center hover:bg-[#B88E2F] hover:text-white transition-colors duration-200"
              onClick={handlePrevious}
              aria-label="Previous room slide"
            >
              <FiChevronLeft className="text-xl" />
            </button>

            <button
              type="button"
              className="absolute top-1/2 right-4 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 text-[#B88E2F] rounded-full shadow-md flex items-center justify-center hover:bg-[#B88E2F] hover:text-white transition-colors duration-200"
              onClick={handleNext}
              aria-label="Next room slide"
            >
              <FiChevronRight className="text-xl" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex gap-2.5 justify-center mt-5">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.subtitle}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-[#B88E2F]"
                    : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Explore;
