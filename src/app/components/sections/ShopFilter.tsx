"use client";

import { LiaSlidersHSolid } from "react-icons/lia";
// import { HiViewGrid } from "react-icons/hi";
// import { LuGalleryVertical } from "react-icons/lu";

const ShopFilter = ({
  productsPerPage,
  setProductsPerPage,
  sortBy,
  setSortBy,
  totalProducts,
}: {
  productsPerPage: number;
  setProductsPerPage: (n: number) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  totalProducts: number;
}) => {
  // const totalPages = Math.ceil(totalProducts / productsPerPage);
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between py-5 px-4 lg:px-6 max-w-[1440px] bg-[#F9F1E7] rounded-xl shadow-sm border border-[#f0e4d3] w-full h-auto lg:h-24 gap-4 lg:gap-0 mb-16">
      <div className="flex items-center lg:gap-[26px]">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
          <LiaSlidersHSolid className="text-2xl cursor-pointer" />
          <p className="text-lg">Filter</p>
        </div>
        {/* <HiViewGrid className="text-2xl cursor-pointer hidden lg:flex" />
        <LuGalleryVertical className="text-2xl cursor-pointer hidden lg:flex" /> */}
        <div className="mx-4 lg:mx-0 h-8 lg:h-10 w-px bg-[#9F9F9F]"></div>
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
          Showing {productsPerPage} of {totalProducts} products
        </div>
      </div>

      <div className="flex flex-wrap justify-center lg:justify-end items-center gap-4">
        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Show</label>
          <select
            value={productsPerPage}
            onChange={(e) => setProductsPerPage(Number(e.target.value))}
            className="h-11 min-w-[160px] px-4 pr-10 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm cursor-pointer transition-all duration-200 hover:border-[#B88E2F] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F]"

          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
          </select>

        </div>

        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 min-w-[160px] px-4 pr-10 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm cursor-pointer transition-all duration-200 hover:border-[#B88E2F] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F]"
          >
            <option value="new">New</option>
            <option value="old">Old</option>
            <option value="low-price">Low Price</option>
            <option value="high-price">High Price</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ShopFilter;
