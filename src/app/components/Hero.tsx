import Image from "next/image";
import HeroImage from "@/app/public/assets/images/main/Hero.png";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const Hero = () => {
  return (
    <section className="relative max-w-[1440px] mx-auto flex items-center justify-center md:justify-end bg-[#FCF8F3] min-h-[540px] md:h-[650px] px-4 sm:px-8 md:px-14 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={HeroImage}
          alt="Modern Furniro living room collection"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/15 md:bg-transparent" />
      </div>

      {/* Promotional Card */}
      <div className="relative z-10 w-full max-w-[580px] bg-[#FFF4E3]/95 backdrop-blur-xs p-7 sm:p-10 md:p-12 rounded-xl shadow-xl border border-[#f3e3c9]">
        <span className="inline-block text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[#333333] mb-3">
          New Arrival
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-[52px] leading-tight lg:leading-[62px] font-bold text-[#B88E2F] mb-4">
          Discover Our <br className="hidden sm:inline" />
          New Collection
        </h1>
        <p className="text-[#333333] text-sm sm:text-base md:text-lg leading-relaxed mb-8">
          Discover stylish, high-quality furniture crafted to bring lasting
          comfort, warmth, and timeless elegance to every room in your home.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2.5 bg-[#B88E2F] text-white text-sm sm:text-base font-bold uppercase tracking-wider px-10 sm:px-14 py-4 rounded-md shadow-md hover:bg-[#9f7924] hover:shadow-lg transition-all duration-300 group"
        >
          <span>Buy Now</span>
          <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default Hero;
