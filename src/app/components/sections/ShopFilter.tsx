"use client";

import { useState } from "react";

// import { LiaSlidersHSolid } from "react-icons/lia";
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

  const [sortOpen, setSortOpen] = useState(false);

  const sortOptions = [
    { value: "new", label: "New" },
    { value: "old", label: "Old" },
    { value: "low-price", label: "Low Price" },
    { value: "high-price", label: "High Price" },
  ];


  return (
    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between py-5 px-4 lg:px-6 max-w-[1440px] bg-[#F9F1E7] rounded-xl shadow-sm border border-[#f0e4d3] w-full h-auto lg:h-24 gap-4 lg:gap-0 mb-16">
      <div className="flex items-center lg:gap-[26px]">
        {/* <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
          <LiaSlidersHSolid className="text-2xl cursor-pointer" />
          <p className="text-lg">Filter</p>
        </div> */}
        {/* <HiViewGrid className="text-2xl cursor-pointer hidden lg:flex" />
        <LuGalleryVertical className="text-2xl cursor-pointer hidden lg:flex" /> */}
        {/* <div className="mx-4 lg:mx-0 h-8 lg:h-10 w-px bg-[#9F9F9F]"></div> */}
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
          Showing {productsPerPage} of {totalProducts} products
        </div>
      </div>

      <div className="flex flex-wrap justify-center lg:justify-end items-center gap-4">
        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Show</label>
          <div className="relative">
            <select
              value={productsPerPage}
              onChange={(e) => setProductsPerPage(Number(e.target.value))}
              className="
    appearance-none
    h-11
    w-[90px]
    px-4
    pr-12
    rounded-xl
    border
    border-gray-200
    bg-white
    text-gray-700
    shadow-sm
    cursor-pointer
    hover:border-[#B88E2F]
    focus:outline-none
    focus:ring-2
    focus:ring-[#B88E2F]/30
    transition-all duration-300
hover:shadow-md
hover:-translate-y-[1px]
  "
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              ▼
            </span>
          </div>

        </div>

        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Sort by</label>
          <div className="relative w-[130px]">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between shadow-sm hover:border-[#B88E2F] transition-all"
            >
              <span>
                {sortOptions.find((o) => o.value === sortBy)?.label}
              </span>
              <span
                className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""
                  }`}
              >
                ▼
              </span>
            </button>

            {sortOpen && (
              <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#F9F1E7] transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopFilter;
