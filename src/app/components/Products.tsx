"use client";

import OurProducts from "@/app/components/sections/OurProducts";
import Range from "@/app/components/sections/Range";
import Explore from "@/app/components/sections/Explore";

const Products = () => {
  return (
    <div className="my-6">
      {/* Range Section */}
      <Range />
      {/* Product Section */}
      <OurProducts />

      {/* Exploration Section */}
      <Explore />
    </div>
  );
};

export default Products;
