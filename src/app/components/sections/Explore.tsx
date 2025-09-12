import Image from "next/image";
import ExploreImage1 from "@/app/public/assets/images/products/ExploreImage1.png";
import ExploreImage2 from "@/app/public/assets/images/products/ExploreImage2.png";
import ExploreImage3 from "@/app/public/assets/images/products/ExploreImage3.png";
import { useState, useEffect } from "react";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";

const Explore = () => {
  const images = [
    { src: ExploreImage1, title: "01 — Bed Room", subtitle: "Inner Peace" },
    { src: ExploreImage2, title: "02 — Living Room", subtitle: "Relaxation" },
    { src: ExploreImage3, title: "03 — Dining Room", subtitle: "Cozy Vibes" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentIndex]);

  return (
    <section className="max-w-[1440px] mx-auto px-8 sm:px-16 lg:px-24 my-16 bg-[#FCF8F3] p-8 shadow-md">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center sm:items-start gap-4 lg:basis-[40%] text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3A3A3A]">
            50+ Beautiful rooms inspiration
          </h2>
          <p className="text-sm sm:text-base text-[#616161]">
            Our designer already made a lot of beautiful prototypes of rooms
            that inspire you
          </p>
          <button className="bg-[#B88E2F] hover:bg-[#b88f2ff8] transition-colors duration-300 rounded-sm py-2 px-6 sm:px-8 text-white text-sm sm:text-base font-semibold mt-4">
            Explore More
          </button>
        </div>

        <div className="relative flex flex-col items-center lg:basis-[60%] w-full">
          <div className="relative w-full h-[400px] overflow-hidden rounded-md">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
            
            <div className="absolute bottom-6 left-6 opacity-80 bg-white p-8 rounded-sm shadow text-[#3A3A3A] z-10 transition-opacity duration-300">
              <p className="text-sm font-semibold">
                {images[currentIndex].title}
              </p>
              <p className="text-sm">{images[currentIndex].subtitle}</p>
            </div>
            
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
              <button
                className="bg-white text-3xl cursor-pointer text-[#B88E2F] rounded-full shadow p-2 hover:bg-[#B88E2F] hover:text-white transition-colors duration-300"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <IoIosArrowDropleft />
              </button>
            </div>
            
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
              <button
                className="bg-white text-3xl cursor-pointer text-[#B88E2F] rounded-full shadow p-2 hover:bg-[#B88E2F] hover:text-white transition-colors duration-300"
                onClick={handleNext}
                aria-label="Next image"
              >
                <IoIosArrowDropright />
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-center mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                  }
                }}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-[#B88E2F] scale-110" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Explore;