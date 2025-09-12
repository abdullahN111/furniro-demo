import Image from "next/image";
import { FiShare2 } from "react-icons/fi";

import CollectionImage1 from "@/app/public/assets/images/featured/Rectangle 37.png";
import CollectionImage2 from "@/app/public/assets/images/featured/Rectangle 40.png";
import CollectionImage3 from "@/app/public/assets/images/featured/Rectangle 43.png";
import CollectionImage4 from "@/app/public/assets/images/featured/Rectangle 45.png";
import CollectionImage5 from "@/app/public/assets/images/featured/Rectangle 39.png";
import CollectionImage6 from "@/app/public/assets/images/featured/Rectangle 41.png";
import CollectionImage7 from "@/app/public/assets/images/featured/Rectangle 44.png";
import CollectionImage8 from "@/app/public/assets/images/featured/Rectangle 38.png";

const CollectionSetup = () => {
  const images = [
    CollectionImage1, CollectionImage2, CollectionImage3, CollectionImage4,
    CollectionImage5, CollectionImage6, CollectionImage7, CollectionImage8
  ];

  return (
    <section className="max-w-[1440px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
 
    

  
      <div className="text-center mb-8">
        <h5 className="text-lg font-medium text-gray-600 mb-2">
          Share your setup with
        </h5>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <FiShare2 className="text-[#B88E2F]" />
          #FuniroFurniture
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6 mb-12">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative w-full aspect-square overflow-hidden group cursor-pointer"
          >
            <Image
              src={image}
              alt={`Setup ${index + 1}`}
              fill
              className="object-cover rounded-md shadow-md transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <button className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-[#B88E2F] px-4 py-2 rounded-md font-medium">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="bg-[#B88E2F] hover:bg-[#a57d28] text-white font-medium py-3 px-8 rounded-md transition-colors duration-300 shadow-md hover:shadow-lg">
          Share Your Setup
        </button>
      </div>
    </section>
  );
};

export default CollectionSetup;