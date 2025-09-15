"use client";

import { LiaSlidersHSolid } from "react-icons/lia";
import { HiViewGrid } from "react-icons/hi";
import { LuGalleryVertical } from "react-icons/lu";

const ShopFilter = ({
  productsPerPage,
  setProductsPerPage,
  sortBy,
  setSortBy,
}: {
  productsPerPage: number;
  setProductsPerPage: (n: number) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}) => {
  const totalProducts = 24; // ideally from API

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between py-5 px-4 lg:px-6 max-w-[1440px] bg-[#F9F1E7] w-full h-auto lg:h-24 gap-4 lg:gap-0 mb-16">
      <div className="flex items-center lg:gap-[26px]">
        <div className="flex items-center gap-3">
          <LiaSlidersHSolid className="text-2xl cursor-pointer" />
          <p className="text-lg">Filter</p>
        </div>
        <HiViewGrid className="text-2xl cursor-pointer hidden lg:flex" />
        <LuGalleryVertical className="text-2xl cursor-pointer hidden lg:flex" />
        <div className="mx-4 lg:mx-0 h-8 lg:h-10 w-px bg-[#9F9F9F]"></div>
        <div className="text-base">
          Showing {productsPerPage} per page (of {totalProducts})
        </div>
      </div>

      <div className="flex sm:flex-row flex-col items-end sm:items-center gap-4 lg:gap-5">
        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Show</label>
          <input
            type="number"
            value={productsPerPage}
            onChange={(e) => setProductsPerPage(Number(e.target.value) || 10)}
            className="text-base lg:text-lg text-[#9F9F9F] focus:outline-none w-[60px] px-2 lg:px-3 h-[44px]"
          />
        </div>

        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-base lg:text-lg text-[#9F9F9F] focus:outline-none w-[150px] lg:w-[188px] px-3 lg:px-5 h-[44px]"
          >
            <option value="default">Default</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ShopFilter;
