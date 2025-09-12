"use client";

import { useState } from "react";
import ProductCard from "@/app/components/cards/ProductCard";

import Link from "next/link";

const OurProducts = () => {
  const [showProducts, setShowProducts] = useState(8);

  const handleShowMore = () => {
    if (showProducts < 16) {
      setShowProducts((prevProd) => prevProd + 8);
    }
  };
  return (
    <section className="max-w-[1200px] mx-auto  items-center my-16 flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#3A3A3A] text-center">
        Our Products
      </h2>
      <ProductCard showProducts={showProducts} />
      {showProducts < 16 ? (
        <button
          onClick={handleShowMore}
          className="border mx-auto rounded-sm border-[#B88E2F] text-[#B88E2F] text-base font-semibold py-2 px-10 mt-8 sm:mt-4 md:mt-2 hover:text-white hover:bg-[#B88E2F] transition duration-300 py"
        >
          Show More
        </button>
      ) : (
        <Link href="/shop">
          <button className="border mx-auto rounded-sm border-[#B88E2F] text-[#B88E2F] text-base font-semibold py-2 px-10 mt-8 sm:mt-4 md:mt-2 hover:text-white hover:bg-[#B88E2F] transition duration-300 py">
            Discover More
          </button>
        </Link>
      )}
    </section>
  );
};

export default OurProducts;
